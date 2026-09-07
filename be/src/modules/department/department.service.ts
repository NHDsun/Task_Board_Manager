import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

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
}
