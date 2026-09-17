import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TrashService } from './trash.service';
import { ProjectService } from '../project/project.service';
import { TaskService } from '../task/task.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces/auth-user.interface';

@Controller('admin/trash')
@UseGuards(JwtAuthGuard)
export class TrashController {
  constructor(
    private readonly trashService: TrashService,
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
  ) {}

  @Get()
  getTrashSummary(@Request() req: AuthenticatedRequest) {
    return this.trashService.getTrashSummary(req.user);
  }

  @Post('restore-project/:id')
  restoreProject(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    return this.projectService.restore(id, userId, req.user);
  }

  @Delete('permanent-project/:id')
  permanentDeleteProject(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    return this.projectService.hardDelete(id, userId, req.user);
  }

  @Post('restore-task/:id')
  restoreTask(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.taskService.restoreTask(id, req.user);
  }

  @Delete('permanent-task/:id')
  permanentDeleteTask(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.taskService.permanentDeleteTask(id, req.user);
  }

  @Delete('empty-all')
  emptyTrash(@Request() req: AuthenticatedRequest) {
    return this.trashService.emptyTrash(req.user);
  }
}
