import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
  async submitExam(
    @Param('id') examId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { answers: Record<string, string> },
  ) {
    return this.examService.submitExam(user.sub, examId, body.answers || {});
  }
}
