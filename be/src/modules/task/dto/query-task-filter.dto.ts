import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskPriority, TaskStatus, Profession } from '@prisma/client';

export class QueryTaskFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(Profession)
  profession?: Profession;
}
