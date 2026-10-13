import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { QueryTaskFilterDto } from './dto/query-task-filter.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { SocketGateway } from '../socket/socket.gateway';
import { NotificationService } from '../notification/notification.service';
import { TaskActivityService } from './task-activity.service';
import { TaskSubtaskService } from './task-subtask.service';
import { TaskAttachmentService } from './task-attachment.service';
import { TaskCommentService } from './task-comment.service';
import { TaskRequestService } from './task-request.service';
import { TaskStatus } from '@prisma/client';
import { AuthUserPayload } from '../../common/interfaces/auth-user.interface';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
    private notificationService: NotificationService,
    private activityService: TaskActivityService,
    private subtaskService: TaskSubtaskService,
    private attachmentService: TaskAttachmentService,
    private commentService: TaskCommentService,
    private requestService: TaskRequestService
  ) {}

  async findAll(query?: QueryTaskFilterDto) {
    const where: any = {
      isArchived: false,
      isDeleted: false,
    };

    if (query?.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (query?.projectId && query.projectId !== 'ALL') {
      where.projectId = query.projectId;
    }

    if (query?.assigneeId && query.assigneeId !== 'ALL') {
      where.OR = [
        ...(where.OR || []),
        { assigneeId: query.assigneeId },
        { subtasks: { some: { assigneeId: query.assigneeId } } },
      ];
    }

    if (query?.status && (query.status as string) !== 'ALL') {
      where.status = query.status;
    }

    if (query?.priority && (query.priority as string) !== 'ALL') {
      where.priority = query.priority;
    }

    if (query?.profession && (query.profession as string) !== 'ALL') {
      where.assignee = { profession: query.profession };
    }

    const page = query?.page ? Math.max(1, Number(query.page)) : undefined;
    const limit = query?.limit ? Math.min(200, Math.max(1, Number(query.limit))) : undefined;
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit || undefined;

    const tasks = await this.prisma.task.findMany({
      where,
      skip,
      take,
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
        taskRequests: {
          where: { status: 'PENDING' },
          include: {
            sender: {
              select: { id: true, fullName: true, avatar: true, email: true },
            },
            receiver: {
              select: { id: true, fullName: true, avatar: true, email: true },
            },
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { comments: true } },
      },
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
    });

    return tasks.map((t) => this.mapTaskResponse(t));
  }

  async create(userId: string, createTaskDto: CreateTaskDto) {
    let parsedStartDate: Date | null = null;
    if (createTaskDto.startDate) {
      parsedStartDate = new Date(createTaskDto.startDate);
    }

    let parsedDueDate: Date | null = null;
    if (createTaskDto.dueDate) {
      parsedDueDate = new Date(createTaskDto.dueDate);
      const startOrToday = parsedStartDate ? new Date(parsedStartDate) : new Date();
      startOrToday.setHours(0, 0, 0, 0);

      const targetDueDate = new Date(parsedDueDate);
      targetDueDate.setHours(0, 0, 0, 0);

      if (targetDueDate.getTime() < startOrToday.getTime()) {
        throw new BadRequestException('Hạn Deadline (due date) phải lớn hơn hoặc bằng Ngày Bắt Đầu!');
      }
    }

    // 🔒 [LC-69] KIỂM TRA DỰ ÁN VÀ CHẶN TẠO TASK VÀO DỰ ÁN ĐÃ HOÀN THÀNH
    const project = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId },
      include: { members: true },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }
    if (project.isCompleted) {
      throw new BadRequestException('Dự án này đã hoàn thành/nghiệm thu và đã được đóng. Không thể tạo thêm Task mới!');
    }

    const validMemberIds = new Set([
      ...(project.managerId ? [project.managerId] : []),
      ...(project.createdById ? [project.createdById] : []),
      ...project.members.map((m) => m.userId),
    ]);

    // 🔒 Kiểm tra người được giao Task cha có thuộc dự án không
    if (createTaskDto.assigneeId && !validMemberIds.has(createTaskDto.assigneeId)) {
      throw new BadRequestException('Người được phân công không thuộc thành viên của Dự án này!');
    }

    // 🔒 [LC-66] KIỂM TRA TẤT CẢ NGƯỜI ĐƯỢC GIAO TASK CON CÓ THUỘC THÀNH VIÊN DỰ ÁN KHÔNG
    if (createTaskDto.subtasks && Array.isArray(createTaskDto.subtasks)) {
      for (const st of createTaskDto.subtasks) {
        if (st.assigneeId && !validMemberIds.has(st.assigneeId)) {
          throw new BadRequestException(
            `Nhân sự được giao Task con "${st.title || ''}" không thuộc thành viên của Dự án này!`
          );
        }
      }
    }

    // 🚨 Tự động suy ra độ ưu tiên Task lớn từ các Việc Con
    let calculatedPriority = createTaskDto.priority || 'NORMAL';
    if (createTaskDto.subtasks && createTaskDto.subtasks.some((st) => st.isUrgent)) {
      calculatedPriority = 'URGENT';
    }

    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || 'TODO',
        priority: calculatedPriority,
        progress: createTaskDto.progress || 0,
        projectId: createTaskDto.projectId,
        assigneeId: createTaskDto.assigneeId || userId,
        createdById: userId,
        startDate: parsedStartDate,
        dueDate: parsedDueDate,
        stageId: createTaskDto.stageId || 'stage_1',
      },
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
        attachments: true,
      },
    });

    // 🔔 [LC-81] BẮN THÔNG BÁO GIAO VIỆC CHO NGƯỜI ĐƯỢC PHÂN CÔNG
    if (task.assigneeId && task.assigneeId !== userId) {
      await this.notificationService.sendNotification({
        userId: task.assigneeId,
        actorId: userId,
        title: '📋 Bạn được giao Task mới',
        content: `Bạn vừa được giao phụ trách Task "${task.title}".`,
        type: 'TASK_ASSIGNED',
        taskId: task.id,
        projectId: task.projectId,
      });
    }

    // 🏷️ [LC-76] TỰ ĐỘNG XỬ LÝ & KHỬ TRÙNG LẶP THẺ NHÃN (TAGS)
    if (createTaskDto.tagNames && Array.isArray(createTaskDto.tagNames) && createTaskDto.tagNames.length > 0) {
      for (const rawTagName of createTaskDto.tagNames) {
        const cleanName = rawTagName?.trim();
        if (cleanName) {
          let tag = await this.prisma.tag.findFirst({
            where: {
              projectId: createTaskDto.projectId,
              name: { equals: cleanName, mode: 'insensitive' },
            },
          });
          if (!tag) {
            tag = await this.prisma.tag.create({
              data: {
                name: cleanName,
                projectId: createTaskDto.projectId,
                color: 'amber',
              },
            });
          }
          await this.prisma.taskTag.upsert({
            where: {
              taskId_tagId: { taskId: task.id, tagId: tag.id },
            },
            create: { taskId: task.id, tagId: tag.id },
            update: {},
          });
        }
      }
    }
    if (createTaskDto.subtasks && Array.isArray(createTaskDto.subtasks) && createTaskDto.subtasks.length > 0) {
      for (let i = 0; i < createTaskDto.subtasks.length; i++) {
        const item = createTaskDto.subtasks[i];
        if (item.title && item.title.trim()) {
          await this.prisma.subtask.create({
            data: {
              taskId: task.id,
              title: item.title.trim(),
              isUrgent: Boolean(item.isUrgent),
              order: i,
              isDone: false,
              assigneeId: item.assigneeId || undefined,
              startDate: item.startDate ? new Date(item.startDate) : undefined,
              estimatedDays: item.estimatedDays ? Number(item.estimatedDays) : 1,
              dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
            },
          });
        }
      }
    } else if (
      createTaskDto.subtaskTitles &&
      Array.isArray(createTaskDto.subtaskTitles) &&
      createTaskDto.subtaskTitles.length > 0
    ) {
      for (let i = 0; i < createTaskDto.subtaskTitles.length; i++) {
        const titleStr = createTaskDto.subtaskTitles[i];
        if (titleStr && titleStr.trim()) {
          await this.prisma.subtask.create({
            data: {
              taskId: task.id,
              title: titleStr.trim(),
              isUrgent: false,
              order: i,
              isDone: false,
              estimatedDays: 1,
            },
          });
        }
      }
    }

    const taskWithSubtasks = await this.prisma.task.findUnique({
      where: { id: task.id },
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
      },
    });

    const createdTask = this.mapTaskResponse(taskWithSubtasks);

    if (task.projectId) {
      this.socketGateway.broadcastToProject(task.projectId, 'task:created', createdTask);
    }

    return createdTask;
  }

  async findByProject(projectId: string) {
    return this.findAll({ projectId });
  }

  async updateDescription(id: string, description: string, user?: AuthUserPayload) {
    const updatedTask = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id },
        include: {
          assignee: true,
          createdBy: true,
        },
      });
      if (!task || task.isDeleted) {
        throw new NotFoundException('Task không tồn tại hoặc đã bị xóa vào thùng rác');
      }

      // 🔒 [LC-32] ĐÓNG BĂNG CHỈNH SỬA NỘI DUNG KHI TASK ĐANG BỊ TẠM DỪNG HOẶC BỊ NGHẼN
      const isManagerOrAdmin =
        user &&
        (user.role === 'ADMIN' ||
          user.role === 'MANAGER' ||
          user.globalRole === 'ADMIN' ||
          user.globalRole === 'MANAGER');
      if ((task.status === 'PAUSED' || task.status === 'BLOCKED') && !isManagerOrAdmin) {
        throw new BadRequestException(
          'Task đang ở trạng thái Tạm Dừng hoặc Bị Nghẽn. Không thể chỉnh sửa mô tả cho đến khi Task được khôi phục trạng thái Đang Thực Hiện.'
        );
      }

      // Check ownership: ADMIN, MANAGER, or Assignee (nếu chưa giao việc thì Creator)
      let isAllowed = false;
      if (!user || isManagerOrAdmin) {
        isAllowed = true;
      } else {
        const userId = user.id;
        const userEmail = user.email;

        const isAssignee =
          task.assigneeId === userId ||
          (task.assignee && task.assignee.email === userEmail) ||
          (task.assignee && task.assignee.id === userId);

        const isCreatorUnassigned =
          !task.assigneeId &&
          (task.createdById === userId ||
            (task.createdBy && task.createdBy.email === userEmail) ||
            (task.createdBy && task.createdBy.id === userId));

        if (isAssignee || isCreatorUnassigned) {
          isAllowed = true;
        }
      }

      if (!isAllowed) {
        throw new ForbiddenException('Chỉ chủ sở hữu hoặc người được giao mới có quyền sửa mô tả Task');
      }

      return tx.task.update({
        where: { id },
        data: { description: description?.trim() || '' },
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
          tags: { include: { tag: true } },
          attachments: true,
        },
      });
    });

    const result = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || undefined,
      status: updatedTask.status,
      priority: updatedTask.priority,
      progress: updatedTask.progress,
      dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString().slice(0, 10) : undefined,
      projectName: updatedTask.project?.name || 'Solaris Core',
      assigneeId: updatedTask.assigneeId || undefined,
      assignee: updatedTask.assignee
        ? {
            id: updatedTask.assignee.id,
            fullName: updatedTask.assignee.fullName,
            avatar: updatedTask.assignee.avatar || undefined,
            profession: updatedTask.assignee.profession,
          }
        : undefined,
      tags: updatedTask.tags.map((tt) => ({
        id: tt.tag.id,
        name: tt.tag.name,
        color: 'amber',
      })),
      commentsCount: 0,
      stageId: updatedTask.stageId || undefined,
      attachments: updatedTask.attachments
        ? updatedTask.attachments.map((att) => ({
            id: att.id,
            name: att.name,
            url: att.url,
            type: att.type,
            size: att.size || undefined,
            createdAt: att.createdAt ? att.createdAt.toISOString() : undefined,
          }))
        : [],
    };

    if (updatedTask.projectId) {
      this.socketGateway.broadcastToProject(updatedTask.projectId, 'task:updated', result);
    }

    return result;
  }

  async getComments(taskId: string, user?: AuthUserPayload) {
    return this.commentService.getComments(taskId, user);
  }

  async addComment(taskId: string, userId: string, dto: CreateTaskCommentDto) {
    return this.commentService.addComment(taskId, userId, dto);
  }

  async createTaskRequest(senderId: string, dto: any) {
    return this.requestService.createTaskRequest(senderId, dto);
  }

  async getOutgoingRequests(userId: string) {
    return this.requestService.getOutgoingRequests(userId);
  }

  async cancelTaskRequest(requestId: string, userId: string) {
    return this.requestService.cancelTaskRequest(requestId, userId);
  }

  async getIncomingRequests(userId: string) {
    return this.requestService.getIncomingRequests(userId);
  }

  async respondToRequest(requestId: string, userId: string, action: 'APPROVED' | 'REJECTED') {
    return this.requestService.respondToRequest(requestId, userId, action);
  }

  // 🗑️ [LC-55] Delete Task (Allowed for Admin, Global Manager & Project Manager)
  async deleteTask(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: { select: { managerId: true, createdById: true } } },
    });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const isManagerOrAdmin = Boolean(
      user &&
      (user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        (user as any).globalRole === 'ADMIN' ||
        (user as any).globalRole === 'MANAGER' ||
        task.project?.managerId === userId ||
        task.project?.createdById === userId)
    );

    if (!isManagerOrAdmin) {
      throw new ForbiddenException('Chỉ có Cấp Quản Lý (Manager) hoặc Quản Trị Viên (Admin) mới có quyền xóa Task!');
    }

    // 🔒 [LC-24] HỦY TOÀN BỘ YÊU CẦU CHUYỂN GIAO / DUYỆT ĐANG TREO KHI XÓA TASK
    await this.prisma.taskRequest.updateMany({
      where: {
        taskId: id,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
        responseNote: 'Task đã bị Quản lý xóa khỏi hệ thống.',
      },
    });

    await this.prisma.task.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    if (task.projectId) {
      this.socketGateway.broadcastToProject(task.projectId, 'task:deleted', {
        id,
      });
    }

    return {
      success: true,
      message: `Đã tự động di chuyển Task "${task.title}" vào CSDL Thùng Rác (Lưu vết CSDL thành công)`,
    };
  }

  // 📦 Lấy danh sách Task trong Lưu Trữ / Audit Log (CHỈ DÀNH CHO ADMIN)
  async getArchivedTasks(user?: AuthUserPayload) {
    if (user && user.role !== 'ADMIN' && user.globalRole !== 'ADMIN') {
      throw new ForbiddenException('Chỉ Quản Trị Viên (Admin) mới có quyền truy cập Audit Log & Lưu Trữ!');
    }

    const tasks = await this.prisma.task.findMany({
      where: {
        OR: [{ isDeleted: true }, { isArchived: true }],
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return tasks.map((t) => ({
      ...this.mapTaskResponse(t),
      isDeleted: t.isDeleted,
      isAutoArchivedDone: false,
    }));
  }

  // 🔄 [LC-35] [LC-53] [CC-01] Khôi phục Task từ CSDL Thùng Rác (Tự động mở lại Dự án cha nếu đang bị xóa)
  async restoreTask(id: string, user?: AuthUserPayload) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, managerId: true, createdById: true, isCompleted: true, isDeleted: true },
        },
      },
    });
    if (!task) {
      throw new NotFoundException('Task không tồn tại trong CSDL');
    }

    // 🛡️ [CC-05] Idempotent guard: nếu task đã ở trạng thái khôi phục thì trả về ngay
    if (!task.isDeleted) {
      return {
        success: true,
        message: `Task "${task.title}" đã ở trạng thái hoạt động!`,
        task: this.mapTaskResponse(task),
      };
    }

    // 🔒 [LC-78] CHẶN KHÔI PHỤC TASK VÀO DỰ ÁN ĐÃ HOÀN THÀNH / NGHIỆM THU
    if (task.project?.isCompleted) {
      throw new BadRequestException(
        'Dự án này đã hoàn thành/nghiệm thu và đã đóng. Không thể khôi phục Task vào dự án đã đóng!'
      );
    }

    if (user) {
      const isManagerOrAdmin =
        user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER' ||
        task.project?.managerId === user.id ||
        task.project?.createdById === user.id;

      if (!isManagerOrAdmin) {
        throw new ForbiddenException(
          'Chỉ Quản Trị Viên (Admin) hoặc Quản lý dự án mới có quyền khôi phục Task từ Thùng Rác!'
        );
      }
    }

    let autoRestoredProject = false;

    await this.prisma.$transaction(async (tx) => {
      // 🔄 [CC-01] Tự động khôi phục Dự án cha nếu đang bị xóa
      if (task.project?.isDeleted) {
        await tx.project.update({
          where: { id: task.projectId },
          data: {
            isDeleted: false,
            deletedAt: null,
            deletedById: null,
          },
        });
        autoRestoredProject = true;
      }

      await tx.task.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });
    });

    if (autoRestoredProject) {
      this.socketGateway.broadcastToProject(task.projectId, 'project:restored', {
        projectId: task.projectId,
      });
    }

    const updated = await this.recalculateTaskProgress(id, task.projectId);
    this.socketGateway.broadcastToProject(task.projectId, 'task:created', updated);

    const message = autoRestoredProject
      ? `Đã khôi phục Task "${task.title}" và tự động mở lại Dự án "${task.project?.name || ''}" từ Thùng Rác!`
      : `Đã khôi phục thành công Task "${task.title}" về Bảng công việc!`;

    return {
      success: true,
      message,
      task: updated,
    };
  }

  // 💥 [ADMIN ONLY] Xóa vĩnh viễn Task khỏi CSDL
  async permanentDeleteTask(id: string, user?: AuthUserPayload) {
    if (user && user.role !== 'ADMIN' && user.globalRole !== 'ADMIN') {
      throw new ForbiddenException('Chỉ Quản Trị Viên (Admin) mới có quyền xóa vĩnh viễn Task khỏi CSDL!');
    }

    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException('Task không tồn tại!');
    }

    await this.prisma.task.delete({ where: { id } });

    return {
      success: true,
      message: `Đã xóa vĩnh viễn Task "${task.title}" khỏi CSDL.`,
    };
  }

  private mapTaskResponse(t: any) {
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
        ? t.attachments.map((att) => ({
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

  async addAttachment(
    taskId: string,
    file: { originalname?: string; filename?: string; mimetype?: string; size?: number; buffer?: Buffer } | any,
    body: { name?: string; url?: string; type?: string },
    user?: AuthUserPayload
  ) {
    return this.attachmentService.addAttachment(taskId, file, body, user);
  }

  async deleteAttachment(attachmentId: string, user?: AuthUserPayload) {
    return this.attachmentService.deleteAttachment(attachmentId, user);
  }

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
    return this.subtaskService.addSubtask(taskId, body, user);
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
    return this.subtaskService.updateSubtask(subtaskId, body, user);
  }

  async reviewSubtask(
    subtaskId: string,
    body: { action: 'APPROVE' | 'REJECT' | 'REOPEN'; reason?: string },
    user: AuthUserPayload
  ) {
    return this.subtaskService.reviewSubtask(subtaskId, body, user);
  }

  async deleteSubtask(subtaskId: string, user?: AuthUserPayload) {
    return this.subtaskService.deleteSubtask(subtaskId, user);
  }

  private async recalculateTaskProgress(taskId: string, projectId: string) {
    return this.subtaskService.recalculateTaskProgress(taskId, projectId);
  }
  async updateStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto, user?: AuthUserPayload) {
    const updatedTask = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id },
        include: {
          subtasks: true,
          project: { select: { id: true, managerId: true, createdById: true } },
        },
      });
      if (!task || task.isDeleted) {
        throw new NotFoundException('Task không tồn tại hoặc đã bị xóa vào thùng rác');
      }

      if (task.isArchived) {
        throw new BadRequestException('Task đã được lưu trữ vào kho (Archived). Không thể thay đổi trạng thái!');
      }

      const activeUserId: string | null = user?.id || user?.sub || null;

      if (user) {
        const typedUser = user as Record<string, any>;
        const userRole = typedUser.role as string;
        const userGlobalRole = typedUser.globalRole as string;
        const userId = activeUserId;

        const isAdminOrManager = Boolean(
          userRole === 'ADMIN' ||
          userRole === 'MANAGER' ||
          userGlobalRole === 'ADMIN' ||
          userGlobalRole === 'MANAGER' ||
          (userId && task.project?.managerId === userId) ||
          (userId && task.project?.createdById === userId) ||
          (userId && task.createdById === userId)
        );
        const isSubtaskAssignee = Boolean(
          task.subtasks && task.subtasks.some((st) => st.assigneeId === userId)
        );
        const isAssignee = task.assigneeId
          ? task.assigneeId === userId || isSubtaskAssignee
          : task.createdById === userId || isSubtaskAssignee;

        if (!isAdminOrManager && !isAssignee) {
          throw new ForbiddenException(
            'Task này thuộc về người được giao, bạn không có quyền chỉnh sửa trạng thái của người khác'
          );
        }
      }

      if (task.status === 'IN_REVIEW' && updateTaskStatusDto.status !== 'IN_REVIEW') {
        const pendingTransfer = await tx.taskRequest.findFirst({
          where: { taskId: id, type: 'TRANSFER', status: 'PENDING' },
        });
        if (pendingTransfer) {
          throw new BadRequestException(
            'Task đang trong trạng thái Chờ Duyệt Bàn Giao (IN_REVIEW). Vui lòng duyệt hoặc hủy yêu cầu bàn giao trước khi chuyển đổi trạng thái.'
          );
        }
      }

      if (updateTaskStatusDto.status === 'DONE') {
        const hasUnfinishedSubtasks =
          task.subtasks && task.subtasks.length > 0 && task.subtasks.some((st) => !st.isDone);
        if (hasUnfinishedSubtasks) {
          throw new BadRequestException(
            'Không thể chuyển Task sang Hoàn Thành khi vẫn còn Task con chưa được Quản lý phê duyệt hoàn tất.'
          );
        }
      }

      const oldStatus: string = task.status;
      const newStatus: string = updateTaskStatusDto.status;
      const dtoDesc = (updateTaskStatusDto as unknown as { description?: string }).description;

      const result = await tx.task.update({
        where: { id },
        data: {
          status: newStatus as TaskStatus,
          stageId: updateTaskStatusDto.stageId !== undefined ? updateTaskStatusDto.stageId : undefined,
          description: dtoDesc !== undefined ? String(dtoDesc) : undefined,
          progress:
            updateTaskStatusDto.progress !== undefined
              ? updateTaskStatusDto.progress
              : newStatus === 'DONE'
                ? 100
                : task.progress,
          completedAt: newStatus === 'DONE' ? task.completedAt || new Date() : null,
        },
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
          tags: { include: { tag: true } },
          attachments: true,
        },
      });

      if (oldStatus !== newStatus) {
        const loggerId = activeUserId || task.assigneeId || task.createdById;

        if (loggerId) {
          try {
            await tx.taskHistory.create({
              data: {
                taskId: String(id),
                userId: String(loggerId),
                action: 'MOVED_TASK',
                field: 'status',
                oldValue: String(oldStatus),
                newValue: String(newStatus),
              },
            });
          } catch {
            // Safe fallback to prevent task update transaction failure
          }
        }
      }

      return result;
    });

    const result = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || undefined,
      status: updatedTask.status,
      priority: updatedTask.priority,
      progress: updatedTask.progress,
      dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString().slice(0, 10) : undefined,
      projectName: updatedTask.project?.name || 'Solaris Core',
      assigneeId: updatedTask.assigneeId || undefined,
      assignee: updatedTask.assignee
        ? {
            id: updatedTask.assignee.id,
            fullName: updatedTask.assignee.fullName,
            avatar: updatedTask.assignee.avatar || undefined,
            profession: updatedTask.assignee.profession,
          }
        : undefined,
      tags: updatedTask.tags.map((tt) => ({
        id: tt.tag.id,
        name: tt.tag.name,
        color: 'amber',
      })),
      commentsCount: 0,
      stageId: updatedTask.stageId || undefined,
      attachments: updatedTask.attachments
        ? updatedTask.attachments.map((att) => ({
            id: att.id,
            name: att.name,
            url: att.url,
            type: att.type,
            size: att.size || undefined,
            createdAt: att.createdAt ? att.createdAt.toISOString() : undefined,
          }))
        : [],
    };

    if (updatedTask.projectId) {
      this.socketGateway.broadcastToProject(updatedTask.projectId, 'task:updated', result);
    }

    // 🔄 [LC-120] TỰ ĐỘNG SINH TASK LẶP LẠI (RECURRING TASK GENERATION) KHI TASK HOÀN THÀNH
    const rawRecurrence = (updatedTask as any).recurrenceRule;
    if (updatedTask.status === 'DONE' && rawRecurrence) {
      try {
        const rule = String(rawRecurrence).toUpperCase();
        let daysToAdd = 1;
        if (rule === 'WEEKLY') daysToAdd = 7;
        else if (rule === 'MONTHLY') daysToAdd = 30;

        const nextStartDate = new Date();
        const nextDueDate = updatedTask.dueDate ? new Date(updatedTask.dueDate) : new Date();
        nextDueDate.setDate(nextDueDate.getDate() + daysToAdd);

        const nextTask = await this.prisma.task.create({
          data: {
            title: updatedTask.title,
            description: updatedTask.description,
            status: 'TODO',
            priority: updatedTask.priority,
            progress: 0,
            startDate: nextStartDate,
            dueDate: nextDueDate,
            recurrenceRule: rawRecurrence,
            projectId: updatedTask.projectId,
            assigneeId: updatedTask.assigneeId,
            createdById: (updatedTask as any).createdById || updatedTask.assigneeId || 'SYSTEM',
          },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, fullName: true, email: true, avatar: true, profession: true } },
            tags: { include: { tag: true } },
            subtasks: true,
            attachments: true,
          },
        });

        const mappedNext = this.mapTaskResponse(nextTask);
        this.socketGateway.broadcastToProject(updatedTask.projectId, 'task:created', mappedNext);
      } catch {
        // Fallback guard
      }
    }

    return result;
  }
}
