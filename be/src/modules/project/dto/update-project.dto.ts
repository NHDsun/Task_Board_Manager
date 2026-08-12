import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: 'Tên dự án phải là chuỗi' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả dự án phải là chuỗi' })
  description?: string;
}
