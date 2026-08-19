import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  private extractUserId(req: any): string {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }
    return userId;
  }

  @Get()
  findAll(@Request() req: any, @Query() query: QueryNotificationDto) {
    return this.notificationService.findAll(this.extractUserId(req), query);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req: any) {
    return this.notificationService.getUnreadCount(this.extractUserId(req));
  }

  @Patch(':id/read')
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(id, this.extractUserId(req));
  }

  @Patch('read-all')
  markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(this.extractUserId(req));
  }

  @Delete(':id')
  deleteNotification(@Request() req: any, @Param('id') id: string) {
    return this.notificationService.deleteNotification(id, this.extractUserId(req));
  }
}
