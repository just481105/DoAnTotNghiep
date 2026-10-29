import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { Sm2Module } from './sm2/sm2.module';
import { UsersModule } from './users/users.module';
import { ExamModule } from './exam/exam.module'; // <-- 1. Đảm bảo có dòng import này

@Module({
  imports: [
    PrismaModule, 
    Sm2Module, 
    UsersModule, 
    ExamModule // <-- 2. Đảm bảo có ExamModule trong mảng imports
  ],
})
export class AppModule {}
