import { IsBoolean, IsNotEmpty } from 'class-validator';

export class LockUserDto {
  @IsNotEmpty({ message: 'isActive không được để trống' })
  @IsBoolean()
  isActive: boolean;
}
