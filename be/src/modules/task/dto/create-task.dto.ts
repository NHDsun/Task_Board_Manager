import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Tiêu đề task không được để trống' })
  @IsString({ message: 'Tiêu đề task phải là chuỗi' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Trạng thái Task không hợp lệ' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Độ ưu tiên Task không hợp lệ' })
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
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];

  @IsOptional()
  @IsArray()
  subtaskTitles?: string[];

  @IsOptional()
  @IsArray()
  subtasks?: { title: string; isUrgent?: boolean; estimatedDays?: number }[];

  @IsOptional()
  @IsString()
  stageId?: string;
}
