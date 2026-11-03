import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard';
import { FlashcardsService } from './flashcards.service';

@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post('review')
  @UseGuards(JwtAuthGuard)
  async reviewCard(
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: {
      wordId: string;
      rating: 'again' | 'hard' | 'good' | 'easy';
    },
  ) {
    return this.flashcardsService.reviewCard(
      user.sub,
      body.wordId,
      body.rating,
    );
  }
}
