import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../users/progress.service';

@Injectable()
export class ExamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
  ) {}

  getAllExams() {
    return this.prisma.exam.findMany({
      where: { isPublished: true },
      include: { _count: { select: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Không trả isCorrect và explanation trước khi nộp bài
  async getExamById(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            prompt: true,
            passageText: true,
            audioUrl: true,
            orderIndex: true,
            options: {
              orderBy: { optionLabel: 'asc' },
              select: { id: true, optionLabel: true, content: true },
            },
          },
        },
      },
    });

    if (!exam || !exam.isPublished) throw new NotFoundException('Không tìm thấy đề thi');
    return exam;
  }

  async submitExam(userId: string, examId: string, userAnswers: Record<string, string>) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: { include: { options: true } } },
    });

    if (!exam || !exam.isPublished) throw new NotFoundException('Không tìm thấy đề thi');
    if (exam.questions.length === 0) {
      throw new BadRequestException('Đề thi chưa có câu hỏi');
    }

    let totalCorrect = 0;
    const reviewDetails = exam.questions.map((q) => {
      const requested = userAnswers[q.id];
      // chỉ nhận đáp án thuộc đúng câu hỏi này
      const selected = q.options.find((o) => o.id === requested) ?? null;
      const correct = q.options.find((o) => o.isCorrect) ?? null;
      const isCorrect = !!selected && selected.id === correct?.id;
      if (isCorrect) totalCorrect++;

      return {
        questionId: q.id,
        prompt: q.prompt,
        explanation: q.explanation,
        selectedOptionId: selected?.id ?? null,
        correctOptionId: correct?.id ?? null,
        isCorrect,
      };
    });

    const score = Math.round((totalCorrect / exam.questions.length) * 100);

    const attempt = await this.prisma.$transaction(async (tx) => {
      const created = await tx.userExamAttempt.create({
        data: { userId, examId, score, totalCorrect, completedAt: new Date() },
      });
      await tx.userAnswer.createMany({
        data: reviewDetails.map((r) => ({
          attemptId: created.id,
          questionId: r.questionId,
          selectedOptionId: r.selectedOptionId,
          isCorrect: r.isCorrect,
        })),
      });
      return created;
    });

    await this.progress.award(userId, totalCorrect);

    return {
      attemptId: attempt.id,
      score,
      totalCorrect,
      totalQuestions: exam.questions.length,
      reviewDetails,
    };
  }
}
