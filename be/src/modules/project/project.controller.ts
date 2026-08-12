import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Request() req: { user: { userId?: string; sub?: string; id?: string } }, @Body() createProjectDto: CreateProjectDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id || 'admin-huydat-id';
    return this.projectService.create(userId, createProjectDto);
  }

  @Get()
  findAll(@Request() req: { user: { userId?: string; sub?: string; id?: string } }) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id || 'admin-huydat-id';
    return this.projectService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
