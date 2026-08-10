import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Cấu hình giới hạn dung lượng Payload (cho Giọng nói & Chat/Ảnh)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // 2. Cấu hình CORS đa cổng (Hỗ trợ cả Local 5173 và Docker 8000)
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8000',
  ];
  if (process.env.VITE_API_URL) {
    allowedOrigins.push(process.env.VITE_API_URL);
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Cho phép kết nối linh hoạt trong môi trường DEV
      }
    },
    credentials: true,
  });

  // 3. Kích hoạt ValidationPipe toàn cục để lọc sạch dữ liệu rác
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 4. Kích hoạt HttpExceptionFilter toàn cục để bắt lỗi và trả JSON đẹp
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. Kích hoạt TransformInterceptor toàn cục để chuẩn hóa kết quả thành công
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
