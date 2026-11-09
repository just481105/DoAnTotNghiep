export interface Sm2State {
  repetitions: number;
  intervalDays: number;
  easinessFactor: number;
}

export interface Sm2Result extends Sm2State {
  nextReviewAt: Date;
}

const MIN_EF = 1.3;

/**
 * SuperMemo-2.
 * quality: 0..5. Dưới 3 là quên: reset chu kỳ, giữ nguyên EF theo chuẩn gốc.
 */
export function calculateSm2(
  quality: number,
  state: Sm2State,
  now: Date = new Date(),
): Sm2Result {
  let { repetitions, intervalDays, easinessFactor } = state;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      // dùng EF cũ để tính interval, đúng chuẩn SM-2
      intervalDays = Math.round(intervalDays * easinessFactor);
    }
    repetitions += 1;

    const q = 5 - quality;
    easinessFactor = Math.max(MIN_EF, easinessFactor + (0.1 - q * (0.08 + q * 0.02)));
    easinessFactor = Math.round(easinessFactor * 100) / 100;
  }

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return { repetitions, intervalDays, easinessFactor, nextReviewAt };
}
