import { calculateSM2 } from './sm2.utils';

describe('SM2 Algorithm', () => {
  it('Lần đầu tiên bấm Good: repetition = 1, interval = 1', () => {
    const result = calculateSM2({
      quality: 4, // good
      repetition: 0,
      interval: 0,
      easinessFactor: 2.5,
    });

    expect(result.repetition).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easinessFactor).toBe(2.5);
  });

  it('Lần thứ 2 bấm Good: repetition = 2, interval = 6', () => {
    const result = calculateSM2({
      quality: 4,
      repetition: 1,
      interval: 1,
      easinessFactor: 2.5,
    });

    expect(result.repetition).toBe(2);
    expect(result.interval).toBe(6);
  });

  it('Bấm Again khi đang ở chu kỳ cao: reset repetition về 0 và interval về 1', () => {
    const result = calculateSM2({
      quality: 1, // again
      repetition: 4,
      interval: 20,
      easinessFactor: 2.4,
    });

    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);
  });
});
