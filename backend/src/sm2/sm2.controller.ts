import { Controller, Get, Post, Body, Query, ValidationPipe } from '@nestjs/common';
import { Sm2Service } from './sm2.service';
import { ReviewGradeDto } from './dto/create-sm2.dto';

@Controller('sm2')
export class Sm2Controller {
  constructor(private readonly sm2Service: Sm2Service) {}

  @Get('due-today')
  getDueWords(@Query('userId') userId: string) {
    return this.sm2Service.getDueWords(userId);
  }

  @Post('grade')
  processReview(@Body(new ValidationPipe()) dto: ReviewGradeDto) {
    return this.sm2Service.processReview(dto);
  }

  @Get('vocabularies')
async getAllVocabularies() {
  return this.sm2Service.getAllVocabularies();
}

@Get('topics')
async getTopics(@Query('userId') userId?: string) {
  return this.sm2Service.getVocabularyTopics(userId || 'e6de30ce-ac04-487f-b376-163240602f84');
}

@Get('words')
async getWordsByTopic(
  @Query('userId') userId: string,
  @Query('topic') topic?: string,
) {
  const targetUserId = userId || 'e6de30ce-ac04-487f-b376-163240602f84';
  return this.sm2Service.getWordsByTopic(targetUserId, topic);
}



}

