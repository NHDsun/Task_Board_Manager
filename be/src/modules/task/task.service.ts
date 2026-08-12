import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

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
        assignee: { select: { id: true, fullName: true, email: true, avatar: true } },
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
      },
    });

    // Task-Driven Check-In Logic: If status is IN_PROGRESS, auto log attendance for today
    if (task.status === 'IN_PROGRESS' && task.assigneeId) {
      await this.triggerTaskDrivenCheckIn(task.assigneeId);
    }

    return task;
  }

  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId, isArchived: false },
      include: {
        assignee: { select: { id: true, fullName: true, email: true, avatar: true, profession: true } },
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
        subtasks: true,
        _count: { select: { comments: true } },
      },
      orderBy: [
        { priority: 'desc' }, // URGENT first
        { updatedAt: 'desc' },
      ],
    });
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
        progress: updateTaskStatusDto.progress !== undefined 
          ? updateTaskStatusDto.progress 
          : (updateTaskStatusDto.status === 'DONE' ? 100 : task.progress),
      },
      include: {
        assignee: { select: { id: true, fullName: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
      },
    });

    // Task-Driven Check-In Trigger on status change to IN_PROGRESS
    if (updateTaskStatusDto.status === 'IN_PROGRESS' && updatedTask.assigneeId) {
      await this.triggerTaskDrivenCheckIn(updatedTask.assigneeId);
    }

    return updatedTask;
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
