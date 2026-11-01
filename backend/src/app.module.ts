import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './prisma/prisma.module';
import { Sm2Module } from './sm2/sm2.module';
import { UsersModule } from './users/users.module';
import { ExamModule } from './exam/exam.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongoDB: dành cho dữ liệu người dùng (tiến độ học, lịch sử, hoạt động)
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb://127.0.0.1:27017/eng_platform',
      }),
    }),
    // PostgreSQL (Prisma): người dùng, đề thi, SM-2...
    PrismaModule,
    Sm2Module,
    UsersModule,
    ExamModule,
  ],
})
export class AppModule {}
