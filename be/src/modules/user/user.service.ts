import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { bindCallback, NotFoundError } from 'rxjs';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { LockUserDto } from './dto/lock-user.dto';
import * as bcrypt from 'bcrypt';
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

  // async getUserWorkload(userId: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //     select: {
  //       id: true,
  //       fullName: true,
  //       email: true,
  //       avatar: true,
  //       jobTitle: true,
  //       profession: true,
  //     },
  //   });
  //   if (!user) {
  //     throw new NotFoundException('không tìm thấy người dùng');
  //   }
  //   const now = new Date();
  //   const [todoCount , inProgressCount ,reviewCount , doneCount , overdueCount , urgentCount]
  // }

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
  async lockOrUnlockUser(id: string, dto: LockUserDto, currentAdminId: string) {
    if (id === currentAdminId && !dto.isActive) {
      throw new BadRequestException(
        'Bạn không thể tự khóa tài khoản của chính mình!',
      );
    }
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: dto.isActive,
        ...(!dto.isActive && { refreshToken: null }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
      },
    });
  }
  async resetPassword(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    const DEFAULT_PASSWORD = 'USER123456';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);
    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        isFirstLogin: true,
        refreshToken: null,
      },
    });
    return {
      success: true,
      message: `Đặt lại mật khẩu cho "${user.fullName}"`,
      defaultPassword: DEFAULT_PASSWORD,  
    };
  }
  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
