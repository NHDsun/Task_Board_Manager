import { IsOptional, IsString, IsEnum } from 'class-validator';

export type ProfessionType = 'DEV' | 'TESTER' | 'DESIGNER' | 'BA' | 'MARKETING' | 'DEVOPS' | 'PRODUCT_OWNER';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  profession?: ProfessionType;
}
