import { Injectable } from '@nestjs/common';
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
  async getTaskActivities(this: TaskActivityService, taskId: string, filter: 'all' | 'comments' | 'history' = 'all') {
    const safeTaskId: string = String(taskId);
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
    this: TaskActivityService,
    taskId: string,
    userId: string,
    action: string,
    field?: string,
    oldValue?: string,
    newValue?: string
  ) {
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
  }
}
