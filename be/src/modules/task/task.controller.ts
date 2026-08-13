import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { QueryTaskFilterDto } from './dto/query-task-filter.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(@Query() query: QueryTaskFilterDto) {
    return this.taskService.findAll(query);
  }

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

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.taskService.getComments(id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Request() req: { user: { userId?: string; sub?: string; id?: string } },
    @Body() dto: CreateTaskCommentDto,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id || 'admin-huydat-id';
    return this.taskService.addComment(id, userId, dto);
  }

  @Post('requests')
  createTaskRequest(
    @Request() req: { user: { userId?: string; sub?: string; id?: string } },
    @Body() dto: { taskId: string; receiverId: string; type?: 'TRANSFER' | 'ASSIST' | 'REVIEW'; note?: string },
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id || 'admin-huydat-id';
    return this.taskService.createTaskRequest(userId, dto);
  }

  @Get('requests/incoming')
  getIncomingRequests(@Request() req: { user: { userId?: string; sub?: string; id?: string } }) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id || 'admin-huydat-id';
    return this.taskService.getIncomingRequests(userId);
  }

  @Get('requests/outgoing')
  getOutgoingRequests(@Request() req: { user: { userId?: string; sub?: string; id?: string } }) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id || 'admin-huydat-id';
    return this.taskService.getOutgoingRequests(userId);
  }

  @Patch('requests/:id/cancel')
  cancelTaskRequest(
    @Param('id') id: string,
    @Request() req: { user: { userId?: string; sub?: string; id?: string } },
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id || 'admin-huydat-id';
    return this.taskService.cancelTaskRequest(id, userId);
  }

  @Patch('requests/:id/respond')
  respondToRequest(
    @Param('id') id: string,
    @Request() req: { user: { userId?: string; sub?: string; id?: string } },
    @Body() body: { action: 'APPROVED' | 'REJECTED' },
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id || 'admin-huydat-id';
    return this.taskService.respondToRequest(id, userId, body.action);
  }
}
