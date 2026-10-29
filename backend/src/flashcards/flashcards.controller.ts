import { Controller, Post, Body } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';

@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post('review')
  async reviewCard(
    @Body()
    body: {
      userId: string;
      wordId: string;
      rating: 'again' | 'hard' | 'good' | 'easy';
    },
  ) {
    return this.flashcardsService.reviewCard(
      body.userId,
      body.wordId,
      body.rating,
    );
  }
}
