import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Bật CORS để Frontend (Vite) có thể gọi API mà không bị lỗi
  app.enableCors({
    origin: process.env.VITE_API_URL || 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
