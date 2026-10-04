import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/test-utils/i18n';
import { WeekChart } from './week-chart';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-05T10:00:00Z'));
});
afterEach(() => vi.useRealTimers());

const days = ['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];

describe('WeekChart', () => {
  it('names the chart and every day with its minutes, including empty days', () => {
    render(
      <I18nProvider initialLang="en">
        <WeekChart data={days.map((date, i) => ({ date, duration: i === 1 ? 0 : (i + 1) * 600 }))} />
      </I18nProvider>,
    );
    expect(screen.getByRole('list', { name: 'Focus minutes for the last 7 days' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(screen.getByRole('listitem', { name: /Wednesday, Sep 30: 0 min/ })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Monday, Oct 5: 70 min/ })).toBeInTheDocument();
  });

  it('marks only the current study day with the accent bar', () => {
    const { container } = render(
      <I18nProvider initialLang="en">
        <WeekChart data={days.map((date) => ({ date, duration: 1800 }))} />
      </I18nProvider>,
    );
    const bars = container.querySelectorAll('[data-today]');
    expect([...bars].map((b) => b.getAttribute('data-today'))).toEqual(['false', 'false', 'false', 'false', 'false', 'false', 'true']);
    expect(bars[6]).toHaveClass('bg-primary');
    expect(bars[0]).toHaveClass('bg-candy-butter');
  });
});
