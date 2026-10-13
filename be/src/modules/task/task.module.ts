import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SocketModule } from '../socket/socket.module';
import { NotificationModule } from '../notification/notification.module';
import { TaskActivityService } from './task-activity.service';
import { TaskSubtaskService } from './task-subtask.service';
import { TaskAttachmentService } from './task-attachment.service';
import { TaskCommentService } from './task-comment.service';
import { TaskRequestService } from './task-request.service';

@Module({
  imports: [PrismaModule, SocketModule, NotificationModule],
  controllers: [TaskController],
  providers: [
    TaskService,
    TaskActivityService,
    TaskSubtaskService,
    TaskAttachmentService,
    TaskCommentService,
    TaskRequestService,
  ],
  exports: [
    TaskService,
    TaskActivityService,
    TaskSubtaskService,
    TaskAttachmentService,
    TaskCommentService,
    TaskRequestService,
  ],
})
export class TaskModule {}
