import { Profession, Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email định dạng không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString({ message: 'Họ và tên phải là chuỗi ký tự!' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống!' })
  fullName: string;

  @IsOptional()
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự!' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự!' })
  password?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Quyền hạn (Role) không hợp lệ (ADMIN, MANAGER, EMPLOYEE)!' })
  role?: Role;

  @IsOptional()
  @IsEnum(Profession, { message: 'Chuyên môn (Profession) không hợp lệ!' })
  profession?: Profession;

  @IsOptional()
  @IsString({ message: 'Chức danh (Job Title) phải là chuỗi ký tự!' })
  jobTitle?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự!' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Tiểu sử (Bio) phải là chuỗi ký tự!' })
  bio?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID phòng ban không đúng định dạng UUID!' })
  departmentId?: string;

  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh đại diện phải là chuỗi!' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh bìa phải là chuỗi!' })
  coverImage?: string;
}
