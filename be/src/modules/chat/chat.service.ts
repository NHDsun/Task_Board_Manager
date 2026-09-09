import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { SendMessageDto } from './dto/chat-dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway
  ) {}
  async sendMessage(senderId: string, dto: SendMessageDto) {
    if (senderId === dto.receiverId) {
      throw new BadRequestException('Không thể gửi tin nhắn cho chính mình!');
    }
    const receiver = await this.prisma.user.findUnique({ where: { id: dto.receiverId } });
    if (!receiver) {
      throw new NotFoundException('Người nhận không tồn tại trong hệ thống!');
    }
    const message = await this.prisma.directMessage.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        content: dto.content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
    try {
      this.socketGateway.sendToUser(dto.receiverId, 'chat:new', message);
    } catch (error) {
      console.error('Lỗi Socket real-time:', error);
    }
    return {
      success: true,
      data: message,
    };
  }
  async getRecentConversations(userId: string) {
    const message = await this.prisma.directMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            statusSignal: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            statusSignal: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const conversationsMap = new Map<string, any>();
    for (const msg of message) {
      const peer = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationsMap.has(peer.id)) {
        const unreadCount = await this.prisma.directMessage.count({
          where: {
            senderId: peer.id,
            receiverId: userId,
            isRead: false,
          },
        });
        conversationsMap.set(peer.id, {
          peer,
          lastMessage: {
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
            isRead: msg.isRead,
          },
          unreadCount,
        });
      }
    }
    return {
      success: true,
      data: Array.from(conversationsMap.values()),
    };
  }
  async getConversation(userId: string, peerId: string) {
    const peer = await this.prisma.user.findUnique({ where: { id: peerId } });
    if (!peer) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }

    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: peerId },
          { senderId: peerId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    await this.prisma.directMessage.updateMany({
      where: { senderId: peerId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });

    return {
      success: true,
      data: messages,
    };
  }
}
