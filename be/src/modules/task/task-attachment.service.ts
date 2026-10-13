import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { TaskActivityService } from './task-activity.service';
import { AuthUserPayload } from '../../common/interfaces/auth-user.interface';

@Injectable()
export class TaskAttachmentService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
    private activityService: TaskActivityService
  ) {}

  async addAttachment(
    taskId: string,
    file: { originalname?: string; filename?: string; mimetype?: string; size?: number; buffer?: Buffer } | any,
    body: { name?: string; url?: string; type?: string },
    user?: AuthUserPayload
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task || task.isDeleted) {
      throw new NotFoundException('Task không tồn tại hoặc đã bị xóa vào thùng rác');
    }

    if (user) {
      const isAdminOrManager =
        user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER';
      const isMember =
        task.project?.members.some((m) => m.userId === user.id) ||
        task.project?.managerId === user.id ||
        task.project?.createdById === user.id ||
        task.assigneeId === user.id ||
        task.createdById === user.id;

      if (!isAdminOrManager && !isMember) {
        throw new ForbiddenException('Bạn không phải là thành viên của dự án này để tải tệp đính kèm');
      }
    }

    let attachmentData: any = {};

    if (file) {
      const maxSizeBytes = 100 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new BadRequestException('Dung lượng tệp đính kèm vượt quá giới hạn tối đa cho phép (100MB)!');
      }

      const safeFilename = (file.originalname || 'file')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, '_');
      const uniqueName = `${Date.now()}-${safeFilename}`;
      const fs = await import('fs');
      const path = await import('path');
      const uploadsDir = path.join(process.cwd(), 'uploads');

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uploadPath = path.join(uploadsDir, uniqueName);
      if (file.buffer) {
        fs.writeFileSync(uploadPath, file.buffer);
      }

      attachmentData = {
        name: safeFilename,
        url: `/uploads/${uniqueName}`,
        type: file.mimetype || 'file',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      };
    } else if (body.url) {
      attachmentData = {
        name: body.name || 'Liên kết ngoài',
        url: body.url,
        type: body.type || 'link',
        size: 0,
      };
    } else {
      throw new BadRequestException('Vui lòng cung cấp file hoặc URL');
    }

    const attachment = await this.prisma.attachment.create({
      data: {
        ...attachmentData,
        taskId,
      },
    });

    await this.activityService.createTaskHistory(
      taskId,
      user?.id || 'SYSTEM',
      `Đã đính kèm tệp: "${attachmentData.name}"`,
      'attachment',
      null,
      attachmentData.name
    );

    if (task.projectId) {
      const updatedTaskObj = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignee: {
            select: { id: true, fullName: true, email: true, avatar: true },
          },
          subtasks: {
            include: {
              assignee: { select: { id: true, fullName: true, email: true } },
            },
          },
          tags: { include: { tag: true } },
          attachments: true,
        },
      });
      this.socketGateway.broadcastToProject(task.projectId, 'task:updated', this.mapTaskResponse(updatedTaskObj));
    }

    return attachment;
  }

  async deleteAttachment(attachmentId: string, user?: AuthUserPayload) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          select: {
            id: true,
            status: true,
            projectId: true,
            assigneeId: true,
            createdById: true,
            project: { select: { managerId: true, createdById: true } },
          },
        },
      },
    });
    if (!attachment) {
      throw new NotFoundException('Đính kèm không tồn tại');
    }

    if (attachment.task?.status === 'DONE') {
      throw new BadRequestException(
        'Không thể xóa tệp đính kèm của Task đã hoàn thành nhằm bảo vệ tính toàn vẹn dữ liệu nghiệm thu.'
      );
    }

    if (user) {
      const isAdminOrManager =
        user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER' ||
        attachment.task?.project?.managerId === user.id ||
        attachment.task?.project?.createdById === user.id;
      const isOwner = attachment.task?.assigneeId === user.id || attachment.task?.createdById === user.id;

      if (!isAdminOrManager && !isOwner) {
        throw new ForbiddenException(
          'Chỉ người thực hiện Task, người tạo Task hoặc Quản lý dự án mới có quyền xóa tệp đính kèm'
        );
      }
    }

    if (attachment.type === 'file') {
      const fs = require('fs');
      const path = require('path');
      const filename = path.basename(attachment.url);
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          // ignore
        }
      }
    }

    await this.prisma.attachment.delete({ where: { id: attachmentId } });

    const task = await this.prisma.task.findUnique({
      where: { id: attachment.taskId },
    });
    if (task?.projectId) {
      const updatedTaskObj = await this.prisma.task.findUnique({
        where: { id: attachment.taskId },
        include: {
          project: { select: { id: true, name: true } },
          assignee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              profession: true,
            },
          },
          tags: { include: { tag: true } },
          attachments: true,
        },
      });
      this.socketGateway.broadcastToProject(task.projectId, 'task:updated', this.mapTaskResponse(updatedTaskObj));
    }

    return { success: true };
  }

  private mapTaskResponse(t: any) {
    return {
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      status: t.status,
      priority: t.priority,
      progress: t.progress,
      startDate: t.startDate ? t.startDate.toISOString().slice(0, 10) : undefined,
      dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : undefined,
      projectName: t.project?.name || 'Solaris Core',
      assigneeId: t.assigneeId || undefined,
      assignee: t.assignee
        ? {
            id: t.assignee.id,
            fullName: t.assignee.fullName,
            avatar: t.assignee.avatar || undefined,
            profession: t.assignee.profession,
          }
        : undefined,
      tags: t.tags ? t.tags.map((tt: any) => ({ id: tt.tag?.id, name: tt.tag?.name, color: 'amber' })) : [],
      attachments: t.attachments
        ? t.attachments.map((att: any) => ({
            id: att.id,
            name: att.name,
            url: att.url,
            type: att.type,
            size: att.size || undefined,
            createdAt: att.createdAt ? att.createdAt.toISOString() : undefined,
          }))
        : [],
    };
  }
}
