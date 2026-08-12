import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { QueryTaskFilterDto } from './dto/query-task-filter.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: QueryTaskFilterDto) {
    const where: any = { isArchived: false };

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

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, fullName: true, email: true, avatar: true, profession: true } },
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
        subtasks: true,
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
      tags: t.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, color: 'amber' })),
      commentsCount: t._count.comments,
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
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, fullName: true, email: true, avatar: true, profession: true } },
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
      },
    });

    // Task-Driven Check-In Logic: If status is IN_PROGRESS, auto log attendance for today
    if (task.status === 'IN_PROGRESS' && task.assigneeId) {
      await this.triggerTaskDrivenCheckIn(task.assigneeId);
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : undefined,
      projectName: task.project?.name || 'Solaris Core',
      assigneeId: task.assigneeId || undefined,
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
    };
  }

  async findByProject(projectId: string) {
    return this.findAll({ projectId });
  }

  async updateStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const updatedTask = await this.prisma.task.update({
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
      },
    });

    // Task-Driven Check-In Trigger on status change to IN_PROGRESS
    if (updateTaskStatusDto.status === 'IN_PROGRESS' && updatedTask.assigneeId) {
      await this.triggerTaskDrivenCheckIn(updatedTask.assigneeId);
    }

    return {
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
    };
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
}
