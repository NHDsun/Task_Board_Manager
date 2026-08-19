import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  private extractUserId(req: any): string {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException(
        'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
      );
    }
    return userId;
  }

  @Post()
  create(@Request() req: any, @Body() createProjectDto: CreateProjectDto) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Chỉ Quản trị viên (Admin) mới có quyền tạo dự án mới!',
      );
    }
    return this.projectService.create(
      this.extractUserId(req),
      createProjectDto,
      req.user,
    );
  }

  @Get()
  findAll(@Request() req: any) {
    return this.projectService.findAll(this.extractUserId(req));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(id, updateProjectDto, req.user);
  }

  @Delete(':id')
  softDelete(@Request() req: any, @Param('id') id: string) {
    return this.projectService.softDelete(
      id,
      this.extractUserId(req),
      req.user,
    );
  }

  @Post(':id/restore')
  restore(@Request() req: any, @Param('id') id: string) {
    return this.projectService.restore(
      id,
      this.extractUserId(req),
      req.user,
    );
  }

  @Delete(':id/permanent')
  hardDelete(@Request() req: any, @Param('id') id: string) {
    return this.projectService.hardDelete(
      id,
      this.extractUserId(req),
      req.user,
    );
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.projectService.getMembers(id);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { userId: string },
  ) {
    return this.projectService.addMember(id, body.userId, req.user);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return this.projectService.removeMember(id, userId, req.user);
  }
}
