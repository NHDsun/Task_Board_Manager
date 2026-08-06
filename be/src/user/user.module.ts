import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './user.entity';

@Module({
  // Đăng ký bảng User ở cấp độ Module con
  imports: [MikroOrmModule.forFeature([User])],
})
export class userModule {}