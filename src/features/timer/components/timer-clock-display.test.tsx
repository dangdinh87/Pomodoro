import { render, screen } from '@testing-library/react';
import { useTimerStore, defaultSettings } from '@/stores/timer-store';
import { stageWidth } from './clocks/clock-math';
import { TimerClockDisplay } from './timer-clock-display';

const { threeClockLoaded } = vi.hoisted(() => ({ threeClockLoaded: vi.fn() }));
vi.mock('./clocks/three-clock', () => {
  threeClockLoaded();
  return { ThreeClock: ({ scene }: { scene: string }) => <div data-testid="three-clock">{scene}</div> };
});
vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const showClock = (clockType: (typeof defaultSettings)['clockType']) =>
  useTimerStore.setState({ mode: 'work', timeLeft: 1500, isRunning: false, settings: { ...defaultSettings, clockType } });

describe('TimerClockDisplay', () => {
  it('does not fetch the 3D clock for the default digital style', () => {
    showClock('digital');
    render(<TimerClockDisplay />);
    expect(threeClockLoaded).not.toHaveBeenCalled();
  });

  it('holds a 3D style\'s exact stage box while its code loads, so the card does not move', async () => {
    showClock('solid');
    const { container } = render(<TimerClockDisplay />);
    const placeholder = container.querySelector('[aria-hidden="true"].mx-auto') as HTMLElement;
    expect(placeholder.style.width).toBe(stageWidth('medium', 2.6));
    expect(placeholder.style.aspectRatio).toMatch(/^2\.6( \/ 1)?$/);

    expect(await screen.findByTestId('three-clock')).toHaveTextContent('solid');
    expect(threeClockLoaded).toHaveBeenCalledTimes(1);
  });
});
