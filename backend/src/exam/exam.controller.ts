import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ExamService } from './exam.service';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  async getAllExams() {
    return this.examService.getAllExams();
  }

  @Get(':id')
  async getExamById(@Param('id') id: string) {
    return this.examService.getExamById(id);
  }

  @Post(':id/submit')
  async submitExam(
    @Param('id') examId: string,
    @Body() body: { userId?: string; answers: Record<string, string> },
  ) {
    // Sử dụng ID chuẩn của tài khoản sinh viên Bùi Đức Nam
    const targetUserId = body.userId || 'e6de30ce-ac04-487f-b376-163240602f84';
    return this.examService.submitExam(targetUserId, examId, body.answers || {});
  }
}
