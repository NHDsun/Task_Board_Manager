import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private extractUserFromSocket(client: Socket): { id: string; email: string; role?: string } | null {
    try {
      const rawToken =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization
          ? client.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
          : null);

      if (!rawToken) return null;

      const secret = process.env.JWT_SECRET || 'secretKeySuperSecret123';
      const payload = this.jwtService.verify(rawToken, { secret });
      return {
        id: payload.sub || payload.id,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }

  handleConnection(client: Socket) {
    const user = this.extractUserFromSocket(client);
    if (user) {
      (client as any).user = user;
      this.logger.log(`Client authenticated: ${client.id} (User: ${user.id} - ${user.email})`);
    } else {
      this.logger.log(`Client connected: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinProject')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string; token?: string },
  ) {
    if (!data?.projectId) {
      return { status: 'error', message: 'Invalid projectId' };
    }

    const user = (client as any).user || (data.token ? this.jwtService.decode(data.token) : null);
    if (user) {
      const userId = user.id || user.sub;
      const project = await this.prisma.project.findUnique({
        where: { id: data.projectId },
        include: { members: true },
      });

      if (project) {
        const isMember =
          user.role === 'ADMIN' ||
          project.createdById === userId ||
          project.managerId === userId ||
          project.members.some((m) => m.userId === userId);

        if (!isMember) {
          this.logger.warn(`User ${userId} bị từ chối join project room ${data.projectId} do không phải thành viên`);
          return { status: 'error', message: 'Unauthorized project access' };
        }
      }
    }

    const room = `project:${data.projectId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { status: 'success', room };
  }

  @SubscribeMessage('leaveProject')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    if (data?.projectId) {
      const room = `project:${data.projectId}`;
      client.leave(room);
      this.logger.log(`Client ${client.id} left room: ${room}`);
      return { status: 'success', room };
    }
    return { status: 'error', message: 'Invalid projectId' };
  }

  @SubscribeMessage('joinUser')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; token?: string },
  ) {
    if (!data?.userId) {
      return { status: 'error', message: 'Invalid userId' };
    }

    const authUser = (client as any).user || (data.token ? this.jwtService.decode(data.token) : null);
    if (authUser) {
      const currentUserId = authUser.id || authUser.sub;
      if (authUser.role !== 'ADMIN' && currentUserId !== data.userId) {
        this.logger.warn(`User ${currentUserId} bị chặn truy cập phòng cá nhân của User ${data.userId}`);
        return { status: 'error', message: 'Unauthorized user room access' };
      }
    }

    const room = `user:${data.userId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined user room: ${room}`);
    return { status: 'success', room };
  }

  @SubscribeMessage('leaveUser')
  handleLeaveUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      const room = `user:${data.userId}`;
      client.leave(room);
      this.logger.log(`Client ${client.id} left user room: ${room}`);
      return { status: 'success', room };
    }
    return { status: 'error', message: 'Invalid userId' };
  }

  // Broadcaster function for services to call for specific user
  sendToUser(userId: string, event: string, payload: any) {
    const room = `user:${userId}`;
    this.server.to(room).emit(event, payload);
    this.logger.log(`Sent ${event} to user room ${room}`);
  }

  // Broadcaster function for services to call
  broadcastToProject(projectId: string, event: string, payload: any) {
    const room = `project:${projectId}`;
    this.server.to(room).emit(event, payload);
    this.logger.log(`Broadcasted ${event} to room ${room}`);
  }
}
