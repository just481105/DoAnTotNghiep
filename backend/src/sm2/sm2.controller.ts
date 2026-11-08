import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard';
import { Sm2Service } from './sm2.service';
import type { WordMode } from './sm2.service';
import { ReviewGradeDto } from './dto/create-sm2.dto';

const MODES: WordMode[] = ['study', 'due', 'new', 'all'];

@Controller('sm2')
export class Sm2Controller {
  constructor(private readonly sm2Service: Sm2Service) {}

  @Get('due-today')
  @UseGuards(JwtAuthGuard)
  getDueWords(@CurrentUser() user: AuthenticatedUser) {
    return this.sm2Service.getDueWords(user.sub);
  }

  @Post('grade')
  @UseGuards(JwtAuthGuard)
  processReview(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReviewGradeDto,
  ) {
    return this.sm2Service.processReview(user.sub, dto);
  }

  @Get('vocabularies')
  getAllVocabularies() {
    return this.sm2Service.getAllVocabularies();
  }

  @Get('topics')
  @UseGuards(JwtAuthGuard)
  getTopics(@CurrentUser() user: AuthenticatedUser) {
    return this.sm2Service.getVocabularyTopics(user.sub);
  }

  @Get('words')
  @UseGuards(JwtAuthGuard)
  getWordsByTopic(
    @CurrentUser() user: AuthenticatedUser,
    @Query('topic') topic?: string,
    @Query('mode') mode?: string,
  ) {
    const safeMode = MODES.includes(mode as WordMode) ? (mode as WordMode) : 'all';
    return this.sm2Service.getWordsByTopic(user.sub, topic, safeMode);
  }
}
