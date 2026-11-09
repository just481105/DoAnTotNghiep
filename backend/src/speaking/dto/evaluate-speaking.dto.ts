import { IsOptional, IsString, MaxLength } from 'class-validator';

export class EvaluateSpeakingDto {
  @IsString()
  @MaxLength(100)
  word: string;

  /** Chỉ dùng khi từ chưa có trong kho từ vựng */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ipa?: string;
}
