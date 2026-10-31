import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './prisma/prisma.module';
import { Sm2Module } from './sm2/sm2.module';
import { UsersModule } from './users/users.module';
import { ExamModule } from './exam/exam.module';
import { GrammarModule } from './grammar/grammar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongoDB: dùng cho bài học ngữ pháp
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
    GrammarModule,
  ],
})
export class AppModule {}
