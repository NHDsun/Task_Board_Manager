import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskRequestDto {
  @IsNotEmpty({ message: 'ID của Task không được để trống' })
  @IsString()
  taskId: string;

  @IsNotEmpty({ message: 'ID người nhận không được để trống' })
  @IsString()
  receiverId: string;

  @IsOptional()
  @IsString()
  type?: 'TRANSFER' | 'ASSIST' | 'REVIEW';

  @IsOptional()
  @IsString()
  note?: string;
}
