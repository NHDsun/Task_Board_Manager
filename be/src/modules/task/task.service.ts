import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { QueryTaskFilterDto } from './dto/query-task-filter.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
  ) {}

  async findAll(query?: QueryTaskFilterDto) {
    const where: any = { isArchived: false, isDeleted: false };

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.projectId && query.projectId !== 'ALL') {
      where.projectId = query.projectId;
    }

    if (query?.assigneeId && query.assigneeId !== 'ALL') {
      where.assigneeId = query.assigneeId;
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
        assignee: { select: { id: true, fullName: true, email: true, avatar: true, profession: true } },
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
        subtasks: true,
        attachments: true,
        taskRequests: {
          where: { status: 'PENDING' },
          include: {
            sender: { select: { id: true, fullName: true, avatar: true, email: true } },
            receiver: { select: { id: true, fullName: true, avatar: true, email: true } },
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { comments: true } },
      },
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      status: t.status,
      priority: t.priority,
      progress: t.progress,
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
      createdById: t.createdById,
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
      tags: t.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, color: 'amber' })),
      commentsCount: t._count.comments,
      stageId: t.stageId || undefined,
      attachments: t.attachments ? t.attachments.map((att) => ({
        id: att.id,
        name: att.name,
        url: att.url,
        type: att.type,
        size: att.size || undefined,
        createdAt: att.createdAt ? att.createdAt.toISOString() : undefined,
      })) : [],
    }));
  }

  async create(userId: string, createTaskDto: CreateTaskDto) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || 'TODO',
        priority: createTaskDto.priority || 'NORMAL',
        progress: createTaskDto.progress || 0,
        projectId: createTaskDto.projectId,
        assigneeId: createTaskDto.assigneeId || effectiveUserId,
        createdById: effectiveUserId,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        stageId: createTaskDto.stageId || 'stage_1',
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, fullName: true, email: true, avatar: true, profession: true } },
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
        attachments: true,
      },
    });

    if (task.status === 'IN_PROGRESS' && task.assigneeId) {
      await this.triggerTaskDrivenCheckIn(task.assigneeId);
    }

    const createdTask = {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : undefined,
      projectName: task.project?.name || 'Solaris Core',
      assigneeId: task.assigneeId || undefined,
      stageId: task.stageId || undefined,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            fullName: task.assignee.fullName,
            avatar: task.assignee.avatar || undefined,
            profession: task.assignee.profession,
          }
        : undefined,
      tags: task.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, color: 'amber' })),
      commentsCount: 0,
      attachments: task.attachments ? task.attachments.map((att) => ({
        id: att.id,
        name: att.name,
        url: att.url,
        type: att.type,
        size: att.size || undefined,
        createdAt: att.createdAt ? att.createdAt.toISOString() : undefined,
      })) : [],
    };

    if (task.projectId) {
      this.socketGateway.broadcastToProject(task.projectId, 'task:created', createdTask);
    }

    return createdTask;
  }

  async findByProject(projectId: string) {
    return this.findAll({ projectId });
  }

  async updateStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto, user?: any) {
    // Atomic Transaction to guarantee race condition prevention
    const updatedTask = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id } });
      if (!task) {
        throw new NotFoundException('Task không tồn tại');
      }

      // Check ownership & role permission: Only ADMIN, MANAGER, or Task Assignee/Creator can update status
      if (user && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
        const isOwner = task.assigneeId === user.id || task.createdById === user.id;
        if (!isOwner) {
          throw new ForbiddenException('Bạn không có quyền chỉnh sửa trạng thái Task của người khác');
        }
      }

      return tx.task.update({
        where: { id },
        data: {
          status: updateTaskStatusDto.status,
          progress:
            updateTaskStatusDto.progress !== undefined
              ? updateTaskStatusDto.progress
              : updateTaskStatusDto.status === 'DONE'
              ? 100
              : task.progress,
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, fullName: true, email: true, avatar: true, profession: true } },
          tags: { include: { tag: true } },
          attachments: true,
        },
      });
    });

    if (updateTaskStatusDto.status === 'IN_PROGRESS' && updatedTask.assigneeId) {
      await this.triggerTaskDrivenCheckIn(updatedTask.assigneeId);
    }

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
      tags: updatedTask.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, color: 'amber' })),
      commentsCount: 0,
      stageId: updatedTask.stageId || undefined,
      attachments: updatedTask.attachments ? updatedTask.attachments.map((att) => ({
        id: att.id,
        name: att.name,
        url: att.url,
        type: att.type,
        size: att.size || undefined,
        createdAt: att.createdAt ? att.createdAt.toISOString() : undefined,
      })) : [],
    };

    if (updatedTask.projectId) {
      this.socketGateway.broadcastToProject(updatedTask.projectId, 'task:updated', result);
    }

    return result;
  }

  async getComments(taskId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => ({
      id: c.id,
      author: c.user?.fullName || 'Huy Dat (Admin)',
      avatar: c.user?.avatar || '',
      text: c.content,
      createdAt: c.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  }

  async addComment(taskId: string, userId: string, dto: CreateTaskCommentDto) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const comment = await this.prisma.comment.create({
      data: {
        taskId,
        userId: effectiveUserId,
        content: dto.content || dto.text || '',
      },
      include: {
        user: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    const result = {
      id: comment.id,
      author: comment.user?.fullName || 'Huy Dat (Admin)',
      avatar: comment.user?.avatar || '',
      text: comment.content,
      createdAt: comment.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const targetTask = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (targetTask?.projectId) {
      this.socketGateway.broadcastToProject(targetTask.projectId, 'comment:created', { taskId, comment: result });
    }

    return result;
  }

  // ✉️ Create a new Task Transfer/Assist Request in PostgreSQL CSDL
  async createTaskRequest(senderId: string, dto: any) {
    let effectiveSenderId = senderId;
    if (senderId === 'admin-huydat-id' || senderId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveSenderId = realAdmin.id;
    }

    // 🔒 Check Task existence & Ownership
    const targetTask = await this.prisma.task.findUnique({ where: { id: dto.taskId } });
    if (!targetTask) {
      throw new NotFoundException('Task không tồn tại');
    }

    const senderUser = await this.prisma.user.findUnique({ where: { id: effectiveSenderId } });
    const isAdmin = senderUser?.role === 'ADMIN';
    const isOwner = targetTask.assigneeId === effectiveSenderId || targetTask.createdById === effectiveSenderId;

    if (!isOwner && !isAdmin) {
      throw new BadRequestException('Bạn chỉ có thể gửi yêu cầu chuyển giao cho Task thuộc quyền sở hữu của chính mình!');
    }

    let effectiveReceiverId = dto.receiverId;
    if (dto.receiverId === 'admin-huydat-id' || dto.receiverId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveReceiverId = realAdmin.id;
    } else if (dto.receiverId === 'manager-minhanh-id') {
      const realManager = await this.prisma.user.findUnique({ where: { email: 'manager@taskboard.com' } });
      if (realManager) effectiveReceiverId = realManager.id;
    } else if (dto.receiverId === 'employee-hoangnam-id') {
      const realEmployee = await this.prisma.user.findUnique({ where: { email: 'employee@taskboard.com' } });
      if (realEmployee) effectiveReceiverId = realEmployee.id;
    }

    // 1. Save new request to task_requests table in PostgreSQL
    const reqItem = await this.prisma.taskRequest.create({
      data: {
        taskId: dto.taskId,
        senderId: effectiveSenderId,
        receiverId: effectiveReceiverId,
        type: (dto.type as any) || 'TRANSFER',
        status: 'PENDING',
        note: dto.note || 'Yêu cầu chuyển giao Task tác nghiệp',
      },
    });

    // 2. Automatically set task status to IN_REVIEW in tasks table
    await this.prisma.task.update({
      where: { id: dto.taskId },
      data: { status: 'IN_REVIEW' },
    });

    return reqItem;
  }

  // 📤 Get outgoing task transfer requests sent by the logged-in user
  async getOutgoingRequests(userId: string) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const requests = await this.prisma.taskRequest.findMany({
      where: {
        senderId: effectiveUserId,
      },
      include: {
        task: { select: { id: true, title: true, priority: true } },
        receiver: { select: { id: true, fullName: true, avatar: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      taskId: r.taskId,
      taskTitle: r.task.title,
      priority: r.task.priority,
      receiverName: r.receiver.fullName,
      receiverAvatar: r.receiver.avatar || '',
      status: (r.status as string) === 'ACCEPTED' ? 'APPROVED' : r.status,
      note: r.note || 'Yêu cầu chuyển giao Task tác nghiệp',
      createdAt: r.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  }

  // 🚫 Cancel a pending outgoing task transfer request
  async cancelTaskRequest(requestId: string, userId: string) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const reqItem = await this.prisma.taskRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
      },
    });

    if (!reqItem) {
      throw new NotFoundException('Yêu cầu không tồn tại');
    }

    if (reqItem.senderId !== effectiveUserId) {
      throw new BadRequestException('Bạn chỉ có thể hủy yêu cầu chuyển giao do chính mình gửi đi!');
    }

    if (reqItem.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu đã được xử lý hoặc không ở trạng thái Chờ Duyệt (PENDING)');
    }

    // 🔒 Bọc tất cả thao tác CSDL trong 1 Prisma Transaction nguyên tố (Atomic Transaction)
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.taskRequest.update({
        where: { id: requestId },
        data: { status: 'CANCELLED' as any },
      });

      await tx.task.update({
        where: { id: reqItem.taskId },
        data: { status: 'IN_PROGRESS' },
      });

      await tx.comment.create({
        data: {
          taskId: reqItem.taskId,
          userId: effectiveUserId,
          content: `🚫 [HỦY YÊU CẦU CHUYỂN GIAO] ${reqItem.sender.fullName} đã hủy yêu cầu chuyển giao Task tới ${reqItem.receiver.fullName}. Task quay trở lại trạng thái Thực hiện.`,
        },
      });

      return updated;
    });
  }

  // 📬 Get incoming task transfer requests targeted strictly to the logged-in user
  async getIncomingRequests(userId: string) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const requests = await this.prisma.taskRequest.findMany({
      where: {
        receiverId: effectiveUserId,
        status: 'PENDING',
      },
      include: {
        task: { select: { id: true, title: true, priority: true } },
        sender: { select: { id: true, fullName: true, avatar: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      taskId: r.taskId,
      taskTitle: r.task.title,
      priority: r.task.priority,
      senderName: r.sender.fullName,
      senderAvatar: r.sender.avatar || '',
      note: r.note || 'Yêu cầu chuyển giao Task tác nghiệp',
      createdAt: r.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  }

  // 🟢 Respond to incoming transfer request (APPROVED or REJECTED)
  async respondToRequest(requestId: string, userId: string, action: 'APPROVED' | 'REJECTED') {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const reqItem = await this.prisma.taskRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
        task: { select: { id: true, title: true } },
      },
    });

    if (!reqItem) {
      throw new NotFoundException('Yêu cầu không tồn tại');
    }

    const targetStatus = action === 'APPROVED' ? 'ACCEPTED' : 'REJECTED';

    // 🔒 Bọc tất cả thao tác CSDL trong 1 Prisma Transaction nguyên tố (Atomic Transaction)
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.taskRequest.update({
        where: { id: requestId },
        data: { status: targetStatus as any },
      });

      if (action === 'APPROVED') {
        await tx.task.update({
          where: { id: reqItem.taskId },
          data: {
            assigneeId: reqItem.receiverId,
            status: 'IN_PROGRESS',
          },
        });

        try {
          await tx.comment.create({
            data: {
              taskId: reqItem.taskId,
              userId: effectiveUserId || reqItem.receiverId,
              content: `🔄 [LỊCH SỬ CHUYỂN GIAO BAN GIAO TASK] Nhiệm vụ đã được chuyển giao thành công từ ${reqItem.sender?.fullName || 'Đồng nghiệp'} sang ${reqItem.receiver?.fullName || 'Người nhận'}. Chú thích: "${reqItem.note || 'Không có ghi chú'}"`,
            },
          });
        } catch {
          // Fallback silently if comment creation fails
        }
      } else if (action === 'REJECTED') {
        await tx.task.update({
          where: { id: reqItem.taskId },
          data: { status: 'IN_PROGRESS' },
        });

        try {
          await tx.comment.create({
            data: {
              taskId: reqItem.taskId,
              userId: effectiveUserId || reqItem.receiverId,
              content: `❌ [LỊCH SỬ TỪ CHỐI CHUYỂN GIAO] ${reqItem.receiver?.fullName || 'Người nhận'} đã từ chối yêu cầu bàn giao từ ${reqItem.sender?.fullName || 'Đồng nghiệp'}. Nhiệm vụ giữ nguyên cho người thực hiện cũ.`,
            },
          });
        } catch {
          // Fallback silently if comment creation fails
        }
      }

      return updated;
    });
  }

  // 🗑️ Delete Task (Allowed only for ADMIN & MANAGER)
  async deleteTask(id: string, userId: string) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const user = await this.prisma.user.findUnique({ where: { id: effectiveUserId } });
    const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    if (!isManagerOrAdmin) {
      throw new ForbiddenException('Chỉ có Cấp Quản Lý (Manager) hoặc Quản Trị Viên (Admin) mới có quyền xóa Task!');
    }

    await this.prisma.task.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    if (task.projectId) {
      this.socketGateway.broadcastToProject(task.projectId, 'task:deleted', { id });
    }

    return { success: true, message: `Đã tự động di chuyển Task "${task.title}" vào CSDL Thùng Rác (Lưu vết CSDL thành công)` };
  }

  // 📦 Lấy danh sách các Task đã xóa (Thùng Rác CSDL PostgreSQL)
  async getArchivedTasks() {
    return this.prisma.task.findMany({
      where: { isDeleted: true },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, fullName: true, email: true, avatar: true } },
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  // 🔄 Khôi phục Task từ CSDL Thùng Rác
  async restoreTask(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task không tồn tại trong CSDL');
    }

    await this.prisma.task.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return { success: true, message: `Đã khôi phục thành công Task "${task.title}" về Bảng công việc!` };
  }

  private async triggerTaskDrivenCheckIn(userId: string) {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const existingLog = await this.prisma.attendanceLog.findFirst({
        where: {
          userId,
          checkInAt: { gte: startOfDay },
        },
      });

      if (!existingLog) {
        await this.prisma.attendanceLog.create({
          data: {
            userId,
            type: 'TASK_DRIVEN',
            workMode: 'OFFICE',
            note: 'Tự động Chấm công ngầm khi bắt đầu Task (Task-Driven Check-In)',
          },
        });
      }
    } catch {
      // Ignore if error
    }
  }

  private mapTaskResponse(t: any) {
    return {
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      status: t.status,
      priority: t.priority,
      progress: t.progress,
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
      createdById: t.createdById,
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
      tags: t.tags ? t.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, color: 'amber' })) : [],
      commentsCount: t._count?.comments || 0,
      stageId: t.stageId || undefined,
      attachments: t.attachments ? t.attachments.map((att) => ({
        id: att.id,
        name: att.name,
        url: att.url,
        type: att.type,
        size: att.size || undefined,
        createdAt: att.createdAt ? att.createdAt.toISOString() : undefined,
      })) : [],
    };
  }

  async addAttachment(
    taskId: string,
    file: any,
    body: { name?: string; url?: string; type?: string },
  ) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    let attachmentData: any = {};

    if (file) {
      const fs = require('fs');
      const path = require('path');
      const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      const uploadPath = path.join(process.cwd(), 'uploads', uniqueName);
      
      fs.writeFileSync(uploadPath, file.buffer);

      attachmentData = {
        name: file.originalname,
        url: `/uploads/${uniqueName}`,
        type: 'file',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        taskId,
      };
    } else if (body.url) {
      attachmentData = {
        name: body.name || body.url,
        url: body.url,
        type: 'link',
        size: null,
        taskId,
      };
    } else {
      throw new BadRequestException('Vui lòng gửi file hoặc URL liên kết');
    }

    const attachment = await this.prisma.attachment.create({
      data: attachmentData,
    });

    if (task.projectId) {
      const updatedTaskObj = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, fullName: true, email: true, avatar: true, profession: true } },
          tags: { include: { tag: true } },
          attachments: true,
        }
      });
      this.socketGateway.broadcastToProject(task.projectId, 'task:updated', this.mapTaskResponse(updatedTaskObj));
    }

    return attachment;
  }

  async deleteAttachment(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) {
      throw new NotFoundException('Đính kèm không tồn tại');
    }

    if (attachment.type === 'file') {
      const fs = require('fs');
      const path = require('path');
      const filename = path.basename(attachment.url);
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          // ignore
        }
      }
    }

    await this.prisma.attachment.delete({ where: { id: attachmentId } });

    const task = await this.prisma.task.findUnique({ where: { id: attachment.taskId } });
    if (task?.projectId) {
      const updatedTaskObj = await this.prisma.task.findUnique({
        where: { id: attachment.taskId },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, fullName: true, email: true, avatar: true, profession: true } },
          tags: { include: { tag: true } },
          attachments: true,
        }
      });
      this.socketGateway.broadcastToProject(task.projectId, 'task:updated', this.mapTaskResponse(updatedTaskObj));
    }

    return { success: true };
  }
}
