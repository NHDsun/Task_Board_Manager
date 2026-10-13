import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { AuthUserPayload } from '../../common/interfaces/auth-user.interface';

@Injectable()
export class TaskSubtaskService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway
  ) {}

  async addSubtask(
    taskId: string,
    body: {
      title: string;
      assigneeId?: string;
      startDate?: string;
      estimatedDays?: number;
      dueDate?: string;
      isUrgent?: boolean;
    },
    user?: AuthUserPayload
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        subtasks: true,
        project: {
          select: {
            id: true,
            isCompleted: true,
            managerId: true,
            createdById: true,
          },
        },
      },
    });
    if (!task || task.isDeleted) {
      throw new NotFoundException('Task không tồn tại hoặc đã bị xóa vào thùng rác');
    }

    if (task.project?.isCompleted) {
      throw new BadRequestException('Dự án này đã hoàn thành/nghiệm thu và đã được đóng. Không thể thêm Task con mới!');
    }

    if (task.isArchived) {
      throw new BadRequestException('Task này đã được lưu trữ (Archived). Không thể thêm Task con mới!');
    }

    const isAdminOrManagerUser = Boolean(
      user &&
      (user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER' ||
        task.project?.managerId === user.id ||
        task.project?.createdById === user.id)
    );
    const isTaskAssignee = user && task.assigneeId === user.id;

    if (task.status === 'DONE' && !isAdminOrManagerUser && !isTaskAssignee) {
      throw new BadRequestException(
        'Task đã hoàn thành (DONE). Chỉ Quản lý/Admin hoặc người đảm nhiệm mới có quyền thêm Task con để mở lại nhiệm vụ.'
      );
    }

    if (task.status === 'PAUSED' || task.status === 'BLOCKED') {
      throw new BadRequestException(
        `Task đang ở trạng thái ${task.status === 'PAUSED' ? 'Tạm Dừng' : 'Bị Nghẽn'}. Vui lòng khôi phục trạng thái Đang Thực Hiện trước khi thêm Task con!`
      );
    }

    if (task.status === 'IN_REVIEW') {
      const pendingTransfer = await this.prisma.taskRequest.findFirst({
        where: { taskId, type: 'TRANSFER', status: 'PENDING' },
      });
      if (pendingTransfer) {
        throw new BadRequestException(
          'Task đang trong trạng thái Chờ Duyệt Bàn Giao (IN_REVIEW). Vui lòng hoàn tất hoặc hủy bàn giao trước khi thêm Task con mới.'
        );
      }
    }

    if (user) {
      const isAdminOrManager = Boolean(
        user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER' ||
        task.project?.managerId === user.id ||
        task.project?.createdById === user.id
      );
      const isAssignee = task.assigneeId === user.id;
      const isUnassignedAndCreator = !task.assigneeId && task.createdById === user.id;

      if (!isAdminOrManager && !isAssignee && !isUnassignedAndCreator) {
        throw new ForbiddenException(
          'Chỉ người trực tiếp đảm nhiệm Task (Assignee) hoặc Quản lý/Admin mới có quyền tạo Task con!'
        );
      }
    }

    const effectiveSubtaskAssigneeId = body.assigneeId || user?.id || task.assigneeId || undefined;
    if (effectiveSubtaskAssigneeId) {
      const isMember = await this.prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId: effectiveSubtaskAssigneeId },
      });
      const isProjectAdminOrManager =
        task.project?.managerId === effectiveSubtaskAssigneeId ||
        task.project?.createdById === effectiveSubtaskAssigneeId;
      if (!isMember && !isProjectAdminOrManager) {
        throw new BadRequestException('Nhân sự được giao Task con không thuộc thành viên của dự án này.');
      }
    }

    const estimatedDays =
      body.estimatedDays && Number(body.estimatedDays) > 0 ? Math.max(1, Math.floor(Number(body.estimatedDays))) : 1;
    let parsedSubtaskStartDate: Date | null = null;
    let parsedSubtaskDueDate: Date | null = null;

    if (body.startDate) {
      parsedSubtaskStartDate = new Date(body.startDate);
      if (task.startDate && parsedSubtaskStartDate.getTime() < new Date(task.startDate).getTime()) {
        await this.prisma.task.update({
          where: { id: taskId },
          data: { startDate: parsedSubtaskStartDate },
        });
      }
    }

    if (body.dueDate) {
      parsedSubtaskDueDate = new Date(body.dueDate);
    } else if (parsedSubtaskStartDate) {
      const calcDue = new Date(parsedSubtaskStartDate);
      calcDue.setDate(calcDue.getDate() + estimatedDays);
      parsedSubtaskDueDate = calcDue;
    }

    const nextOrder = task.subtasks.length;
    await this.prisma.subtask.create({
      data: {
        taskId,
        title: body.title.trim(),
        assigneeId: effectiveSubtaskAssigneeId,
        startDate: parsedSubtaskStartDate || undefined,
        estimatedDays,
        dueDate: parsedSubtaskDueDate || undefined,
        isUrgent: Boolean(body.isUrgent),
        order: nextOrder,
        isDone: false,
      },
    });

    if (body.isUrgent) {
      try {
        const assigneeUser = effectiveSubtaskAssigneeId
          ? await this.prisma.user.findUnique({ where: { id: effectiveSubtaskAssigneeId } })
          : null;
        await this.prisma.comment.create({
          data: {
            taskId,
            userId: user?.id || task.createdById,
            content: `🔥 [THÔNG BÁO KHẨN CẤP] Việc con "${body.title.trim()}" đã được gắn cờ KHẨN CẤP (URGENT). ${assigneeUser ? `Người phụ trách: @${assigneeUser.fullName}` : 'Task con chưa phân công'} cần ưu tiên xử lý ngay!`,
          },
        });
      } catch {}
    }

    return this.recalculateTaskProgress(taskId, task.projectId);
  }

  async updateSubtask(
    subtaskId: string,
    body: {
      isDone?: boolean;
      title?: string;
      assigneeId?: string;
      startDate?: string;
      estimatedDays?: number;
      dueDate?: string;
      isUrgent?: boolean;
    },
    user?: AuthUserPayload
  ) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: {
        task: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                managerId: true,
                createdById: true,
                isCompleted: true,
              },
            },
            assignee: { select: { id: true, fullName: true } },
          },
        },
      },
    });
    if (!subtask || subtask.task.isDeleted) {
      throw new NotFoundException('Task con không tồn tại hoặc Task cha đã bị xóa vào thùng rác');
    }

    if (subtask.task.isArchived) {
      throw new BadRequestException('Task này đã được lưu trữ (Archived). Không thể cập nhật Task con!');
    }

    if (subtask.task.project?.isCompleted) {
      throw new BadRequestException('Dự án này đã hoàn thành/nghiệm thu và đã đóng. Không thể cập nhật Task con!');
    }

    if (subtask.isDone) {
      if (
        body.isDone !== undefined ||
        body.title !== undefined ||
        body.dueDate !== undefined ||
        body.startDate !== undefined ||
        body.estimatedDays !== undefined ||
        body.assigneeId !== undefined
      ) {
        throw new BadRequestException(
          'Task con này đã hoàn thành và được xác nhận. Chỉ Quản lý mới có quyền mở lại (REOPEN) trước khi chỉnh sửa nội dung.'
        );
      }
    }

    if (body.assigneeId) {
      const isMember = await this.prisma.projectMember.findFirst({
        where: { projectId: subtask.task.projectId, userId: body.assigneeId },
      });
      const isProjectAdminOrManager =
        subtask.task.project?.managerId === body.assigneeId || subtask.task.project?.createdById === body.assigneeId;
      if (!isMember && !isProjectAdminOrManager) {
        throw new BadRequestException('Nhân sự được giao Task con không thuộc thành viên của dự án này.');
      }
    }

    if (body.dueDate) {
      const parsedSubtaskDueDate = new Date(body.dueDate);
      if (subtask.task.dueDate && parsedSubtaskDueDate.getTime() > new Date(subtask.task.dueDate).getTime()) {
        throw new BadRequestException('Hạn chót của Task con không thể vượt quá hạn chót tổng của Task cha!');
      }
      if (subtask.task.startDate && parsedSubtaskDueDate.getTime() < new Date(subtask.task.startDate).getTime()) {
        throw new BadRequestException('Hạn chót của Task con không thể trước ngày bắt đầu của Task cha!');
      }
    }

    const isAdminOrManager = Boolean(
      user &&
      (user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER' ||
        subtask.task.project.managerId === user.id ||
        subtask.task.project.createdById === user.id ||
        subtask.task.createdById === user.id)
    );

    if (body.isDone !== undefined && (subtask.task.status === 'PAUSED' || subtask.task.status === 'BLOCKED')) {
      throw new BadRequestException(
        `Task này đang ở trạng thái ${subtask.task.status === 'PAUSED' ? 'Tạm Dừng' : 'Bị Nghẽn'}, không thể nộp duyệt Task con.`
      );
    }

    const effectiveAssigneeId = subtask.assigneeId || subtask.task.assigneeId;
    if (!effectiveAssigneeId && body.isDone !== undefined) {
      throw new BadRequestException(
        'Task này chưa được chỉ định người làm. Vui lòng phân công nhân sự trước khi thực hiện.'
      );
    }

    const isWorkerDoingTask = Boolean(user && effectiveAssigneeId === user.id);

    if (body.isDone !== undefined) {
      if (!isWorkerDoingTask && !isAdminOrManager) {
        throw new ForbiddenException('Chỉ người trực tiếp thực hiện Task mới có quyền đánh dấu hoàn thành Task con.');
      }
    }

    const isCreator = Boolean(user && subtask.task.createdById === user.id);
    if (user && !isAdminOrManager && !isWorkerDoingTask && !isCreator) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa Task con này');
    }

    const updateData: any = {};
    if (body.isUrgent !== undefined) {
      if (subtask.isDone) {
        throw new BadRequestException('Không thể thay đổi mức độ khẩn cấp của Task con đã hoàn thành.');
      }
      updateData.isUrgent = Boolean(body.isUrgent);

      if (body.isUrgent === true && !subtask.isUrgent) {
        try {
          const targetAssigneeId = body.assigneeId || subtask.assigneeId;
          const assigneeUser = targetAssigneeId
            ? await this.prisma.user.findUnique({ where: { id: targetAssigneeId } })
            : null;
          await this.prisma.comment.create({
            data: {
              taskId: subtask.taskId,
              userId: user?.id || subtask.task.createdById,
              content: `🔥 [THÔNG BÁO KHẨN CẤP] Việc con "${subtask.title}" đã được chuyển sang chế độ KHẨN CẤP (URGENT). ${assigneeUser ? `Người phụ trách: @${assigneeUser.fullName}` : 'Task con'} cần ưu tiên xử lý ngay!`,
            },
          });
        } catch {}
      }
    }
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId || null;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    if (body.estimatedDays !== undefined) {
      if (!isAdminOrManager) {
        throw new ForbiddenException(
          'Chỉ Quản lý hoặc Người tạo Task mới có quyền thay đổi thời gian ước lượng của Task con.'
        );
      }
      updateData.estimatedDays = Math.max(1, Math.round(Number(body.estimatedDays)));
    }

    if (body.isDone !== undefined) {
      if (body.isDone === true) {
        if (isAdminOrManager) {
          updateData.isDone = true;
          updateData.approvalStatus = 'APPROVED';
          updateData.rejectionReason = null;

          await this.prisma.taskRequest.updateMany({
            where: {
              taskId: subtask.taskId,
              type: 'SUBTASK_APPROVAL',
              note: { contains: subtaskId },
              status: 'PENDING',
            },
            data: {
              status: 'ACCEPTED',
              responseNote: `Được Quản lý/Admin ${user?.fullName || ''} phê duyệt hoàn thành trực tiếp.`,
            },
          });
        } else {
          updateData.isDone = false;
          updateData.approvalStatus = 'PENDING';
          updateData.rejectionReason = null;

          const receiverId =
            subtask.task.project.managerId || subtask.task.project.createdById || subtask.task.createdById;
          if (receiverId && user) {
            await this.prisma.taskRequest.create({
              data: {
                taskId: subtask.taskId,
                senderId: user.id,
                receiverId,
                type: 'SUBTASK_APPROVAL',
                status: 'PENDING',
                note: `[Xác thực hoàn thành] ${subtask.title} (SubtaskId: ${subtaskId})`,
              },
            });

            this.socketGateway.broadcastToProject(subtask.task.projectId, 'task:approval-requested', {
              subtaskId,
              taskId: subtask.taskId,
              subtaskTitle: subtask.title,
              senderName: user.fullName || 'Nhân viên',
              taskTitle: subtask.task.title,
            });
          }
        }
      } else {
        updateData.isDone = false;
        updateData.approvalStatus = 'NONE';
      }
    }

    await this.prisma.subtask.update({
      where: { id: subtaskId },
      data: updateData,
    });

    return this.recalculateTaskProgress(subtask.taskId, subtask.task.projectId);
  }

  async reviewSubtask(
    subtaskId: string,
    body: { action: 'APPROVE' | 'REJECT' | 'REOPEN'; reason?: string },
    user: AuthUserPayload
  ) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: {
        task: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                managerId: true,
                createdById: true,
              },
            },
            assignee: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });
    if (!subtask) {
      throw new NotFoundException('Công việc con không tồn tại');
    }

    const isAdminOrManager = Boolean(
      user &&
      (user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER' ||
        subtask.task.project.managerId === user.id ||
        subtask.task.project.createdById === user.id ||
        subtask.task.createdById === user.id)
    );

    if (!isAdminOrManager) {
      throw new ForbiddenException('Chỉ Quản lý hoặc Người tạo Task mới có quyền duyệt/mở lại Task con này');
    }

    const updateData: any = {};
    if (body.action === 'APPROVE') {
      updateData.isDone = true;
      updateData.approvalStatus = 'APPROVED';
      updateData.rejectionReason = null;
    } else if (body.action === 'REOPEN') {
      updateData.isDone = false;
      updateData.approvalStatus = 'NONE';
      updateData.rejectionReason = body.reason?.trim() || 'Quản lý đã mở lại Task con để kiểm tra lại.';
    } else {
      updateData.isDone = false;
      updateData.approvalStatus = 'REJECTED';
      updateData.rejectionReason = body.reason?.trim() || 'Chưa đạt yêu cầu, vui lòng kiểm tra và làm lại.';
    }

    await this.prisma.subtask.update({
      where: { id: subtaskId },
      data: updateData,
    });

    await this.prisma.taskRequest.updateMany({
      where: {
        taskId: subtask.taskId,
        type: 'SUBTASK_APPROVAL',
        note: { contains: subtaskId },
        status: 'PENDING',
      },
      data: {
        status: body.action === 'APPROVE' ? 'ACCEPTED' : 'REJECTED',
        responseNote: body.action === 'APPROVE' ? 'Đã phê duyệt hoàn thành' : body.reason,
      },
    });

    if ((body.action === 'REOPEN' || body.action === 'REJECT') && subtask.task.status === 'DONE') {
      await this.prisma.task.update({
        where: { id: subtask.taskId },
        data: {
          status: 'IN_PROGRESS',
          completedAt: null,
        },
      });
    }

    const mapped = await this.recalculateTaskProgress(subtask.taskId, subtask.task.projectId);

    this.socketGateway.broadcastToProject(subtask.task.projectId, 'task:subtask-reviewed', {
      subtaskId,
      taskId: subtask.taskId,
      action: body.action,
      reason: body.reason,
      reviewerName: user.fullName || 'Quản lý',
      subtaskTitle: subtask.title,
    });

    return mapped;
  }

  async deleteSubtask(subtaskId: string, user?: AuthUserPayload) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: {
        task: {
          include: {
            project: { select: { managerId: true, createdById: true, isCompleted: true } },
          },
        },
      },
    });
    if (!subtask || subtask.task.isDeleted) {
      throw new NotFoundException('Task con không tồn tại hoặc Task cha đã bị xóa vào thùng rác');
    }

    if (subtask.task.isArchived) {
      throw new BadRequestException('Task này đã được lưu trữ (Archived). Không thể xóa Task con!');
    }
    if (subtask.task.project?.isCompleted) {
      throw new BadRequestException('Dự án này đã hoàn thành/nghiệm thu và đã đóng. Không thể xóa Task con!');
    }

    const isAdminOrManager = Boolean(
      user &&
      (user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER' ||
        subtask.task.project?.managerId === user.id ||
        subtask.task.project?.createdById === user.id ||
        subtask.task.createdById === user.id)
    );

    if (subtask.isDone && !isAdminOrManager) {
      throw new ForbiddenException('Task con này đã hoàn thành và được phê duyệt. Chỉ Quản lý mới có quyền xóa!');
    }

    if (user) {
      const isAssignee = subtask.task.assigneeId === user.id;
      const isCreator = subtask.task.createdById === user.id;
      if (!isAdminOrManager && !isAssignee && !isCreator) {
        throw new ForbiddenException('Bạn không có quyền xóa Task con này');
      }
    }

    await this.prisma.taskRequest.updateMany({
      where: {
        taskId: subtask.taskId,
        type: 'SUBTASK_APPROVAL',
        note: { contains: subtaskId },
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
        responseNote: 'Task con đã bị xóa khỏi hệ thống.',
      },
    });

    await this.prisma.subtask.delete({
      where: { id: subtaskId },
    });

    return this.recalculateTaskProgress(subtask.taskId, subtask.task.projectId);
  }

  public async recalculateTaskProgress(taskId: string, projectId: string) {
    const subtasks = await this.prisma.subtask.findMany({
      where: { taskId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        assignee: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    let newProgress = 0;
    let totalEstimatedDays = 0;
    let completedEstimatedDays = 0;
    if (subtasks.length > 0) {
      for (const st of subtasks) {
        const days = Number(st.estimatedDays || 1);
        totalEstimatedDays += days;
        if (st.isDone) {
          completedEstimatedDays += days;
        }
      }
      newProgress = totalEstimatedDays > 0 ? Math.round((completedEstimatedDays / totalEstimatedDays) * 100) : 0;
    }

    const currentTask = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        startDate: true,
        createdAt: true,
        status: true,
        completedAt: true,
      },
    });

    const updateTaskData: any = { progress: newProgress };

    const hasUnfinishedUrgentSubtasks = subtasks.some((st) => st.isUrgent && !st.isDone);
    updateTaskData.priority = hasUnfinishedUrgentSubtasks ? 'URGENT' : 'NORMAL';

    if (newProgress === 100 && currentTask && currentTask.status !== 'DONE') {
      updateTaskData.status = 'DONE';
      updateTaskData.completedAt = currentTask.completedAt || new Date();
    } else if (newProgress < 100 && currentTask && currentTask.status === 'DONE') {
      updateTaskData.status = 'IN_PROGRESS';
      updateTaskData.completedAt = null;
    }

    if (currentTask && subtasks.length > 0) {
      let maxSubtaskDueDate: Date | null = null;
      let hasCustomSubtaskDate = false;

      for (const st of subtasks) {
        if (st.dueDate) {
          hasCustomSubtaskDate = true;
          const d = new Date(st.dueDate);
          if (!maxSubtaskDueDate || d.getTime() > maxSubtaskDueDate.getTime()) {
            maxSubtaskDueDate = d;
          }
        } else if (st.startDate) {
          hasCustomSubtaskDate = true;
          const d = new Date(st.startDate);
          d.setDate(d.getDate() + Number(st.estimatedDays || 1));
          if (!maxSubtaskDueDate || d.getTime() > maxSubtaskDueDate.getTime()) {
            maxSubtaskDueDate = d;
          }
        }
      }

      if (hasCustomSubtaskDate && maxSubtaskDueDate) {
        updateTaskData.dueDate = maxSubtaskDueDate;
      } else if (totalEstimatedDays > 0) {
        const baseDate = currentTask.startDate ? new Date(currentTask.startDate) : new Date(currentTask.createdAt);
        baseDate.setHours(0, 0, 0, 0);
        const calculatedDueDate = new Date(baseDate);
        calculatedDueDate.setDate(calculatedDueDate.getDate() + totalEstimatedDays);
        updateTaskData.dueDate = calculatedDueDate;
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: updateTaskData,
      include: {
        project: { select: { id: true, name: true } },
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            profession: true,
          },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        tags: { include: { tag: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, fullName: true, avatar: true } },
          },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
        attachments: true,
        _count: { select: { comments: true } },
      },
    });

    const mapped = this.mapTaskResponse(updatedTask);
    this.socketGateway.broadcastToProject(projectId, 'task:updated', mapped);

    return mapped;
  }

  mapTaskResponse(t: any) {
    return {
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      status: t.status,
      priority: t.priority,
      progress: t.progress,
      startDate: t.startDate ? t.startDate.toISOString().slice(0, 10) : undefined,
      dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : undefined,
      projectName: t.project?.name || 'Solaris Core',
      assigneeId: t.assigneeId || undefined,
      assignee: t.assignee
        ? {
            id: t.assignee.id,
            fullName: t.assignee.fullName,
            avatar: t.assignee.avatar || undefined,
            profession: t.assignee.profession,
          }
        : undefined,
      assignees: (() => {
        const distinctMap = new Map<string, any>();
        if (t.assignee) {
          distinctMap.set(t.assignee.id, {
            id: t.assignee.id,
            fullName: t.assignee.fullName,
            avatar: t.assignee.avatar || undefined,
            profession: t.assignee.profession,
          });
        }
        if (t.subtasks && Array.isArray(t.subtasks)) {
          for (const st of t.subtasks) {
            if (st.assignee && !distinctMap.has(st.assignee.id)) {
              distinctMap.set(st.assignee.id, {
                id: st.assignee.id,
                fullName: st.assignee.fullName,
                avatar: st.assignee.avatar || undefined,
                profession: st.assignee.profession,
              });
            }
          }
        }
        return Array.from(distinctMap.values());
      })(),
      createdById: t.createdById,
      createdAt: t.createdAt ? t.createdAt.toISOString() : undefined,
      createdBy: t.createdBy
        ? {
            id: t.createdBy.id,
            fullName: t.createdBy.fullName,
            avatar: t.createdBy.avatar || undefined,
          }
        : undefined,
      transferInfo:
        t.taskRequests && t.taskRequests.length > 0
          ? {
              senderName: t.taskRequests[0].sender.fullName,
              senderAvatar: t.taskRequests[0].sender.avatar || '',
              receiverName: t.taskRequests[0].receiver.fullName,
              receiverAvatar: t.taskRequests[0].receiver.avatar || '',
              note: t.taskRequests[0].note || '',
            }
          : undefined,
      commentsCount: t._count?.comments || 0,
      stageId: t.stageId || undefined,
      subtasks: t.subtasks
        ? t.subtasks.map((st: any) => ({
            id: st.id,
            title: st.title,
            isDone: Boolean(st.isDone),
            isUrgent: Boolean(st.isUrgent),
            approvalStatus: st.approvalStatus || (st.isDone ? 'APPROVED' : 'NONE'),
            rejectionReason: st.rejectionReason || undefined,
            order: st.order || 0,
            assigneeId: st.assigneeId || undefined,
            startDate: st.startDate ? st.startDate.toISOString().slice(0, 10) : undefined,
            estimatedDays: st.estimatedDays ? Number(st.estimatedDays) : 1,
            assignee: st.assignee
              ? {
                  id: st.assignee.id,
                  fullName: st.assignee.fullName,
                  avatar: st.assignee.avatar || undefined,
                }
              : undefined,
            dueDate: st.dueDate ? st.dueDate.toISOString().slice(0, 10) : undefined,
            createdAt: st.createdAt ? st.createdAt.toISOString() : undefined,
          }))
        : [],
      attachments: t.attachments
        ? t.attachments.map((att: any) => ({
            id: att.id,
            name: att.name,
            url: att.url,
            type: att.type,
            size: att.size || undefined,
            createdAt: att.createdAt ? att.createdAt.toISOString() : undefined,
          }))
        : [],
    };
  }
}
