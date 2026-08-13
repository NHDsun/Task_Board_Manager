import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CachedResponse {
  statusCode: number;
  data: any;
  timestamp: number;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);
  private readonly cache = new Map<string, CachedResponse>();
  private readonly ttlMs = 5 * 60 * 1000; // Cache 5 phút

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['x-idempotency-key'];
    const method = request.method?.toUpperCase();

    // Chỉ áp dụng Idempotency cho các request biến đổi dữ liệu (POST, PATCH, PUT, DELETE) có đính kèm Key
    if (!idempotencyKey || !['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const cached = this.cache.get(idempotencyKey);
    const now = Date.now();

    // 🔑 Nếu Key đã tồn tại trong Cache và chưa hết hạn -> Trả về dữ liệu cũ ngay lập tức (Skip DB execution)
    if (cached && now - cached.timestamp < this.ttlMs) {
      this.logger.log(`🔑 [Idempotency Cache Hit] Bỏ qua thực thi CSDL cho Request trùng lặp! Key: ${idempotencyKey}`);
      return of(cached.data);
    }

    // 🚀 Nếu chưa có trong Cache -> Tiếp tục thực thi và lưu kết quả vào Cache
    return next.handle().pipe(
      tap((data) => {
        this.cache.set(idempotencyKey, {
          statusCode: context.switchToHttp().getResponse().statusCode,
          data,
          timestamp: Date.now(),
        });
        this.logger.log(`🔑 [Idempotency Cached] Đã lưu mã giao dịch Idempotency Key: ${idempotencyKey}`);
      })
    );
  }
}
