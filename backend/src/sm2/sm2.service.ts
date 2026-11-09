import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../users/progress.service';
import { ReviewGradeDto } from './dto/create-sm2.dto';
import { calculateSm2 } from './sm2.algorithm';

export type WordMode = 'study' | 'due' | 'new' | 'all';

const SESSION_SIZE = 20;

@Injectable()
export class Sm2Service {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
  ) {}

  getDueWords(userId: string) {
    return this.prisma.userSm2Stats.findMany({
      where: { userId, nextReviewAt: { lte: new Date() } },
      include: { vocabulary: true },
      orderBy: { nextReviewAt: 'asc' },
      take: SESSION_SIZE,
    });
  }

  getAllVocabularies() {
    return this.prisma.vocabulary.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async processReview(userId: string, dto: ReviewGradeDto) {
    const { vocabularyId, quality } = dto;

    const stat = await this.prisma.userSm2Stats.findUnique({
      where: { userId_vocabularyId: { userId, vocabularyId } },
    });

    const calculated = calculateSm2(quality, {
      repetitions: stat?.repetitions ?? 0,
      intervalDays: stat?.intervalDays ?? 0,
      easinessFactor: stat?.easinessFactor ?? 2.5,
    });

    const data = {
      repetitions: calculated.repetitions,
      intervalDays: calculated.intervalDays,
      easinessFactor: calculated.easinessFactor,
      nextReviewAt: calculated.nextReviewAt,
      lastQuality: quality,
    };

    const saved = await this.prisma.userSm2Stats.upsert({
      where: { userId_vocabularyId: { userId, vocabularyId } },
      update: data,
      create: { userId, vocabularyId, ...data },
      include: { vocabulary: true },
    });

    await this.progress.award(userId, 2);
    return saved;
  }

  async getVocabularyTopics(userId: string) {
    const [totals, stats] = await Promise.all([
      this.prisma.vocabulary.groupBy({
        by: ['topic'],
        _count: { _all: true },
        orderBy: { topic: 'asc' },
      }),
      this.prisma.userSm2Stats.findMany({
        select: {
          userId: true,
          repetitions: true,
          vocabulary: { select: { topic: true } },
        },
      }),
    ]);

    const learnedByTopic = new Map<string, number>();
    const sessionsByTopic = new Map<string, number>();
    for (const s of stats) {
      const topic = s.vocabulary.topic;
      sessionsByTopic.set(topic, (sessionsByTopic.get(topic) ?? 0) + 1);
      if (s.userId === userId && s.repetitions > 0) {
        learnedByTopic.set(topic, (learnedByTopic.get(topic) ?? 0) + 1);
      }
    }

    return totals.map((t, index) => {
      const wordCount = t._count._all;
      const learned = learnedByTopic.get(t.topic) ?? 0;
      const progressPercent = wordCount > 0 ? Math.round((learned / wordCount) * 100) : 0;
      return {
        id: `topic-${index + 1}`,
        slug: encodeURIComponent(t.topic),
        title: t.topic,
        desc: 'Bắt đầu bài tập để ghi nhớ từ vựng mới hoặc ôn tập lại.',
        wordCount,
        learnCount: sessionsByTopic.get(t.topic) ?? 0,
        progressPercent,
        isLearned: progressPercent > 0,
      };
    });
  }

  async getWordsByTopic(userId: string, topic?: string, mode: WordMode = 'all') {
    const now = new Date();
    const and: Prisma.VocabularyWhereInput[] = [];

    if (topic && topic !== 'all') {
      and.push({ topic: { equals: topic, mode: 'insensitive' } });
    }

    const isNew: Prisma.VocabularyWhereInput = { sm2Stats: { none: { userId } } };
    const isDue: Prisma.VocabularyWhereInput = {
      sm2Stats: { some: { userId, nextReviewAt: { lte: now } } },
    };

    if (mode === 'new') and.push(isNew);
    else if (mode === 'due') and.push(isDue);
    else if (mode === 'study') and.push({ OR: [isDue, isNew] });

    const vocabularies = await this.prisma.vocabulary.findMany({
      where: { AND: and },
      include: { sm2Stats: { where: { userId } } },
      orderBy: { createdAt: 'asc' },
      take: mode === 'all' ? undefined : SESSION_SIZE,
    });

    return vocabularies.map((v) => {
      const stats = v.sm2Stats[0] ?? null;
      return {
        id: v.id,
        word: v.word,
        pos: v.pos,
        cefrLevel: v.cefrLevel,
        ipa: v.ipa,
        meaningVi: v.meaningVi,
        meaningEn: v.meaningEn,
        exampleEn: v.exampleEn,
        exampleVi: v.exampleVi,
        collocations: v.collocations,
        audioUrl: v.audioUrl,
        topic: v.topic,
        repetitions: stats?.repetitions ?? 0,
        intervalDays: stats?.intervalDays ?? 0,
        easinessFactor: stats?.easinessFactor ?? 2.5,
        nextReviewAt: stats?.nextReviewAt ?? null,
      };
    });
  }
}
