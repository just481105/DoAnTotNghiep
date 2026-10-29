import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewGradeDto } from './dto/create-sm2.dto';

@Injectable()
export class Sm2Service {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Hàm toán học tính toán các chỉ số SM-2
   */
  calculateSm2(
    quality: number,
    currentRepetitions: number,
    currentInterval: number,
    currentEf: number,
  ) {
    let repetitions = currentRepetitions;
    let intervalDays = currentInterval;
    let easinessFactor = currentEf;

    if (quality >= 3) {
      // Nhớ thành công
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easinessFactor);
      }
      repetitions += 1;
    } else {
      // Quên từ hoặc nhớ sai nghiêm trọng
      repetitions = 0;
      intervalDays = 1;
    }

    // Công thức cập nhật hệ số dễ EF chuẩn SuperMemo-2
    easinessFactor =
      easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ngưỡng chặn dưới của EF là 1.3
    if (easinessFactor < 1.3) {
      easinessFactor = 1.3;
    }

    // Làm tròn 2 chữ số thập phân
    easinessFactor = Math.round(easinessFactor * 100) / 100;

    // Tính mốc thời gian ôn tập kế tiếp (hiện tại + interval ngày)
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    return {
      repetitions,
      intervalDays,
      easinessFactor,
      nextReviewAt,
    };
  }

  /**
   * API: Lấy danh sách từ vựng cần ôn tập hôm nay của học viên
   */
  async getDueWords(userId: string) {
    const now = new Date();

    return this.prisma.userSm2Stats.findMany({
      where: {
        userId,
        nextReviewAt: {
          lte: now, // Những từ có lịch ôn tập nhỏ hơn hoặc bằng hiện tại
        },
      },
      include: {
        vocabulary: true,
      },
      take: 20, // Giới hạn 20 thẻ mỗi phiên học
    });
  }

  /**
   * API: Ghi nhận điểm đánh giá (0-5) và cập nhật tiến trình SM-2 vào PostgreSQL
   */

async getAllVocabularies() {
  return this.prisma.vocabulary.findMany({
    orderBy: { createdAt: 'asc' },
  });
}


  async processReview(dto: ReviewGradeDto) {
    const { userId, vocabularyId, quality } = dto;

    // Tìm trạng thái học của từ vựng này trong DB
    let stat = await this.prisma.userSm2Stats.findUnique({
      where: {
        userId_vocabularyId: { userId, vocabularyId },
      },
    });

    // Nếu học lần đầu, khởi tạo các chỉ số mặc định
    const currentRep = stat ? stat.repetitions : 0;
    const currentInterval = stat ? stat.intervalDays : 0;
    const currentEf = stat ? stat.easinessFactor : 2.5;

    // Áp dụng thuật toán SM-2
    const calculated = this.calculateSm2(
      quality,
      currentRep,
      currentInterval,
      currentEf,
    );

    // Cập nhật hoặc thêm mới vào bảng user_sm2_stats
    return this.prisma.userSm2Stats.upsert({
      where: {
        userId_vocabularyId: { userId, vocabularyId },
      },
      update: {
        repetitions: calculated.repetitions,
        intervalDays: calculated.intervalDays,
        easinessFactor: calculated.easinessFactor,
        nextReviewAt: calculated.nextReviewAt,
        lastQuality: quality,
      },
      create: {
        userId,
        vocabularyId,
        repetitions: calculated.repetitions,
        intervalDays: calculated.intervalDays,
        easinessFactor: calculated.easinessFactor,
        nextReviewAt: calculated.nextReviewAt,
        lastQuality: quality,
      },
      include: {
        vocabulary: true,
      },
    });
  }

async getVocabularyTopics(userId?: string) {
  // Lấy toàn bộ từ vựng kèm trạng thái SM-2 của học viên
  const vocabularies = await this.prisma.vocabulary.findMany({
    include: {
      sm2Stats: userId ? { where: { userId } } : false,
    },
  });

  // Gom nhóm theo topic (tag)
  const topicMap: Record<string, { totalWords: number; learnedWords: number }> = {};

  for (const v of vocabularies) {
    const topic = v.topic || "Tổng quát";
    if (!topicMap[topic]) {
      topicMap[topic] = { totalWords: 0, learnedWords: 0 };
    }
    topicMap[topic].totalWords += 1;
    if (v.sm2Stats && v.sm2Stats.length > 0 && v.sm2Stats[0].repetitions > 0) {
      topicMap[topic].learnedWords += 1;
    }
  }

  // Trả về danh sách card giống ảnh mẫu
  return Object.keys(topicMap).map((topicName, index) => {
    const info = topicMap[topicName];
    const progress = info.totalWords > 0 ? Math.round((info.learnedWords / info.totalWords) * 100) : 0;
    return {
      id: `topic-${index + 1}`,
      slug: encodeURIComponent(topicName),
      title: topicName,
      desc: "Bắt đầu bài tập để ghi nhớ từ vựng mới hoặc ôn tập lại.",
      wordCount: info.totalWords,
      learnCount: 200 + index * 125, // Mock số lượt học cộng đồng
      progressPercent: progress,
      isLearned: progress > 0,
    };
  });
}

async getWordsByTopic(userId: string, topic?: string) {
  const whereCondition: any = {};
  if (topic && topic !== 'all') {
    whereCondition.topic = { equals: topic, mode: 'insensitive' };
  }

  const vocabularies = await this.prisma.vocabulary.findMany({
    where: whereCondition,
    include: {
      sm2Stats: {
        where: { userId },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Định dạng lại dữ liệu trả về cho Flashcard Engine
  return vocabularies.map((v) => {
    const stats = v.sm2Stats[0] || null;
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
      audioUrl: v.audioUrl,
      topic: v.topic,
      repetitions: stats ? stats.repetitions : 0,
      intervalDays: stats ? stats.intervalDays : 0,
      easinessFactor: stats ? stats.easinessFactor : 2.5,
    };
  });
}

}
