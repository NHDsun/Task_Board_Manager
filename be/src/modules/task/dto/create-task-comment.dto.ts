import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskCommentDto {
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @IsString({ message: 'Nội dung bình luận phải là chuỗi' })
  text: string;
}
