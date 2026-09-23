import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateStatusSignalDto } from './dto/update-status-signal.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway
  ) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatar: true,
        profession: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        coverImage: true,
        role: true,
        profession: true,
        jobTitle: true,
        phone: true,
        bio: true,
        statusSignal: true,
        customStatus: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        ownedProjects: {
          where: { isDeleted: false },
          select: { id: true, name: true, description: true },
        },
        managedProjects: {
          where: { isDeleted: false },
          select: { id: true, name: true, description: true },
        },
        memberships: {
          where: { project: { isDeleted: false } },
          select: {
            project: {
              select: { id: true, name: true, description: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const userProjectsMap = new Map<
      string,
      { id: string; name: string; description?: string; roleInProject: string }
    >();

    user.ownedProjects?.forEach((p) => {
      userProjectsMap.set(p.id, {
        id: p.id,
        name: p.name,
        description: p.description || '',
        roleInProject: 'Chủ dự án (Owner)',
      });
    });

    user.managedProjects?.forEach((p) => {
      if (!userProjectsMap.has(p.id)) {
        userProjectsMap.set(p.id, {
          id: p.id,
          name: p.name,
          description: p.description || '',
          roleInProject: 'Quản lý dự án (Manager)',
        });
      }
    });

    user.memberships?.forEach((m) => {
      if (m.project && !userProjectsMap.has(m.project.id)) {
        userProjectsMap.set(m.project.id, {
          id: m.project.id,
          name: m.project.name,
          description: m.project.description || '',
          roleInProject: 'Thành viên (Member)',
        });
      }
    });

    const assignedProjects = Array.from(userProjectsMap.values());

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar || '',
      avatarUrl: user.avatar || '',
      coverImage: user.coverImage,
      globalRole: user.role,
      role: user.role,
      profession: user.profession,
      jobTitle: user.jobTitle,
      phone: user.phone,
      bio: user.bio,
      statusSignal: user.statusSignal,
      customStatus: user.customStatus,
      createdAt: user.createdAt,
      department: user.department,
      assignedProjects,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const dataToUpdate: any = {};
    if (dto.fullName !== undefined) dataToUpdate.fullName = dto.fullName;
    if (dto.phone !== undefined) dataToUpdate.phone = dto.phone;
    if (dto.bio !== undefined) dataToUpdate.bio = dto.bio;
    if (dto.jobTitle !== undefined) dataToUpdate.jobTitle = dto.jobTitle;
    if (dto.profession !== undefined) dataToUpdate.profession = dto.profession;
    if (dto.avatar !== undefined) dataToUpdate.avatar = dto.avatar;
    if (dto.coverImage !== undefined) dataToUpdate.coverImage = dto.coverImage;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    const result = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      avatar: updatedUser.avatar || '',
      avatarUrl: updatedUser.avatar || '',
      coverImage: updatedUser.coverImage,
      globalRole: updatedUser.role,
      role: updatedUser.role,
      profession: updatedUser.profession,
      jobTitle: updatedUser.jobTitle,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      statusSignal: updatedUser.statusSignal,
      customStatus: updatedUser.customStatus,
      department: updatedUser.department,
      departmentId: updatedUser.departmentId,
    };

    try {
      this.socketGateway.server.emit('user:profile-updated', result);
      this.socketGateway.server.emit('user:updated', result);
    } catch (err) {
      // Ignore socket emit error
    }

    return result;
  }

  async updateStatusSignal(userId: string, dto: UpdateStatusSignalDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        statusSignal: dto.statusSignal as any,
        customStatus: dto.customStatus,
      },
    });

    const result = {
      userId,
      statusSignal: updatedUser.statusSignal,
      customStatus: updatedUser.customStatus,
    };

    try {
      this.socketGateway.server.emit('user:status-changed', result);
    } catch (err) {
      // Ignore socket emit error
    }

    return {
      statusSignal: updatedUser.statusSignal,
      customStatus: updatedUser.customStatus,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const bcrypt = await import('bcrypt');
    if (user.password) {
      const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu hiện tại không chính xác');
      }
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        refreshToken: null, // Thu hồi phiên đăng nhập cũ để bảo mật
      },
    });

    return {
      message: 'Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho các lần đăng nhập sau.',
    };
  }

  async getPersonalStats(userId: string) {
    const now = new Date();
    const [completedTasks, inProgressTasks, overdueTasks, totalAssignedTasks] = await Promise.all([
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'DONE',
          isDeleted: false,
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'IN_PROGRESS',
          isDeleted: false,
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: { not: 'DONE' },
          isDeleted: false,
          dueDate: { lt: now },
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          isDeleted: false,
        },
      }),
    ]);

    return {
      completedTasks,
      overdueTasks,
      inProgressTasks,
      totalAssignedTasks,
    };
  }
}
