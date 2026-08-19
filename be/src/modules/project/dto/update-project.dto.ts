import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: 'Tên dự án phải là chuỗi' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả dự án phải là chuỗi' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'ID Manager phải là chuỗi' })
  managerId?: string;

  @IsOptional()
  @IsString({ message: 'Cấu hình giai đoạn Pipeline phải là chuỗi JSON' })
  stagesJson?: string;

  @IsOptional()
  isCompleted?: boolean;
}
