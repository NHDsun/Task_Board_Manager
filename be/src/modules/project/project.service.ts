import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        createdById: effectiveUserId,
        members: {
          create: {
            userId: effectiveUserId,
          },
        },
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatar: true } },
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    return this.prisma.project.findMany({
      where: {
        OR: [
          { createdById: effectiveUserId },
          { members: { some: { userId: effectiveUserId } } },
        ],
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        _count: {
          select: { tasks: true, members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatar: true, profession: true, jobTitle: true } },
          },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, fullName: true, email: true, avatar: true } },
            tags: { include: { tag: true } },
            _count: { select: { comments: true, subtasks: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
