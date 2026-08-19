import { Module } from '@nestjs/common';
import { TrashService } from './trash.service';
import { TrashController } from './trash.controller';
import { ProjectModule } from '../project/project.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [ProjectModule, TaskModule],
  controllers: [TrashController],
  providers: [TrashService],
  exports: [TrashService],
})
export class TrashModule {}
