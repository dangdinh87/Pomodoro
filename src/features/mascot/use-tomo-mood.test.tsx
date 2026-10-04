import { act, renderHook } from '@testing-library/react';
import { useTimerStore } from '@/stores/timer-store';
import { announceFocusComplete, useCelebrationStore } from './celebration-store';
import { useTomoMood } from './use-tomo-mood';

let stats = { streak: 0, focusSeconds: 0 };
vi.mock('@/hooks/use-stats', () => ({
  useStats: () => ({
    data: { summary: { streak: { current: stats.streak, longest: stats.streak }, totalFocusTime: stats.focusSeconds, completedSessions: 0 } },
  }),
}));

const at = (hour: number, minute = 0, second = 0) => new Date(2026, 9, 5, hour, minute, second);

describe('useTomoMood', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(at(10));
    stats = { streak: 0, focusSeconds: 0 };
    useCelebrationStore.setState({ pending: null });
    useTimerStore.setState({ mode: 'work', isRunning: false });
  });
  afterEach(() => vi.useRealTimers());

  it('greets according to the clock', () => {
    const { result } = renderHook(() => useTomoMood());
    expect(result.current.face).toBe('happy');
    expect(result.current.lineKey).toMatch(/^tomo\.lines\.greetingMorning\.[1-4]$/);
  });

  it('follows the timer: silent focus while running, break tip on a break', () => {
    const { result } = renderHook(() => useTomoMood());
    act(() => useTimerStore.setState({ isRunning: true }));
    expect(result.current).toEqual({ face: 'focus', lineKey: null });
    act(() => useTimerStore.setState({ mode: 'shortBreak' }));
    expect(result.current.face).toBe('sleepy');
    expect(result.current.lineKey).toMatch(/^tomo\.lines\.breakTip\./);
  });

  it('is party while a celebration is pending, and goes back once it is dismissed', () => {
    const { result } = renderHook(() => useTomoMood());
    act(() => announceFocusComplete(25));
    expect(result.current.face).toBe('party');
    act(() => useCelebrationStore.getState().dismiss());
    expect(result.current.face).toBe('happy');
  });

  it('worries about a streak at 18:00 without a reload', () => {
    vi.setSystemTime(at(17, 59, 30));
    stats = { streak: 6, focusSeconds: 0 };
    const { result } = renderHook(() => useTomoMood());
    expect(result.current.face).toBe('happy');

    act(() => void vi.advanceTimersByTime(60_000));
    expect(result.current.face).toBe('worried');
    expect(result.current.lineKey).toMatch(/^tomo\.lines\.keepStreak\./);
  });

  it('is not worried once today has any focus time, even under a minute', () => {
    vi.setSystemTime(at(20));
    stats = { streak: 6, focusSeconds: 40 };
    const { result } = renderHook(() => useTomoMood());
    expect(result.current.face).toBe('happy');
    expect(result.current.lineKey).toMatch(/^tomo\.lines\.greetingEvening\./);
  });

  it('refreshes the hour when the tab becomes visible again', () => {
    const { result } = renderHook(() => useTomoMood());
    expect(result.current.lineKey).toMatch(/greetingMorning/);
    vi.setSystemTime(at(14)); // timers were throttled while hidden: the clock moved on without an interval tick
    act(() => void document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.lineKey).toMatch(/greetingAfternoon/);
  });
});
