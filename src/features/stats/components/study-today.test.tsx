import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/contexts/i18n-context';
import { WeekChart } from './week-chart';
import { heatmapRange } from './streak-heatmap';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  // 03:00 on Monday 2026-10-05 in Vietnam: before 04:00 the study day is still Sunday the 4th.
  vi.setSystemTime(new Date('2026-10-04T20:00:00Z'));
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockImplementation(
    () => ({ timeZone: 'Asia/Ho_Chi_Minh' }) as Intl.ResolvedDateTimeFormatOptions,
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('study-day aware stats UI', () => {
  it('ends the heatmap window on the current study day', () => {
    const { from, to } = heatmapRange();
    expect([to.getFullYear(), to.getMonth(), to.getDate()]).toEqual([2026, 9, 4]);
    expect(from.getDay()).toBe(1); // starts on a Monday
  });

  it('highlights the study day, not the calendar day, in the week chart', () => {
    const data = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'].map(
      (date) => ({ date, duration: 600 }),
    );
    render(
      <I18nProvider initialLang="en">
        <WeekChart data={data} />
      </I18nProvider>,
    );
    expect(screen.getByText('Sun')).toHaveClass('font-semibold');
    expect(screen.getByText('Sat')).not.toHaveClass('font-semibold');
  });
});
