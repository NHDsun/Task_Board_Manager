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
    await this.findOne(id);
    return this.prisma.department.update({
      where: {
        id,
      },
      data: dtoDepartment,
    });
  }
  async remove(id: string) {
    await this.findOne(id);
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
}
