import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, Profession } from '@prisma/client';

export class UpdateUserRoleDto {
  @IsOptional()
  @IsEnum(Role, { message: 'Role phải là ADMIN, MANAGER hoặc EMPLOYEE' })
  role?: Role;

  @IsOptional()
  @IsEnum(Profession, { message: 'Chuyên môn không hợp lệ' })
  profession?: Profession;

  @IsOptional()
  @IsString({ message: 'Chức danh phải là chuỗi ký tự' })
  jobTitle?: string;

  @IsOptional()
  @IsString({ message: 'Mã phòng ban phải là chuỗi ký tự' })
  departmentId?: string;
}
