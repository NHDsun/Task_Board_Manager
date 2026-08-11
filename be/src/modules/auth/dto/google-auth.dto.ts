import { IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsOptional()
  @IsString({ message: 'Google ID Token phải là chuỗi ký tự' })
  idToken?: string;

  @IsOptional()
  @IsString({ message: 'Google Token phải là chuỗi ký tự' })
  googleToken?: string;
}
