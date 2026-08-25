import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateStatusSignalDto } from './dto/update-status-signal.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

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
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({
        where: { email: 'huydatne@gmail.com' },
      });
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
      avatar: user.avatar || '',
      globalRole: user.role,
      avatarUrl: user.avatar || '',
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({
        where: { email: 'huydatne@gmail.com' },
      });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const dataToUpdate: any = {};
    if (dto.fullName !== undefined) dataToUpdate.fullName = dto.fullName;
    if (dto.phone !== undefined) dataToUpdate.phone = dto.phone;
    if (dto.bio !== undefined) dataToUpdate.bio = dto.bio;
    if (dto.jobTitle !== undefined) dataToUpdate.jobTitle = dto.jobTitle;
    if (dto.profession !== undefined) dataToUpdate.profession = dto.profession;
    if (dto.avatar !== undefined) dataToUpdate.avatar = dto.avatar;
    if (dto.coverImage !== undefined) dataToUpdate.coverImage = dto.coverImage;

    const updatedUser = await this.prisma.user.update({
      where: { id: effectiveUserId },
      data: dataToUpdate,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      avatar: updatedUser.avatar || '',
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
      const realAdmin = await this.prisma.user.findUnique({
        where: { email: 'huydatne@gmail.com' },
      });
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

  async changePassword(userId: string, dto: ChangePasswordDto) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({
        where: { email: 'huydatne@gmail.com' },
      });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: effectiveUserId },
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
      where: { id: effectiveUserId },
      data: {
        password: hashedNewPassword,
        refreshToken: null, // Thu hồi phiên đăng nhập cũ để bảo mật
      },
    });

    return {
      message:
        'Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho các lần đăng nhập sau.',
    };
  }

  async getPersonalStats(userId: string) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({
        where: { email: 'huydatne@gmail.com' },
      });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const completedTasks = await this.prisma.task.count({
      where: { assigneeId: effectiveUserId, status: 'DONE', isDeleted: false },
    });

    const inProgressTasks = await this.prisma.task.count({
      where: {
        assigneeId: effectiveUserId,
        status: 'IN_PROGRESS',
        isDeleted: false,
      },
    });

    const overdueTasks = await this.prisma.task.count({
      where: {
        assigneeId: effectiveUserId,
        status: { not: 'DONE' },
        isDeleted: false,
        dueDate: { lt: new Date() },
      },
    });

    return {
      completedTasks,
      overdueTasks,
      inProgressTasks,
      totalAssignedTasks: completedTasks + overdueTasks + inProgressTasks,
    };
  }
}
