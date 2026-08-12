import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Tiêu đề task không được để trống' })
  @IsString({ message: 'Tiêu đề task phải là chuỗi' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsNotEmpty({ message: 'projectId không được để trống' })
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  dueDate?: string;
}
