import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundError } from 'rxjs';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UserService {
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }
  constructor(private readonly prisma: PrismaService) {}
  async findAll(query: QueryUserDto) {
    const {
      search,
      departmentId,
      role,
      profession,
      statusSignal,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      //     if (departmentId) {
      //   where.departmentId = departmentId;
      // }
      ...(departmentId && { departmentId }),
      ...(role && { role }),
      ...(profession && { profession }),
      ...(statusSignal && { statusSignal }),
      ...(search && {
        OR: [
          // contains : Tìm kiếm dạng chuỗi con (tương đương LIKE '%search%' trong SQL).
          // insensitive : Không phân biệt chữ HOA hay chữ thường
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { jobTitle: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
          role: true,
          profession: true,
          jobTitle: true,
          phone: true,
          statusSignal: true,
          customStatus: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        coverImage: true,
        role: true,
        profession: true,
        jobTitle: true,
        phone: true,
        bio: true,
        statusSignal: true,
        customStatus: true,
        department: true,
        memberships: {
          select: {
            project: {
              select: {
                id: true,
                name: true,
                isCompleted: true,
              },
            },
            joinedAt: true,
          },
        },
        assignedTasks: {
          where: {
            isDeleted: false,
            isArchived: false,
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            progress: true,
          },
        },
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return user;
  }

  async updateRoleAndDepartment(id: string, dto: UpdateUserRoleDto) {
    await this.findOne(id);

    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: {
          id: dto.departmentId,
        },
      });

      if (!department) {
        throw new NotFoundException('Phòng ban không tồn tại');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.role && { role: dto.role }),
        ...(dto.profession && { profession: dto.profession }),
        ...(dto.jobTitle !== undefined && { jobTitle: dto.jobTitle }),
        ...(dto.departmentId !== undefined && {
          departmentId: dto.departmentId,
        }),
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        profession: true,
        jobTitle: true,
        department: true,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
