import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ActivityItem {
  id: string;
  type: 'HISTORY' | 'COMMENT';
  user: {
    id: string;
    fullName: string;
    avatar: string | null;
  };
  action?: string;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  content?: string;
  createdAt: Date;
}

@Injectable()
export class TaskActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async getTaskActivities(
    taskId: string,
    filter: 'all' | 'comments' | 'history' = 'all',
    user?: any
  ) {
    const safeTaskId: string = String(taskId);

    const task = await this.prisma.task.findUnique({
      where: { id: safeTaskId },
      include: {
        project: {
          include: { members: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task không tồn tại');
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

      const isMember = Boolean(
        task.project?.members.some((m) => m.userId === user.id) ||
        task.assigneeId === user.id ||
        task.createdById === user.id
      );

      if (!isAdminOrManager && !isMember) {
        throw new ForbiddenException('Bạn không thuộc dự án này để xem lịch sử hoạt động của Task!');
      }
    }

    let histories: ActivityItem[] = [];
    let comments: ActivityItem[] = [];

    if (filter === 'all' || filter === 'history') {
      const rawHistories = await this.prisma.taskHistory.findMany({
        where: { taskId: safeTaskId },
        include: {
          user: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      histories = rawHistories.map((item) => ({
        id: item.id,
        type: 'HISTORY' as const,
        user: item.user,
        action: item.action,
        field: item.field,
        oldValue: item.oldValue,
        newValue: item.newValue,
        createdAt: item.createdAt,
      }));
    }

    if (filter === 'all' || filter === 'comments') {
      const rawComments = await this.prisma.comment.findMany({
        where: { taskId: safeTaskId },
        include: {
          user: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      comments = rawComments.map((item) => ({
        id: item.id,
        type: 'COMMENT' as const,
        user: item.user,
        content: item.content,
        createdAt: item.createdAt,
      }));
    }

    if (filter === 'all') {
      const combined: ActivityItem[] = [...histories, ...comments];
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { success: true, data: combined };
    }

    return {
      success: true,
      data: filter === 'history' ? histories : comments,
    };
  }

  async logTaskHistory(
    taskId: string,
    userId: string,
    action: string,
    field?: string,
    oldValue?: string,
    newValue?: string
  ) {
    if (!taskId || !userId) return null;

    try {
      return await this.prisma.taskHistory.create({
        data: {
          taskId: String(taskId),
          userId: String(userId),
          action: String(action),
          field: field ? String(field) : null,
          oldValue: oldValue !== undefined && oldValue !== null ? String(oldValue) : null,
          newValue: newValue !== undefined && newValue !== null ? String(newValue) : null,
        },
      });
    } catch {
      return null;
    }
  }

  async logTaskMove(taskId: string, userId: string, oldStatus: string, newStatus: string) {
    if (oldStatus === newStatus || !taskId || !userId) return null;

    return await this.logTaskHistory(taskId, userId, 'MOVED_TASK', 'status', oldStatus, newStatus);
  }

  private formatStatusLabel(status: string | null | undefined): string {
    if (!status) return '';
    const labels: Record<string, string> = {
      TODO: 'Cần làm',
      IN_PROGRESS: 'Đang thực hiện',
      PAUSED: 'Tạm dừng',
      BLOCKED: 'Bị nghẽn',
      IN_REVIEW: 'Đang duyệt',
      DONE: 'Hoàn thành',
    };
    return labels[status] ?? status;
  }

  async getUserMoveHistories(userId: string, limit: number = 30) {
    const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);

    const moveLogs = await this.prisma.taskHistory.findMany({
      where: {
        userId: String(userId),
        field: 'status',
        task: {
          isDeleted: false,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
            project: {
              select: { id: true, name: true },
            },
          },
        },
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });

    const data = moveLogs.map((item) => {
      const fromLabel = this.formatStatusLabel(item.oldValue);
      const toLabel = this.formatStatusLabel(item.newValue);
      const taskTitle = item.task?.title || 'Công việc không tên';

      return {
        id: item.id,
        taskId: item.taskId,
        taskTitle: taskTitle,
        projectName: item.task?.project?.name || null,
        user: item.user,
        oldStatus: item.oldValue,
        newStatus: item.newValue,
        createdAt: item.createdAt,
        message: `${item.user.fullName} đã kéo task "${taskTitle}" từ "${fromLabel}" sang "${toLabel}"`,
      };
    });

    return {
      success: true,
      total: data.length,
      data,
    };
  }
}
