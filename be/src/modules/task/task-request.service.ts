import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { TaskSubtaskService } from './task-subtask.service';

@Injectable()
export class TaskRequestService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
    private subtaskService: TaskSubtaskService
  ) {}

  async createTaskRequest(senderId: string, dto: any) {
    const targetTask = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
      include: {
        project: {
          select: { id: true, name: true, managerId: true, createdById: true },
        },
      },
    });
    if (!targetTask || targetTask.isDeleted) {
      throw new NotFoundException('Task không tồn tại hoặc đã bị xóa vào thùng rác');
    }

    const senderUser = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    const isManagerOrAdmin = Boolean(
      senderUser &&
      (senderUser.role === 'ADMIN' ||
        senderUser.role === 'MANAGER' ||
        (senderUser as any).globalRole === 'ADMIN' ||
        (senderUser as any).globalRole === 'MANAGER' ||
        targetTask.project?.managerId === senderId ||
        targetTask.project?.createdById === senderId)
    );

    if (targetTask.status === 'DONE') {
      throw new BadRequestException('Không thể gửi yêu cầu chuyển giao cho Task đã hoàn thành!');
    }

    if (targetTask.status === 'PAUSED' || targetTask.status === 'BLOCKED') {
      throw new BadRequestException(
        `Task đang ở trạng thái ${targetTask.status === 'PAUSED' ? 'Tạm Dừng' : 'Bị Nghẽn'}, không thể gửi yêu cầu chuyển giao. Vui lòng khôi phục trạng thái Đang Thực Hiện trước.`
      );
    }

    const effectiveSenderId = senderId;
    const effectiveReceiverId = dto.receiverId;

    if (effectiveSenderId === effectiveReceiverId) {
      throw new BadRequestException('Không thể gửi yêu cầu chuyển giao hoặc hỗ trợ cho chính bản thân mình!');
    }

    if (!dto.subtaskId && targetTask.assigneeId === effectiveReceiverId) {
      throw new BadRequestException('Nhân sự này đã đang trực tiếp đảm nhiệm Task này.');
    }

    const isReceiverInProject = await this.prisma.projectMember.findFirst({
      where: { projectId: targetTask.projectId, userId: effectiveReceiverId },
    });
    const isReceiverManagerOrCreator =
      targetTask.project &&
      (targetTask.project.managerId === effectiveReceiverId || targetTask.project.createdById === effectiveReceiverId);
    if (!isReceiverInProject && !isReceiverManagerOrCreator) {
      throw new BadRequestException('Người nhận chuyển giao không thuộc thành viên của Dự án này!');
    }

    const receiverUser = await this.prisma.user.findUnique({
      where: { id: effectiveReceiverId },
    });

    if (dto.subtaskId) {
      const targetSubtask = await this.prisma.subtask.findUnique({
        where: { id: dto.subtaskId },
      });
      if (!targetSubtask || targetSubtask.taskId !== targetTask.id) {
        throw new NotFoundException('Task con không tồn tại trong Task này');
      }
      if (targetSubtask.isDone) {
        throw new BadRequestException('Không thể chuyển giao Task con đã hoàn thành nghiệm thu!');
      }
      if (targetSubtask.assigneeId === effectiveReceiverId) {
        throw new BadRequestException('Nhân sự này đã đang trực tiếp phụ trách Task con này.');
      }

      const isSubtaskOwner =
        targetSubtask.assigneeId === effectiveSenderId ||
        targetTask.assigneeId === effectiveSenderId ||
        targetTask.createdById === effectiveSenderId;

      if (!isSubtaskOwner && !isManagerOrAdmin) {
        throw new ForbiddenException('Bạn chỉ có quyền chuyển giao Task con do chính mình phụ trách!');
      }

      if (isManagerOrAdmin) {
        return this.prisma.$transaction(async (tx) => {
          await tx.subtask.update({
            where: { id: dto.subtaskId },
            data: { assigneeId: effectiveReceiverId },
          });

          await tx.taskRequest.updateMany({
            where: {
              taskId: targetTask.id,
              note: { contains: dto.subtaskId },
              status: 'PENDING',
            },
            data: {
              status: 'CANCELLED',
              responseNote: 'Quản lý đã trực tiếp phân công nhân sự mới.',
            },
          });

          const reqItem = await tx.taskRequest.create({
            data: {
              taskId: dto.taskId,
              senderId: effectiveSenderId,
              receiverId: effectiveReceiverId,
              type: dto.type || 'TRANSFER',
              status: 'ACCEPTED',
              note: `[Chuyển giao Minitask] ${targetSubtask.title} (SubtaskId: ${dto.subtaskId}) - ${dto.note || 'Phân công trực tiếp từ Quản lý'}`,
              responseNote: 'Đã phân công trực tiếp bởi Quản lý',
            },
          });

          try {
            await tx.comment.create({
              data: {
                taskId: dto.taskId,
                userId: effectiveSenderId,
                content: `👑 [QUẢN LÝ PHÂN CÔNG MINITASK] Task con "${targetSubtask.title}" đã được phân công trực tiếp cho ${receiverUser?.fullName || 'Nhân sự mới'}.`,
              },
            });
          } catch {}

          this.socketGateway.broadcastToProject(targetTask.projectId, 'task:updated', { taskId: targetTask.id });

          return reqItem;
        });
      }

      const existingPending = await this.prisma.taskRequest.findFirst({
        where: {
          taskId: dto.taskId,
          type: 'TRANSFER',
          status: 'PENDING',
          note: { contains: dto.subtaskId },
        },
      });
      if (existingPending) {
        throw new BadRequestException('Task con này đang có một yêu cầu chuyển giao chờ phản hồi!');
      }

      const reqItem = await this.prisma.taskRequest.create({
        data: {
          taskId: dto.taskId,
          senderId: effectiveSenderId,
          receiverId: effectiveReceiverId,
          type: dto.type || 'TRANSFER',
          status: 'PENDING',
          note: `[Chuyển giao Minitask] ${targetSubtask.title} (SubtaskId: ${dto.subtaskId}) - ${dto.note || 'Yêu cầu chuyển giao Task con'}`,
        },
      });

      await this.prisma.task.update({
        where: { id: dto.taskId },
        data: { status: 'IN_REVIEW' },
      });

      this.socketGateway.broadcastToProject(targetTask.projectId, 'task:request-created', {
        taskId: dto.taskId,
        taskTitle: targetTask.title,
        subtaskTitle: targetSubtask.title,
        senderName: senderUser?.fullName || 'Đồng nghiệp',
        receiverId: effectiveReceiverId,
        note: dto.note,
      });

      return reqItem;
    }

    if (isManagerOrAdmin) {
      await this.prisma.task.update({
        where: { id: dto.taskId },
        data: {
          assigneeId: effectiveReceiverId,
          status: 'IN_PROGRESS',
        },
      });

      await this.prisma.taskRequest.updateMany({
        where: {
          taskId: targetTask.id,
          type: 'SUBTASK_APPROVAL',
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
          responseNote: 'Đã tự động hủy do Quản lý phân công task cho nhân sự mới.',
        },
      });

      await this.prisma.subtask.updateMany({
        where: { taskId: targetTask.id, approvalStatus: 'PENDING' },
        data: { approvalStatus: 'NONE' },
      });

      const reqItem = await this.prisma.taskRequest.create({
        data: {
          taskId: dto.taskId,
          senderId: effectiveSenderId,
          receiverId: effectiveReceiverId,
          type: dto.type || 'TRANSFER',
          status: 'ACCEPTED',
          note: dto.note || 'Phân công Task trực tiếp từ Quản lý',
          responseNote: 'Đã phân công trực tiếp bởi Quản lý',
        },
      });

      try {
        await this.prisma.comment.create({
          data: {
            taskId: dto.taskId,
            userId: effectiveSenderId,
            content: `👑 [PHÂN CÔNG TRỰC TIẾP TỪ QUẢN LÝ] Quản lý ${senderUser?.fullName || 'Quản lý'} đã phân công trực tiếp Task này cho ${receiverUser?.fullName || 'Nhân sự'}. Ghi chú: "${dto.note || 'Thực hiện Task'}"`,
          },
        });
      } catch {}

      this.socketGateway.broadcastToProject(targetTask.projectId, 'task:assigned-by-manager', {
        taskId: dto.taskId,
        taskTitle: targetTask.title,
        assigneeId: effectiveReceiverId,
        assigneeName: receiverUser?.fullName || 'Nhân sự',
        managerName: senderUser?.fullName || 'Quản lý',
        note: dto.note,
      });

      const updatedTaskObj = await this.prisma.task.findUnique({
        where: { id: dto.taskId },
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
          createdBy: {
            select: { id: true, fullName: true, email: true, avatar: true },
          },
          tags: { include: { tag: true } },
          subtasks: {
            include: {
              assignee: { select: { id: true, fullName: true, avatar: true } },
            },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          },
          attachments: true,
          _count: { select: { comments: true } },
        },
      });
      if (updatedTaskObj) {
        this.socketGateway.broadcastToProject(
          targetTask.projectId,
          'task:updated',
          this.subtaskService.mapTaskResponse(updatedTaskObj)
        );
      }

      return reqItem;
    }

    const existingPending = await this.prisma.taskRequest.findFirst({
      where: { taskId: dto.taskId, type: 'TRANSFER', status: 'PENDING' },
    });
    if (existingPending) {
      throw new BadRequestException(
        'Task này đang có một yêu cầu chuyển giao chờ phản hồi. Vui lòng chờ người nhận xử lý trước khi gửi yêu cầu mới.'
      );
    }

    const reqItem = await this.prisma.taskRequest.create({
      data: {
        taskId: dto.taskId,
        senderId: effectiveSenderId,
        receiverId: effectiveReceiverId,
        type: dto.type || 'TRANSFER',
        status: 'PENDING',
        note: dto.note || 'Yêu cầu chuyển giao Task tác nghiệp',
      },
    });

    await this.prisma.task.update({
      where: { id: dto.taskId },
      data: { status: 'IN_REVIEW' },
    });

    this.socketGateway.broadcastToProject(targetTask.projectId, 'task:request-created', {
      taskId: dto.taskId,
      taskTitle: targetTask.title,
      senderName: senderUser?.fullName || 'Đồng nghiệp',
      receiverId: effectiveReceiverId,
      note: dto.note,
    });

    return reqItem;
  }

  async getOutgoingRequests(userId: string) {
    const requests = await this.prisma.taskRequest.findMany({
      where: {
        senderId: userId,
      },
      include: {
        task: { select: { id: true, title: true, priority: true } },
        receiver: {
          select: { id: true, fullName: true, avatar: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      taskId: r.taskId,
      taskTitle: r.task.title,
      priority: r.task.priority,
      type: r.type,
      receiverName: r.receiver.fullName,
      receiverAvatar: r.receiver.avatar || '',
      status: (r.status as string) === 'ACCEPTED' ? 'APPROVED' : r.status,
      note: r.note || 'Yêu cầu chuyển giao Task tác nghiệp',
      createdAt: r.createdAt.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }),
    }));
  }

  async cancelTaskRequest(requestId: string, userId: string) {
    const reqItem = await this.prisma.taskRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
        task: {
          select: {
            id: true,
            projectId: true,
            project: { select: { managerId: true, createdById: true } },
          },
        },
      },
    });

    if (!reqItem) {
      throw new NotFoundException('Yêu cầu không tồn tại');
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const isManagerOrAdmin = Boolean(
      currentUser &&
      (currentUser.role === 'ADMIN' ||
        currentUser.role === 'MANAGER' ||
        (currentUser as any).globalRole === 'ADMIN' ||
        (currentUser as any).globalRole === 'MANAGER' ||
        reqItem.task.project?.managerId === userId ||
        reqItem.task.project?.createdById === userId)
    );

    if (reqItem.senderId !== userId && !isManagerOrAdmin) {
      throw new ForbiddenException('Bạn chỉ có thể hủy yêu cầu do chính mình gửi đi (hoặc bởi Quản lý/Admin)!');
    }

    if (reqItem.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu đã được xử lý hoặc không ở trạng thái Chờ Duyệt (PENDING)');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.taskRequest.update({
        where: { id: requestId },
        data: { status: 'CANCELLED' as any },
      });

      if (reqItem.type === 'SUBTASK_APPROVAL') {
        const match = reqItem.note?.match(/SubtaskId:\s*([a-zA-Z0-9_-]+)/i);
        const subtaskId = match ? match[1] : null;
        if (subtaskId) {
          await tx.subtask.update({
            where: { id: subtaskId },
            data: { approvalStatus: 'NONE' },
          });
        }
      } else {
        await tx.task.update({
          where: { id: reqItem.taskId },
          data: { status: 'IN_PROGRESS' },
        });

        await tx.comment.create({
          data: {
            taskId: reqItem.taskId,
            userId: userId,
            content: `🚫 [HỦY YÊU CẦU CHUYỂN GIAO] ${reqItem.sender.fullName} đã hủy yêu cầu chuyển giao Task tới ${reqItem.receiver.fullName}. Task quay trở lại trạng thái Thực hiện.`,
          },
        });
      }

      return updated;
    });
  }

  async getIncomingRequests(userId: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    const isAdmin = currentUser?.role === 'ADMIN';

    const whereCondition: any = {
      status: 'PENDING',
      task: { isDeleted: false },
    };

    if (!isAdmin) {
      whereCondition.receiverId = userId;
    }

    const requests = await this.prisma.taskRequest.findMany({
      where: whereCondition,
      include: {
        task: { select: { id: true, title: true, priority: true } },
        sender: {
          select: { id: true, fullName: true, avatar: true, email: true },
        },
        receiver: {
          select: { id: true, fullName: true, avatar: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      taskId: r.taskId,
      taskTitle: r.task.title,
      priority: r.task.priority,
      type: r.type,
      senderName: r.sender.fullName,
      senderAvatar: r.sender.avatar || '',
      note: r.note || 'Yêu cầu chuyển giao Task tác nghiệp',
      createdAt: r.createdAt.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }),
    }));
  }

  async respondToRequest(requestId: string, userId: string, action: 'APPROVED' | 'REJECTED') {
    const reqItem = await this.prisma.taskRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
            project: { select: { managerId: true, createdById: true } },
          },
        },
      },
    });

    if (!reqItem) {
      throw new NotFoundException('Yêu cầu không tồn tại');
    }

    const responder = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const isManagerOrAdmin = Boolean(
      responder &&
      (responder.role === 'ADMIN' ||
        responder.role === 'MANAGER' ||
        (responder as any).globalRole === 'ADMIN' ||
        (responder as any).globalRole === 'MANAGER' ||
        reqItem.task.project?.managerId === userId ||
        reqItem.task.project?.createdById === userId)
    );

    if (!isManagerOrAdmin && userId !== reqItem.receiverId) {
      throw new ForbiddenException('Bạn không phải là người nhận yêu cầu này để thực hiện phản hồi.');
    }

    const targetStatus = action === 'APPROVED' ? 'ACCEPTED' : 'REJECTED';

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.taskRequest.update({
        where: { id: requestId },
        data: { status: targetStatus as any },
      });

      if (reqItem.type === 'SUBTASK_APPROVAL') {
        const match = reqItem.note?.match(/SubtaskId:\s*([a-zA-Z0-9_-]+)/i);
        const subtaskId = match ? match[1] : null;
        if (subtaskId) {
          if (action === 'APPROVED') {
            await tx.subtask.update({
              where: { id: subtaskId },
              data: {
                isDone: true,
                approvalStatus: 'APPROVED',
                rejectionReason: null,
              },
            });
          } else {
            await tx.subtask.update({
              where: { id: subtaskId },
              data: {
                isDone: false,
                approvalStatus: 'REJECTED',
                rejectionReason: 'Từ chối qua hộp thư phê duyệt',
              },
            });
          }
        }
      } else {
        const match = reqItem.note?.match(/SubtaskId:\s*([a-zA-Z0-9_-]+)/i);
        const subtaskId = match ? match[1] : null;

        if (subtaskId) {
          if (action === 'APPROVED') {
            await tx.subtask.update({
              where: { id: subtaskId },
              data: { assigneeId: reqItem.receiverId },
            });

            await tx.task.update({
              where: { id: reqItem.taskId },
              data: { status: 'IN_PROGRESS' },
            });

            try {
              await tx.comment.create({
                data: {
                  taskId: reqItem.taskId,
                  userId: userId || reqItem.receiverId,
                  content: `🔄 [CHUYỂN GIAO MINITASK THÀNH CÔNG] Task con đã được chuyển giao thành công từ ${reqItem.sender?.fullName || 'Đồng nghiệp'} sang ${reqItem.receiver?.fullName || 'Người nhận'}.`,
                },
              });
            } catch {}
          } else {
            await tx.task.update({
              where: { id: reqItem.taskId },
              data: { status: 'IN_PROGRESS' },
            });

            try {
              await tx.comment.create({
                data: {
                  taskId: reqItem.taskId,
                  userId: userId || reqItem.receiverId,
                  content: `❌ [TỪ CHỐI CHUYỂN GIAO MINITASK] ${reqItem.receiver?.fullName || 'Người nhận'} đã từ chối tiếp nhận Task con từ ${reqItem.sender?.fullName || 'Đồng nghiệp'}.`,
                },
              });
            } catch {}
          }
        } else {
          if (action === 'APPROVED') {
            await tx.taskRequest.updateMany({
              where: {
                taskId: reqItem.taskId,
                type: 'SUBTASK_APPROVAL',
                status: 'PENDING',
              },
              data: {
                status: 'REJECTED',
                responseNote: 'Đã tự động hủy do Task được chuyển giao sang nhân sự mới.',
              },
            });
            await tx.subtask.updateMany({
              where: {
                taskId: reqItem.taskId,
                approvalStatus: 'PENDING',
              },
              data: {
                approvalStatus: 'NONE',
              },
            });

            await tx.task.update({
              where: { id: reqItem.taskId },
              data: {
                assigneeId: reqItem.receiverId,
                status: 'IN_PROGRESS',
              },
            });

            try {
              await tx.comment.create({
                data: {
                  taskId: reqItem.taskId,
                  userId: userId || reqItem.receiverId,
                  content: `🔄 [LỊCH SỬ CHUYỂN GIAO BAN GIAO TASK] Task đã được chuyển giao thành công từ ${reqItem.sender?.fullName || 'Đồng nghiệp'} sang ${reqItem.receiver?.fullName || 'Người nhận'}. Chú thích: "${reqItem.note || 'Không có ghi chú'}"`,
                },
              });
            } catch {}
          } else if (action === 'REJECTED') {
            await tx.task.update({
              where: { id: reqItem.taskId },
              data: { status: 'IN_PROGRESS' },
            });

            try {
              await tx.comment.create({
                data: {
                  taskId: reqItem.taskId,
                  userId: userId || reqItem.receiverId,
                  content: `❌ [LỊCH SỬ TỪ CHỐI CHUYỂN GIAO] ${reqItem.receiver?.fullName || 'Người nhận'} đã từ chối yêu cầu bàn giao từ ${reqItem.sender?.fullName || 'Đồng nghiệp'}. Task giữ nguyên cho người thực hiện cũ.`,
                },
              });
            } catch {}
          }
        }
      }

      return res;
    });

    if (reqItem.type === 'SUBTASK_APPROVAL') {
      await this.subtaskService.recalculateTaskProgress(reqItem.taskId, reqItem.task.projectId);
    }

    return updated;
  }
}
