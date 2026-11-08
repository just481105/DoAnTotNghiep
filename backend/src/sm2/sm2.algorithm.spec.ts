import { calculateSm2 } from './sm2.algorithm';

const NOW = new Date('2026-11-08T00:00:00Z');
const fresh = { repetitions: 0, intervalDays: 0, easinessFactor: 2.5 };

describe('calculateSm2', () => {
  it('lần đầu nhớ tốt: interval 1 ngày, repetitions 1', () => {
    const r = calculateSm2(4, fresh, NOW);
    expect(r.repetitions).toBe(1);
    expect(r.intervalDays).toBe(1);
  });

  it('lần hai nhớ tốt: interval 6 ngày', () => {
    const r = calculateSm2(4, { repetitions: 1, intervalDays: 1, easinessFactor: 2.5 }, NOW);
    expect(r.intervalDays).toBe(6);
    expect(r.repetitions).toBe(2);
  });

  it('lần ba: interval = round(6 * EF cũ)', () => {
    const r = calculateSm2(4, { repetitions: 2, intervalDays: 6, easinessFactor: 2.5 }, NOW);
    expect(r.intervalDays).toBe(15);
  });

  it('quên (quality < 3): reset repetitions, interval về 1, giữ EF', () => {
    const r = calculateSm2(1, { repetitions: 5, intervalDays: 30, easinessFactor: 2.2 }, NOW);
    expect(r.repetitions).toBe(0);
    expect(r.intervalDays).toBe(1);
    expect(r.easinessFactor).toBe(2.2);
  });

  it('quality 5 tăng EF, quality 3 giảm EF', () => {
    expect(calculateSm2(5, fresh, NOW).easinessFactor).toBe(2.6);
    expect(calculateSm2(3, fresh, NOW).easinessFactor).toBe(2.36);
  });

  it('EF không xuống dưới 1.3', () => {
    const r = calculateSm2(3, { repetitions: 2, intervalDays: 6, easinessFactor: 1.3 }, NOW);
    expect(r.easinessFactor).toBe(1.3);
  });

  it('nextReviewAt = now + interval ngày', () => {
    const r = calculateSm2(4, fresh, NOW);
    expect(r.nextReviewAt.getTime() - NOW.getTime()).toBe(24 * 60 * 60 * 1000);
  });
});
