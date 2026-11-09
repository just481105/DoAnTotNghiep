import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProgressService } from './progress.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, ProgressService],
  exports: [ProgressService],
})
export class UsersModule {}
