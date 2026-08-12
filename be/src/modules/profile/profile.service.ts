import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateStatusSignalDto } from './dto/update-status-signal.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: effectiveUserId },
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
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return {
      ...user,
      globalRole: user.role,
      avatarUrl: user.avatar || '',
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: effectiveUserId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        bio: dto.bio,
        jobTitle: dto.jobTitle,
        profession: dto.profession as any,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      avatarUrl: updatedUser.avatar || '',
      coverImage: updatedUser.coverImage,
      globalRole: updatedUser.role,
      profession: updatedUser.profession,
      jobTitle: updatedUser.jobTitle,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      statusSignal: updatedUser.statusSignal,
      customStatus: updatedUser.customStatus,
    };
  }

  async updateStatusSignal(userId: string, dto: UpdateStatusSignalDto) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: effectiveUserId },
      data: {
        statusSignal: dto.statusSignal as any,
        customStatus: dto.customStatus,
      },
    });

    return {
      statusSignal: updatedUser.statusSignal,
      customStatus: updatedUser.customStatus,
    };
  }

  async changePassword(_userId: string, _dto: ChangePasswordDto) {
    // Skeleton implementation for Step 1
    return { message: 'Đổi mật khẩu thành công (Step 1 Skeleton)' };
  }

  async getPersonalStats(userId: string) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    // Skeleton calculation for Step 1
    const completedTasks = await this.prisma.task.count({
      where: { assigneeId: effectiveUserId, status: 'DONE' },
    });

    const inProgressTasks = await this.prisma.task.count({
      where: { assigneeId: effectiveUserId, status: 'IN_PROGRESS' },
    });

    const overdueTasks = await this.prisma.task.count({
      where: {
        assigneeId: effectiveUserId,
        status: { not: 'DONE' },
        dueDate: { lt: new Date() },
      },
    });

    return {
      completedTasks,
      overdueTasks,
      inProgressTasks,
      attendanceStreak: 14,
    };
  }
}
