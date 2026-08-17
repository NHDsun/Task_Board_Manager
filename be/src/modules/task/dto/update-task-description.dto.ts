import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateTaskDescriptionDto {
  @IsString()
  description: string;
}
