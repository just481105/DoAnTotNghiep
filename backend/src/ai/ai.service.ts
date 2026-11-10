import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatDto, WritingDto } from './dto/ai.dto';

const MAX_PER_MINUTE = 10;

@Injectable()
export class AiService {
  // Lưu trong bộ nhớ, đủ cho đồ án một máy chủ
  private readonly hits = new Map<string, number[]>();
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private checkRate(userId: string) {
    const now = Date.now();
    const recent = (this.hits.get(userId) ?? []).filter((t) => now - t < 60_000);
    if (recent.length >= MAX_PER_MINUTE) {
      throw new HttpException(
        'Bạn hỏi quá nhanh, vui lòng thử lại sau ít phút.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    recent.push(now);
    this.hits.set(userId, recent);
  }

  private async buildContext(userId: string): Promise<string> {
    const [user, due, wrong] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, xpPoints: true, streakDays: true },
      }),
      this.prisma.userSm2Stats.count({
        where: { userId, nextReviewAt: { lte: new Date() } },
      }),
      this.prisma.userAnswer.findMany({
        where: { isCorrect: false, attempt: { userId } },
        orderBy: { attempt: { startedAt: 'desc' } },
        take: 5,
        select: { question: { select: { prompt: true } } },
      }),
    ]);

    const lines = [
      `Tên: ${user?.fullName ?? 'Học viên'}`,
      `XP: ${user?.xpPoints ?? 0}, chuỗi ngày học: ${user?.streakDays ?? 0}`,
      `Số thẻ từ vựng đến hạn ôn: ${due}`,
    ];
    if (wrong.length > 0) {
      lines.push('Câu thi làm sai gần đây:');
      wrong.forEach((w) => lines.push(`- ${w.question.prompt.slice(0, 120)}`));
    }
    return lines.join('\n');
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const base = this.config.get<string>('AI_GATEWAY_URL') ?? 'http://localhost:8000';
    let res: Response;
    try {
      res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Key': this.config.get<string>('INTERNAL_API_KEY') ?? '',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000),
      });
    } catch {
      throw new BadGatewayException('Không kết nối được AI gateway');
    }
    if (!res.ok) {
      let detail = 'AI đang bận, thử lại sau ít giây.';
      try {
        const j = (await res.json()) as { detail?: unknown };
        if (typeof j.detail === 'string') detail = j.detail;
      } catch {
        /* giữ thông báo mặc định */
      }
      throw new HttpException(
        detail,
        res.status === 400 ? HttpStatus.BAD_REQUEST : HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return (await res.json()) as T;
  }

  async chat(userId: string, dto: ChatDto) {
    this.checkRate(userId);
    const context = await this.buildContext(userId);
    return this.post<{ reply: string }>('/api/v1/chat', {
      messages: dto.messages,
      context,
    });
  }

  async evaluateWriting(userId: string, dto: WritingDto) {
    this.checkRate(userId);
    const result = await this.post<Record<string, unknown>>(
      '/api/v1/evaluate-writing',
      {
        prompt: dto.prompt,
        essay_text: dto.essayText,
        task_type: dto.taskType,
      },
    );

    // Lưu lịch sử; lỗi ghi DB không được làm hỏng kết quả chấm
    try {
      const num = (v: unknown) =>
        typeof v === 'number' && Number.isFinite(v) ? v : 0;
      await this.prisma.writingHistory.create({
        data: {
          userId,
          taskType: dto.taskType,
          prompt: dto.prompt,
          essayText: dto.essayText,
          overallScore: num(result.overall_score),
          taskAchievement: num(result.task_achievement),
          coherenceCohesion: num(result.coherence_cohesion),
          lexicalResource: num(result.lexical_resource),
          grammaticalAccuracy: num(result.grammatical_accuracy),
          result: result as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.error('Không lưu được lịch sử chấm Writing', err as Error);
    }

    return result;
  }

  getWritingHistory(userId: string, limit: number) {
    return this.prisma.writingHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 50),
      select: {
        id: true,
        taskType: true,
        prompt: true,
        overallScore: true,
        taskAchievement: true,
        coherenceCohesion: true,
        lexicalResource: true,
        grammaticalAccuracy: true,
        createdAt: true,
      },
    });
  }
}
