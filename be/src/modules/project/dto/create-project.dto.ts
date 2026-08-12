import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty({ message: 'Tên dự án không được để trống' })
  @IsString({ message: 'Tên dự án phải là chuỗi' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả dự án phải là chuỗi' })
  description?: string;
}
