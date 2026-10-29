import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Lấy danh sách đề thi (kèm fallback nếu database chưa có)
  async getAllExams() {
    try {
      const exams = await (this.prisma as any).exam.findMany({
        where: { isPublished: true },
        include: {
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (exams && exams.length > 0) {
        return exams;
      }
    } catch (err) {
      console.warn('Lỗi truy vấn danh sách đề thi, chuyển fallback:', err);
    }

    return [
      {
        id: 'exam-vstep-b2-01',
        title: 'VSTEP Reading Mock Test 01 (B1 - B2)',
        description: 'Đề thi thử kỹ năng Đọc hiểu định dạng VSTEP kiểm tra từ vựng ngữ cảnh kinh tế và xã hội.',
        examType: 'VSTEP',
        durationMin: 15,
        totalMarks: 30,
        _count: { questions: 3 },
      },
    ];
  }

  // 2. Lấy chi tiết đề thi và các câu hỏi trắc nghiệm
  async getExamById(id: string) {
    const exam = await (this.prisma as any).exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              select: {
                id: true,
                optionLabel: true,
                content: true,
              },
            },
          },
        },
      },
    });

    if (!exam) throw new NotFoundException('Không tìm thấy đề thi');
    return exam;
  }

  // 3. Chấm điểm tự động và LƯU TRỰC TIẾP vào bảng user_exam_attempts
  async submitExam(userId: string, examId: string, userAnswers: Record<string, string>) {
    console.log(`\n========================================`);
    console.log(`📩 Nhận bài nộp: examId=${examId} | userId=${userId}`);

    const exam = await (this.prisma as any).exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!exam) throw new NotFoundException('Không tìm thấy đề thi');

    let totalCorrect = 0;
    const reviewDetails = [];

    for (const q of exam.questions) {
      const selectedOptionId = userAnswers[q.id];
      const correctOption = q.options.find((opt: any) => opt.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      if (isCorrect) totalCorrect++;

      reviewDetails.push({
        questionId: q.id,
        prompt: q.prompt,
        explanation: q.explanation,
        selectedOptionId: selectedOptionId || null,
        correctOptionId: correctOption?.id,
        isCorrect,
      });
    }

    const score = Math.round((totalCorrect / exam.questions.length) * 100);

    // Ghi dữ liệu vào PostgreSQL
    const attempt = await (this.prisma as any).userExamAttempt.create({
      data: {
        userId,
        examId,
        score,
        totalCorrect,
        completedAt: new Date(),
      },
    });

    console.log(`✅ ĐÃ LƯU KẾT QUẢ THI VÀO POSTGRESQL!`);
    console.log(`🆔 Mã lần thi: ${attempt.id} | Điểm: ${score}% | Số câu đúng: ${totalCorrect}/${exam.questions.length}`);
    console.log(`========================================\n`);

    return {
      attemptId: attempt.id,
      score,
      totalCorrect,
      totalQuestions: exam.questions.length,
      reviewDetails,
    };
  }
}
