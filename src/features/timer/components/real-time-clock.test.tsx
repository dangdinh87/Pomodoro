import { render, screen } from '@testing-library/react';
import { RealTimeClock } from './real-time-clock';

vi.mock('@/contexts/i18n-context', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('RealTimeClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T08:05:09'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the wall-clock hour, minute and second as separate digits', () => {
    render(<RealTimeClock />);
    // Each digit tile mirrors its value in a static top AND bottom span (the flip-clock design), so a digit
    // that appears once in "08:05:09" (e.g. "8", "5", "9") renders twice; "0" appears 3 times (×2 each).
    expect(screen.getAllByText('8').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('9').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(6);
  });

  it('exposes the current time in an accessible timer role', () => {
    render(<RealTimeClock />);
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', 'timerUi.realClock.aria');
  });
});
