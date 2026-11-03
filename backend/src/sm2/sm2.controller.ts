import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard';
import { Sm2Service } from './sm2.service';
import { ReviewGradeDto } from './dto/create-sm2.dto';

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
    @Body(new ValidationPipe()) dto: ReviewGradeDto,
  ) {
    return this.sm2Service.processReview(user.sub, dto);
  }

  @Get('vocabularies')
async getAllVocabularies() {
  return this.sm2Service.getAllVocabularies();
}

@Get('topics')
@UseGuards(JwtAuthGuard)
async getTopics(@CurrentUser() user: AuthenticatedUser) {
  return this.sm2Service.getVocabularyTopics(user.sub);
}

@Get('words')
@UseGuards(JwtAuthGuard)
async getWordsByTopic(
  @CurrentUser() user: AuthenticatedUser,
  @Query('topic') topic?: string,
) {
  return this.sm2Service.getWordsByTopic(user.sub, topic);
}



}
