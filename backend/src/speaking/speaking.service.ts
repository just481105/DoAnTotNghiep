import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../users/progress.service';
import { EvaluateSpeakingDto } from './dto/evaluate-speaking.dto';

export interface UploadedAudio {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

interface GatewayResult {
  word: string;
  expected_ipa: string;
  transcribed_text: string;
  accuracy_score: number;
  phonemes: { phoneme: string; is_correct: boolean; score: number }[];
}

const MAX_PER_MINUTE = 10;

@Injectable()
export class SpeakingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
    private readonly config: ConfigService,
  ) {}

  async evaluate(userId: string, dto: EvaluateSpeakingDto, file?: UploadedAudio) {
    if (!file) throw new BadRequestException('Thiếu file âm thanh (field "audio")');

    const recent = await this.prisma.speakingHistory.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 60_000) } },
    });
    if (recent >= MAX_PER_MINUTE) {
      throw new HttpException(
        'Bạn luyện quá nhanh, vui lòng thử lại sau ít phút.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const word = dto.word.trim();
    const vocab = await this.prisma.vocabulary.findUnique({ where: { word } });
    const ipa = vocab?.ipa ?? dto.ipa;
    if (!ipa) throw new BadRequestException('Từ chưa có trong kho, cần gửi kèm ipa');

    const result = await this.callGateway(file, word, ipa);

    const earnedXp = result.accuracy_score >= 80 ? 20 : 10;
    await this.prisma.speakingHistory.create({
      data: {
        userId,
        vocabularyId: vocab?.id ?? null,
        word,
        accuracyScore: result.accuracy_score,
        transcribedText: result.transcribed_text,
        phonemeScores: result.phonemes as unknown as Prisma.InputJsonValue,
      },
    });
    const updated = await this.progress.award(userId, earnedXp);

    return { ...result, earnedXp, totalXp: updated.xpPoints };
  }

  private async callGateway(
    file: UploadedAudio,
    word: string,
    ipa: string,
  ): Promise<GatewayResult> {
    const base = this.config.get<string>('AI_GATEWAY_URL') ?? 'http://localhost:8000';
    const form = new FormData();
    form.append(
      'audio',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype || 'audio/wav' }),
      file.originalname || 'recording.wav',
    );
    form.append('target_word', word);
    form.append('expected_ipa', ipa);

    try {
      const res = await fetch(`${base}/api/v1/evaluate-pronunciation`, {
        method: 'POST',
        headers: {
          'X-Internal-Key': this.config.get<string>('INTERNAL_API_KEY') ?? '',
        },
        body: form,
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`gateway trả ${res.status}`);
      return (await res.json()) as GatewayResult;
    } catch {
      throw new BadGatewayException('Không kết nối được AI Speech Gateway');
    }
  }
}
