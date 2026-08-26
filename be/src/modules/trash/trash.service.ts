import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrashService {
  private readonly logger = new Logger(TrashService.name);

  constructor(private readonly prisma: PrismaService) {}

  private checkAdmin(user: any) {
    if (user?.role !== 'ADMIN' && user?.globalRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Chỉ Quản trị viên (Admin) mới có quyền truy cập Thùng Rác Hệ Thống!',
      );
    }
  }

  // 🧹 [CC-02] Tự động quét và xóa vĩnh viễn dữ liệu đã hết hạn 14 ngày (Auto-Purge)
  private async autoPurgeExpiredTrash() {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    try {
      const [purgedTasks, purgedProjects] = await this.prisma.$transaction(
        async (tx) => {
          const tCount = await tx.task.deleteMany({
            where: { isDeleted: true, deletedAt: { lte: fourteenDaysAgo } },
          });
          const pCount = await tx.project.deleteMany({
            where: { isDeleted: true, deletedAt: { lte: fourteenDaysAgo } },
          });
          return [tCount.count, pCount.count];
        },
      );

      if (purgedTasks > 0 || purgedProjects > 0) {
        this.logger.log(
          `[AUTO-PURGE 14-DAY RETENTION] Đã tự động dọn sạch ${purgedProjects} Dự án và ${purgedTasks} Task hết hạn lưu giữ.`,
        );
      }
    } catch (err) {
      this.logger.warn(`Lỗi auto-purge thùng rác: ${err}`);
    }
  }

  // 📋 Lấy toàn bộ danh sách dữ liệu trong Thùng Rác (14-Day Retention Policy)
  async getTrashSummary(user: any) {
    this.checkAdmin(user);

    // 🧹 Tự động dọn dẹp các mục quá hạn 14 ngày trước khi tổng hợp danh sách
    await this.autoPurgeExpiredTrash();

    const now = new Date();
    const RETENTION_DAYS = 14;

    const [deletedProjects, deletedTasks] = await Promise.all([
      this.prisma.project.findMany({
        where: { isDeleted: true },
        include: {
          createdBy: {
            select: { id: true, fullName: true, avatar: true, email: true },
          },
          manager: {
            select: { id: true, fullName: true, avatar: true, email: true },
          },
          _count: {
            select: { tasks: true, members: true },
          },
        },
        orderBy: { deletedAt: 'desc' },
      }),
      this.prisma.task.findMany({
        where: { isDeleted: true },
        include: {
          project: {
            select: { id: true, name: true, isDeleted: true },
          },
          assignee: {
            select: { id: true, fullName: true, avatar: true, email: true },
          },
          createdBy: {
            select: { id: true, fullName: true, avatar: true, email: true },
          },
        },
        orderBy: { deletedAt: 'desc' },
      }),
    ]);

    // Tính toán thời gian lưu giữ còn lại của 14 ngày
    const formattedProjects = deletedProjects.map((p) => {
      const delTime = p.deletedAt
        ? new Date(p.deletedAt).getTime()
        : now.getTime();
      const expireTime = delTime + RETENTION_DAYS * 24 * 60 * 60 * 1000;
      const msLeft = Math.max(0, expireTime - now.getTime());
      const daysLeft = Math.floor(msLeft / (24 * 60 * 60 * 1000));
      const hoursLeft = Math.floor(
        (msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
      );

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        deletedAt: p.deletedAt,
        expiresAt: new Date(expireTime),
        daysLeft,
        hoursLeft,
        timeRemainingText:
          daysLeft > 0
            ? `Còn ${daysLeft} ngày ${hoursLeft} giờ`
            : `Còn ${hoursLeft} giờ`,
        tasksCount: p._count.tasks,
        membersCount: p._count.members,
        createdBy: p.createdBy,
        manager: p.manager,
      };
    });

    const formattedTasks = deletedTasks.map((t) => {
      const delTime = t.deletedAt
        ? new Date(t.deletedAt).getTime()
        : now.getTime();
      const expireTime = delTime + RETENTION_DAYS * 24 * 60 * 60 * 1000;
      const msLeft = Math.max(0, expireTime - now.getTime());
      const daysLeft = Math.floor(msLeft / (24 * 60 * 60 * 1000));
      const hoursLeft = Math.floor(
        (msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
      );

      return {
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        projectId: t.projectId,
        projectName: t.project?.name || 'Dự án không xác định',
        isParentProjectDeleted: t.project?.isDeleted || false,
        deletedAt: t.deletedAt,
        expiresAt: new Date(expireTime),
        daysLeft,
        hoursLeft,
        timeRemainingText:
          daysLeft > 0
            ? `Còn ${daysLeft} ngày ${hoursLeft} giờ`
            : `Còn ${hoursLeft} giờ`,
        assignee: t.assignee,
        createdBy: t.createdBy,
      };
    });

    return {
      projects: formattedProjects,
      tasks: formattedTasks,
      totalProjects: formattedProjects.length,
      totalTasks: formattedTasks.length,
      totalItems: formattedProjects.length + formattedTasks.length,
      retentionPolicyDays: RETENTION_DAYS,
    };
  }

  // 🧹 Dọn sạch toàn bộ thùng rác (Xóa vĩnh viễn tất cả)
  async emptyTrash(user: any) {
    this.checkAdmin(user);

    const [deletedTasks, deletedProjects] = await this.prisma.$transaction(
      async (tx) => {
        const taskRes = await tx.task.deleteMany({
          where: { isDeleted: true },
        });
        const projectRes = await tx.project.deleteMany({
          where: { isDeleted: true },
        });
        return [taskRes.count, projectRes.count];
      },
    );

    this.logger.log(
      `Admin ${user?.fullName || ''} đã dọn sạch Thùng Rác (${deletedProjects} Dự án, ${deletedTasks} Task)`,
    );

    return {
      success: true,
      message: `Đã dọn sạch Thùng Rác vĩnh viễn: ${deletedProjects} Dự án và ${deletedTasks} Task.`,
    };
  }
}
