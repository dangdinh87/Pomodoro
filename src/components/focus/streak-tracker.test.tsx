import { calculateCurrentStreak } from './streak-tracker';

describe('calculateCurrentStreak', () => {
  const today = '2024-05-24';

  it('returns 0 if today is not in history', () => {
    expect(calculateCurrentStreak([], today)).toBe(0);
    expect(calculateCurrentStreak(['2024-05-23'], today)).toBe(0);
  });

  it('returns 1 if only today is in history', () => {
    expect(calculateCurrentStreak([today], today)).toBe(1);
  });

  it('calculates streak correctly for consecutive days', () => {
    const history = ['2024-05-22', '2024-05-23', '2024-05-24'];
    expect(calculateCurrentStreak(history, today)).toBe(3);
  });

  it('calculates streak correctly with gaps', () => {
    const history = ['2024-05-20', '2024-05-22', '2024-05-23', '2024-05-24'];
    // 21st is missing, so streak is 22, 23, 24 = 3
    expect(calculateCurrentStreak(history, today)).toBe(3);
  });

  it('handles unsorted history', () => {
    const history = ['2024-05-24', '2024-05-22', '2024-05-23'];
    expect(calculateCurrentStreak(history, today)).toBe(3);
  });

  it('handles duplicates', () => {
    const history = ['2024-05-23', '2024-05-24', '2024-05-23'];
    expect(calculateCurrentStreak(history, today)).toBe(2);
  });
});
