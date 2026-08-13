import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
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

  private extractUserId(req: any): string {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }
    return userId;
  }

  @Get()
  findAll(@Query() query: QueryTaskFilterDto) {
    return this.taskService.findAll(query);
  }

  @Post()
  create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(this.extractUserId(req), createTaskDto);
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
    @Request() req: any,
    @Body() dto: CreateTaskCommentDto,
  ) {
    return this.taskService.addComment(id, this.extractUserId(req), dto);
  }

  @Post('requests')
  createTaskRequest(
    @Request() req: any,
    @Body() dto: { taskId: string; receiverId: string; type?: 'TRANSFER' | 'ASSIST' | 'REVIEW'; note?: string },
  ) {
    return this.taskService.createTaskRequest(this.extractUserId(req), dto);
  }

  @Get('requests/incoming')
  getIncomingRequests(@Request() req: any) {
    return this.taskService.getIncomingRequests(this.extractUserId(req));
  }

  @Get('requests/outgoing')
  getOutgoingRequests(@Request() req: any) {
    return this.taskService.getOutgoingRequests(this.extractUserId(req));
  }

  @Patch('requests/:id/cancel')
  cancelTaskRequest(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.taskService.cancelTaskRequest(id, this.extractUserId(req));
  }

  @Patch('requests/:id/respond')
  respondToRequest(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { action: 'APPROVED' | 'REJECTED' },
  ) {
    return this.taskService.respondToRequest(id, this.extractUserId(req), body.action);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.taskService.deleteTask(id, this.extractUserId(req));
  }
}
