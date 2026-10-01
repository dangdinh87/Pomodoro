import { computeStreaks } from './streak';

describe('computeStreaks', () => {
  it('is zero without activity', () => {
    expect(computeStreaks([], '2026-10-01')).toEqual({ current: 0, longest: 0 });
  });

  it('counts a run ending today or yesterday as current', () => {
    const days = ['2026-09-28', '2026-09-29', '2026-09-30'];
    expect(computeStreaks(days, '2026-09-30')).toEqual({ current: 3, longest: 3 });
    expect(computeStreaks(days, '2026-10-01')).toEqual({ current: 3, longest: 3 });
  });

  it('drops the current streak after a missed day but keeps the longest', () => {
    const days = ['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-28'];
    expect(computeStreaks(days, '2026-10-01')).toEqual({ current: 0, longest: 3 });
    expect(computeStreaks(days, '2026-09-28')).toEqual({ current: 1, longest: 3 });
  });

  it('ignores duplicates and order', () => {
    const days = ['2026-09-30', '2026-09-29', '2026-09-30', '2026-09-29'];
    expect(computeStreaks(days, '2026-09-30')).toEqual({ current: 2, longest: 2 });
  });
});
