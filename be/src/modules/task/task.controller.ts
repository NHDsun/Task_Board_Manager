import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Request() req: { user: { userId?: string; sub?: string; id?: string } }, @Body() createTaskDto: CreateTaskDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id || 'admin-huydat-id';
    return this.taskService.create(userId, createTaskDto);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.taskService.findByProject(projectId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateTaskStatusDto: UpdateTaskStatusDto) {
    return this.taskService.updateStatus(id, updateTaskStatusDto);
  }
}
