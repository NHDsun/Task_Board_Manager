import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  // 🔔 Gửi thông báo đến người dùng (Lưu CSDL + Phát sóng WebSockets Realtime tới phòng riêng)
  async sendNotification(dto: CreateNotificationDto) {
    try {
      // 🛑 [LC-83] CHẶN TỰ GỬI THÔNG BÁO CHO CHÍNH MÌNH (SELF-NOTIFICATION ELIMINATION)
      if (dto.actorId && dto.userId && dto.actorId === dto.userId) {
        return null;
      }

      // 🛑 [LC-84] KIỂM TRA QUYỀN THÀNH VIÊN DỰ ÁN (PROJECT MEMBERSHIP ISOLATION)
      if (dto.projectId && dto.type !== 'SYSTEM') {
        const project = await this.prisma.project.findUnique({
          where: { id: dto.projectId },
          include: { members: true },
        });
        if (project) {
          const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
          });
          const isAdmin = user?.role === 'ADMIN';
          const isMember =
            isAdmin ||
            project.managerId === dto.userId ||
            project.createdById === dto.userId ||
            project.members.some((m) => m.userId === dto.userId);
          if (!isMember) {
            this.logger.warn(
              `[LC-84] Chặn thông báo tới User ${dto.userId} vì không còn thuộc dự án ${dto.projectId}`,
            );
            return null;
          }
        }
      }

      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          actorId: dto.actorId || undefined,
          title: dto.title,
          content: dto.content,
          type: dto.type || 'SYSTEM',
          taskId: dto.taskId || undefined,
          subtaskId: dto.subtaskId || undefined,
          projectId: dto.projectId || undefined,
          isRead: false,
        },
        include: {
          actor: {
            select: { id: true, fullName: true, avatar: true, email: true },
          },
          task: {
            select: { id: true, title: true, status: true, priority: true },
          },
        },
      });

      // ⚡ Phát sóng trực tiếp tới user qua Socket.IO room `user:${userId}`
      this.socketGateway.sendToUser(
        dto.userId,
        'notification:new',
        notification,
      );
      this.logger.log(
        `Đã gửi thông báo [${dto.type}] tới User ${dto.userId}: "${dto.title}"`,
      );

      return notification;
    } catch (err) {
      this.logger.error(`Lỗi khi tạo và gửi thông báo: ${err.message}`, err.stack);
      return null;
    }
  }

  // 📋 Lấy danh sách thông báo của người dùng
  async findAll(userId: string, query?: QueryNotificationDto) {
    const where: any = { userId };

    if (query?.unreadOnly) {
      where.isRead = false;
    }

    if (query?.type) {
      where.type = query.type;
    }

    const limit = query?.limit ? Math.min(100, Math.max(1, Number(query.limit))) : 50;
    const page = query?.page ? Math.max(1, Number(query.page)) : 1;
    const skip = (page - 1) * limit;

    // 🧹 [CC-06] Tự động dọn dẹp các thông báo đã đọc quá 30 ngày để tối ưu dung lượng CSDL
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.prisma.notification
      .deleteMany({
        where: { userId, isRead: true, createdAt: { lte: thirtyDaysAgo } },
      })
      .catch(() => {});

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, fullName: true, avatar: true, email: true },
          },
          task: {
            select: { id: true, title: true, status: true, priority: true },
          },
        },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications,
      total,
      unreadCount,
      page,
      limit,
    };
  }

  // 🔢 Đếm số lượng thông báo chưa đọc
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  // 👁️ Đánh dấu 1 thông báo đã đọc
  async markAsRead(id: string, userId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notif) {
      throw new NotFoundException('Thông báo không tồn tại hoặc không thuộc về bạn');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    this.socketGateway.sendToUser(userId, 'notification:read', {
      id,
      unreadCount,
    });

    return updated;
  }

  // ✅ Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    this.socketGateway.sendToUser(userId, 'notification:read-all', {
      unreadCount: 0,
    });

    return { success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc.' };
  }

  // 🗑️ Xóa thông báo
  async deleteNotification(id: string, userId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notif) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    await this.prisma.notification.delete({ where: { id } });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    this.socketGateway.sendToUser(userId, 'notification:deleted', {
      id,
      unreadCount,
    });

    return { success: true, message: 'Đã xóa thông báo thành công.' };
  }
}
