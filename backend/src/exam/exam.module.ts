import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, AuthModule, PrismaModule],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
