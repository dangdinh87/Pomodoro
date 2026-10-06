import { computeStreaks } from './streak';
import { studyDayOf } from './study-day';

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

describe('computeStreaks over study days in the user zone', () => {
  const VN = 'Asia/Ho_Chi_Minh';
  const dayOf = (iso: string) => studyDayOf(new Date(iso), VN);

  it('does not split a late-night session, so the streak holds', () => {
    // 23:50 on the 3rd, 00:15 on the 5th (still the 4th's study day), all in Vietnam time.
    const days = ['2026-10-03T23:50:00+07:00', '2026-10-05T00:15:00+07:00'].map(dayOf);
    expect(days).toEqual(['2026-10-03', '2026-10-04']);
    const now = dayOf('2026-10-05T09:30:00+07:00');
    expect(computeStreaks(days, now)).toEqual({ current: 2, longest: 2 });
  });

  it('keeps the streak alive until 04:00 even if today has no session yet', () => {
    const days = ['2026-10-03T10:00:00+07:00', '2026-10-04T10:00:00+07:00'].map(dayOf);
    // 03:59 on the 6th is still the 5th's study day: the 5th can still be studied.
    expect(computeStreaks(days, dayOf('2026-10-06T03:59:00+07:00'))).toEqual({ current: 2, longest: 2 });
    // From 04:00 on the 6th the 5th is over and was empty: the streak is gone.
    expect(computeStreaks(days, dayOf('2026-10-06T04:00:00+07:00'))).toEqual({ current: 0, longest: 2 });
  });

  it('counts the viewer zone rather than UTC (00:31 in Vietnam is still the 4th)', () => {
    const session = '2026-10-04T17:31:00Z';
    expect(computeStreaks([studyDayOf(new Date(session), VN)], '2026-10-04')).toEqual({ current: 1, longest: 1 });
    expect(studyDayOf(new Date(session), 'Pacific/Auckland')).toBe('2026-10-05'); // 06:31 on the 5th
  });
});
