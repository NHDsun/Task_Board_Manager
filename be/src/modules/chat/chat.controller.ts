import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email?: string;
    role?: string;
  };
}
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  sendMessage(@Req() req: RequestWithUser, @Body() dto: SendMessageDto) {
    const userId = req.user.id;
    return this.chatService.sendMessage(userId, dto);
  }
  @Get('conversations/recent')
  getRecentConversations(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.chatService.getRecentConversations(userId);
  }
  @Get(':peerId')
  getConversation(@Req() req: RequestWithUser, @Param('peerId') peerId: string) {
    const userId = req.user.id;
    return this.chatService.getConversation(userId, peerId);
  }

  @Delete('message/:id')
  deleteMessage(@Req() req: RequestWithUser, @Param('id') messageId: string) {
    const userId = req.user.id;
    return this.chatService.deleteMessage(messageId, userId);
  }
}
