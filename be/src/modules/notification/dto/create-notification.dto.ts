import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsNotEmpty({ message: 'User ID người nhận không được để trống' })
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  actorId?: string;

  @IsNotEmpty({ message: 'Tiêu đề thông báo không được để trống' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Nội dung thông báo không được để trống' })
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  subtaskId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}
