import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString({ message: 'Google ID Token phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Google ID Token không được để trống' })
  idToken: string;
}
