import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(dtoCreateDepartment: CreateDepartmentDto) {
    const { name, code } = dtoCreateDepartment;
    const existing = await this.prisma.department.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });
    if (existing) {
      throw new ConflictException('Tên hoặc mã phòng ban đã tồn tại.');
    }
    return this.prisma.department.create({
      data: dtoCreateDepartment,
    });
  }

  async findAll() {
    const departments = await this.prisma.department.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
    return departments.map((dept) => ({
      ...dept,
      totalMembers: dept._count.users,
      _count: undefined,
    }));
  }
  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
    if (!department) {
      throw new NotFoundException(`Không tìm thấy phòng ban với ID: ${id}`);
    }
    return department;
  }
  async update(id: string, dtoDepartment: UpdateDepartmentDto) {
    const department = await this.findOne(id);
    if (!department) {
      throw new NotFoundException(`Không tìm thấy phòng ban với ID: ${id}`);
    }
    return this.prisma.department.update({
      where: {
        id,
      },
      data: dtoDepartment,
    });
  }
  async remove(id: string) {
    const department = await this.findOne(id);
    if (!department) {
      throw new NotFoundException(`Không tìm thấy phòng ban với ID: ${id}`);
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: { departmentId: id },
        data: { departmentId: null },
      });
      return tx.department.delete({
        where: { id },
      });
    });
  }
  async getWorkload(id: string) {
    const department = await this.findOne(id);
    if (!department) {
      throw new NotFoundException(`Không tìm thấy phòng ban với ID: ${id}`);
    }
    const userIds = department.users.map((u) => {
      return u.id;
    });
    if (userIds.length === 0) {
      return {
        departmentName: department.name,
        totalMembers: 0,
        totalTasks: 0,
        taskStats: {
          TODO: 0,
          IN_PROGRESS: 0,
          PAUSED: 0,
          BLOCKED: 0,
          IN_REVIEW: 0,
          DONE: 0,
        },
        overdueTasks: 0,
      };
    }
    const tasks = await this.prisma.task.findMany({
      where: {
        assigneeId: {
          in: userIds,
        },
      },
    });

    const taskStats = tasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    const now = new Date();
    const overdueTasks = tasks.filter((task) => {
      return task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE';
    }).length;

    return {
      departmentName: department.name,
      totalMembers: department.users.length,
      totalTasks: tasks.length,
      taskStats,
      overdueTasks,
    };
  }
}
