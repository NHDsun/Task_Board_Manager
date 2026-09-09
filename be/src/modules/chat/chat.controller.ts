import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
}
