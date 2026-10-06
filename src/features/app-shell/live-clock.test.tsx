import { act, render, screen } from '@testing-library/react';
import { LiveClock } from './live-clock';

vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ lang: 'en', t: (key: string) => key }),
}));

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T08:30:15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the current time as HH:MM:SS', () => {
    render(<LiveClock />);
    expect(screen.getByText('08:30:15')).toBeInTheDocument();
  });

  it('ticks forward every second without a page reload', () => {
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('08:30:17')).toBeInTheDocument();
  });

  it('exposes the live time in its accessible name', () => {
    render(<LiveClock />);
    expect(screen.getByLabelText('shell.liveClock 08:30:15')).toBeInTheDocument();
  });
});
