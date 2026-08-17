import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

    // Calculate real attendance logs count (Total check-in days)
    const attendanceStreak = await this.prisma.attendanceLog.count({
      where: { userId: effectiveUserId },
    });

    return {
      completedTasks,
      overdueTasks,
      inProgressTasks,
      attendanceStreak: Math.max(1, attendanceStreak),
    };
  }

  async getTodayAttendance(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const log = await this.prisma.attendanceLog.findFirst({
      where: {
        userId,
        checkInAt: { gte: startOfDay },
      },
      orderBy: { checkInAt: 'desc' },
    });

    if (!log) {
      return {
        isCheckedIn: false,
        checkInAt: null,
        checkOutAt: null,
        durationMinutes: 0,
        workMode: 'OFFICE',
        formattedTime: '00h:00m',
      };
    }

    const checkInTime = new Date(log.checkInAt).getTime();
    const endTime = log.checkOutAt ? new Date(log.checkOutAt).getTime() : Date.now();
    const durationMinutes = Math.max(0, Math.floor((endTime - checkInTime) / (1000 * 60)));

    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const formattedTime = `${String(hours).padStart(2, '0')}h:${String(mins).padStart(2, '0')}m`;

    return {
      isCheckedIn: !log.checkOutAt,
      checkInAt: log.checkInAt,
      checkOutAt: log.checkOutAt,
      durationMinutes,
      workMode: log.workMode || 'OFFICE',
      formattedTime,
    };
  }

  async checkIn(userId: string, type: 'VOICE' | 'TASK_DRIVEN' | 'MANUAL' = 'VOICE', workMode: 'OFFICE' | 'REMOTE' = 'OFFICE') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // If there is an active check-in today without checkOutAt, reuse it
    let log = await this.prisma.attendanceLog.findFirst({
      where: {
        userId,
        checkInAt: { gte: startOfDay },
        checkOutAt: null,
      },
    });

    if (!log) {
      log = await this.prisma.attendanceLog.create({
        data: {
          userId,
          type: (type as any) || 'VOICE',
          workMode: (workMode as any) || 'OFFICE',
          note: `Điểm danh ca làm việc qua ${type}`,
        },
      });
    }

    return this.getTodayAttendance(userId);
  }

  async checkOut(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const log = await this.prisma.attendanceLog.findFirst({
      where: {
        userId,
        checkInAt: { gte: startOfDay },
        checkOutAt: null,
      },
      orderBy: { checkInAt: 'desc' },
    });

    if (log) {
      await this.prisma.attendanceLog.update({
        where: { id: log.id },
        data: {
          checkOutAt: new Date(),
        },
      });
    }

    return this.getTodayAttendance(userId);
  }
}
