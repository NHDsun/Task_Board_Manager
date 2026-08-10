import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello, Hệ thống Backend đã chạy và kết nối thành công!';
  }
}
