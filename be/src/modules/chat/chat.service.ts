import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { SendMessageDto } from './dto/chat-dto';
import { last } from 'rxjs';
import { create } from 'domain';

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
}
