import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard';
import { EvaluateSpeakingDto } from './dto/evaluate-speaking.dto';
import { SpeakingService } from './speaking.service';
import type { UploadedAudio } from './speaking.service';

@Controller('speaking')
export class SpeakingController {
  constructor(private readonly speakingService: SpeakingService) {}

  @Post('evaluate')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  evaluate(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: UploadedAudio | undefined,
    @Body() dto: EvaluateSpeakingDto,
  ) {
    return this.speakingService.evaluate(user.sub, dto, file);
  }
}
