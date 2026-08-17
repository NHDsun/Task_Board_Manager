import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty({ message: 'Tên dự án không được để trống' })
  @IsString({ message: 'Tên dự án phải là chuỗi' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả dự án phải là chuỗi' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách thành viên phải là mảng' })
  memberIds?: string[];

  @IsOptional()
  @IsString({ message: 'ID Manager phải là chuỗi' })
  managerId?: string;

  @IsOptional()
  @IsString({ message: 'Cấu hình giai đoạn Pipeline phải là chuỗi JSON' })
  stagesJson?: string;
}
