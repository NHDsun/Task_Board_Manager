import { IsOptional, IsString } from 'class-validator';

export class CreateTaskCommentDto {
  @IsOptional()
  @IsString({ message: 'Nội dung bình luận phải là chuỗi' })
  text?: string;

  @IsOptional()
  @IsString({ message: 'Nội dung bình luận phải là chuỗi' })
  content?: string;
}
