import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SpeakingController } from './speaking.controller';
import { SpeakingService } from './speaking.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [SpeakingController],
  providers: [SpeakingService],
})
export class SpeakingModule {}
