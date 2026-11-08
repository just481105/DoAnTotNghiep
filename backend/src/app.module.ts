import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { Sm2Module } from './sm2/sm2.module';
import { UsersModule } from './users/users.module';
import { ExamModule } from './exam/exam.module';
import { SpeakingModule } from './speaking/speaking.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    Sm2Module,
    UsersModule,
    ExamModule,
    SpeakingModule,
  ],
})
export class AppModule {}
