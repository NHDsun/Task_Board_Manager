import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SocketModule } from '../socket/socket.module';
import { NotificationModule } from '../notification/notification.module';
import { TaskActivityService } from './task-activity.service';

@Module({
  imports: [PrismaModule, SocketModule, NotificationModule],
  controllers: [TaskController],
  providers: [TaskService, TaskActivityService],
  exports: [TaskService],
})
export class TaskModule {}
