import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { NotificationService } from '../notification/notification.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { AuthUserPayload } from '../../common/interfaces/auth-user.interface';

@Injectable()
export class TaskCommentService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
    private notificationService: NotificationService
  ) {}

  async getComments(taskId: string, user?: AuthUserPayload) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    if (user) {
      const isAdminOrManager =
        user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER' ||
        task.project?.managerId === user.id ||
        task.project?.createdById === user.id;

      const isMember = task.project?.members.some((m) => m.userId === user.id);
      if (!isAdminOrManager && !isMember) {
        throw new ForbiddenException('Bạn không thuộc dự án này để xem các bình luận của Task!');
      }
    }

    const comments = await this.prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => ({
      id: c.id,
      author: c.user?.fullName || 'Thành viên',
      avatar: c.user?.avatar || '',
      text: c.content,
      createdAt: c.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }

  async addComment(taskId: string, userId: string, dto: CreateTaskCommentDto) {
    const targetTask = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!targetTask || targetTask.isDeleted) {
      throw new NotFoundException('Task không tồn tại hoặc đã bị xóa vào thùng rác');
    }
    const cleanContent = (dto.content || dto.text || '').trim();
    if (!cleanContent) {
      throw new BadRequestException('Nội dung bình luận không được để trống!');
    }
    if (cleanContent.length > 5000) {
      throw new BadRequestException('Nội dung bình luận không được vượt quá 5.000 ký tự!');
    }

    if (targetTask.isArchived) {
      throw new BadRequestException('Task này đã được lưu trữ (Archived). Không thể thêm bình luận mới!');
    }
    if (targetTask.project?.isCompleted) {
      throw new BadRequestException('Dự án này đã hoàn thành/nghiệm thu và đã đóng. Không thể thêm bình luận mới!');
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const isAdmin = currentUser?.role === 'ADMIN' || (currentUser as any)?.globalRole === 'ADMIN';
    const isMember =
      targetTask.project?.members.some((m) => m.userId === userId) ||
      targetTask.project?.managerId === userId ||
      targetTask.project?.createdById === userId ||
      targetTask.assigneeId === userId ||
      targetTask.createdById === userId;

    if (!isAdmin && !isMember) {
      throw new ForbiddenException('Bạn không phải là thành viên của dự án này để bình luận vào Task');
    }

    const comment = await this.prisma.comment.create({
      data: {
        taskId,
        userId: userId,
        content: cleanContent,
      },
      include: {
        user: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    const result = {
      id: comment.id,
      author: comment.user?.fullName || 'Thành viên',
      avatar: comment.user?.avatar || '',
      text: comment.content,
      createdAt: comment.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    if (targetTask?.projectId) {
      this.socketGateway.broadcastToProject(targetTask.projectId, 'comment:created', { taskId, comment: result });
    }

    if (targetTask.assigneeId && targetTask.assigneeId !== userId) {
      await this.notificationService.sendNotification({
        userId: targetTask.assigneeId,
        actorId: userId,
        title: '💬 Bình luận mới trong Task',
        content: `${comment.user?.fullName || 'Đồng nghiệp'} đã bình luận vào Task "${targetTask.title}": "${cleanContent.slice(0, 80)}..."`,
        type: 'TASK_COMMENT',
        taskId: targetTask.id,
        projectId: targetTask.projectId,
      });
    }
    if (
      targetTask.createdById &&
      targetTask.createdById !== userId &&
      targetTask.createdById !== targetTask.assigneeId
    ) {
      await this.notificationService.sendNotification({
        userId: targetTask.createdById,
        actorId: userId,
        title: '💬 Bình luận mới trong Task',
        content: `${comment.user?.fullName || 'Đồng nghiệp'} đã bình luận vào Task "${targetTask.title}": "${cleanContent.slice(0, 80)}..."`,
        type: 'TASK_COMMENT',
        taskId: targetTask.id,
        projectId: targetTask.projectId,
      });
    }

    if (targetTask.project?.members && cleanContent.includes('@')) {
      for (const m of targetTask.project.members) {
        if (m.userId !== userId && m.userId !== targetTask.assigneeId && m.userId !== targetTask.createdById) {
          const memberUser = await this.prisma.user.findUnique({
            where: { id: m.userId },
            select: { id: true, fullName: true },
          });
          if (memberUser && cleanContent.toLowerCase().includes(`@${memberUser.fullName.toLowerCase()}`)) {
            await this.notificationService.sendNotification({
              userId: memberUser.id,
              actorId: userId,
              title: '📢 Bạn được nhắc tên trong bình luận Task',
              content: `${comment.user?.fullName || 'Đồng nghiệp'} đã nhắc tên bạn trong Task "${targetTask.title}": "${cleanContent.slice(0, 80)}..."`,
              type: 'MENTION',
              taskId: targetTask.id,
              projectId: targetTask.projectId,
            });
          }
        }
      }
    }

    return result;
  }
}
