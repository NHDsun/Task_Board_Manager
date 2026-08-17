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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    if (data?.projectId) {
      const room = `project:${data.projectId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined room: ${room}`);
      return { status: 'success', room };
    }
    return { status: 'error', message: 'Invalid projectId' };
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

  // Broadcaster function for services to call
  broadcastToProject(projectId: string, event: string, payload: any) {
    const room = `project:${projectId}`;
    this.server.to(room).emit(event, payload);
    this.logger.log(`Broadcasted ${event} to room ${room}`);
  }
}
