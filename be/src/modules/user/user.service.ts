import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
