import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Chỉnh lại đường dẫn tới PrismaService của bạn nếu khác
import { calculateSM2 } from './dto/utils/sm2.utils';


@Injectable()
export class FlashcardsService {
  constructor(private prisma: PrismaService) {}

  async reviewCard(
    userId: string,
    wordId: string,
    rating: 'again' | 'hard' | 'good' | 'easy',
  ) {
    const qualityMap: Record<'again' | 'hard' | 'good' | 'easy', number> = {
      again: 1,
      hard: 3,
      good: 4,
      easy: 5,
    };
    const quality = qualityMap[rating];

    const current = await this.prisma.userFlashcard.upsert({
      where: { userId_wordId: { userId, wordId } },
      update: {},
      create: { userId, wordId },
    });

    const result = calculateSM2({
      quality,
      repetition: current.repetition,
      interval: current.interval,
      easinessFactor: current.easinessFactor,
    });

    return this.prisma.userFlashcard.update({
      where: { id: current.id },
      data: {
        repetition: result.repetition,
        interval: result.interval,
        easinessFactor: result.easinessFactor,
        nextReviewDate: result.nextReviewDate,
        lastReviewedAt: new Date(),
      },
    });
  }
}
