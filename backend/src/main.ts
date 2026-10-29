import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép Next.js (port 3000) gọi API
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`🚀 NestJS Core API đang chạy tại: http://localhost:${port}`);
}
bootstrap();
