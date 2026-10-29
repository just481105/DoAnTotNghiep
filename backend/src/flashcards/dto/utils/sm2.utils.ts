export interface SM2Input {
  quality: number; // 0 đến 5
  repetition: number;
  interval: number;
  easinessFactor: number;
}

export interface SM2Output {
  repetition: number;
  interval: number;
  easinessFactor: number;
  nextReviewDate: Date;
}

export function calculateSM2({
  quality,
  repetition,
  interval,
  easinessFactor,
}: SM2Input): SM2Output {
  let nextRepetition = repetition;
  let nextInterval = interval;
  let nextEF = easinessFactor;

  // Tính lại Easiness Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  nextEF = nextEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEF < 1.3) nextEF = 1.3; // Ngưỡng sàn theo chuẩn SM-2

  if (quality < 3) {
    // Trả lời sai/quên: reset chu kỳ ôn về đầu
    nextRepetition = 0;
    nextInterval = 1;
  } else {
    // Trả lời đúng
    if (nextRepetition === 0) {
      nextInterval = 1;
    } else if (nextRepetition === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(nextInterval * nextEF);
    }
    nextRepetition += 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  return {
    repetition: nextRepetition,
    interval: nextInterval,
    easinessFactor: Number(nextEF.toFixed(2)),
    nextReviewDate,
  };
}
