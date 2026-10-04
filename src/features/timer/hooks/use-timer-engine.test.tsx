import { StrictMode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { installMemoryStorage } from '@/test-utils/memory-storage';
import { useTimerStore } from '@/stores/timer-store';
import { useTasksStore } from '@/stores/task-store';
import { useTimerEngine } from './use-timer-engine';

const mockRecord = vi.fn();
const mockFlush = vi.fn();
const mockPlayAlarm = vi.fn();
const mockNotify = vi.fn();

vi.mock('@/lib/timer/use-session-recorder', () => ({
  useSessionRecorder: () => ({ record: mockRecord, flush: mockFlush }),
}));
vi.mock('@/lib/timer/alarm', () => ({ playAlarm: () => mockPlayAlarm() }));
vi.mock('@/lib/timer/notifications', () => ({
  notifyPhaseComplete: (m: string) => mockNotify(m),
}));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const NOW = 1_800_000_000_000;
const settings = {
  workDuration: 50,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreak: true,
  autoStartWork: true,
  clockType: 'digital' as const,
  clockSize: 'medium' as const,
  showClock: false,
  lowTimeWarningEnabled: true,
};

describe('useTimerEngine', () => {
  beforeEach(() => {
    installMemoryStorage();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.clearAllMocks();
    useTasksStore.setState({ activeTaskId: 'task-1' } as never);
    useTimerStore.setState({
      mode: 'work',
      timeLeft: 3000,
      isRunning: false,
      deadlineAt: null,
      sessionCount: 0,
      completedSessions: 0,
      lastSessionTimeLeft: 3000,
      settings,
      usePlan: false,
      plan: [],
    });
  });
  afterEach(() => vi.useRealTimers());

  it('records the focused segment, plays the alarm and auto-starts the break', () => {
    useTimerStore.setState({
      timeLeft: 2,
      lastSessionTimeLeft: 1200, // e.g. a partial session was posted earlier
      isRunning: true,
      deadlineAt: NOW + 2000,
    });
    renderHook(() => useTimerEngine());

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith({
      taskId: 'task-1',
      durationSec: 1200,
      mode: 'work',
      completedFullSession: true, // ran to its deadline: earns the pomodoro
      endedAt: NOW + 2000,
    });
    expect(mockPlayAlarm).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledWith('work');
    const s = useTimerStore.getState();
    expect(s.mode).toBe('shortBreak');
    expect(s.timeLeft).toBe(300);
    expect(s.lastSessionTimeLeft).toBe(300);
    expect(s.isRunning).toBe(true);
    expect(s.completedSessions).toBe(1);
  });

  it('finishes a deadline that elapsed while closed: records once, advances, never auto-runs', () => {
    useTimerStore.setState({
      timeLeft: 0,
      isRunning: true,
      deadlineAt: NOW - 5000,
      lastSessionTimeLeft: 3000,
    });
    renderHook(() => useTimerEngine());
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith({
      taskId: 'task-1',
      durationSec: 3000,
      mode: 'work',
      completedFullSession: true,
      endedAt: NOW - 5000, // the real end, not the moment the app reopened
    });
    expect(mockPlayAlarm).not.toHaveBeenCalled();
    const s = useTimerStore.getState();
    expect(s.mode).toBe('shortBreak');
    expect(s.timeLeft).toBe(300);
    expect(s.isRunning).toBe(false);
  });

  it('catch-up older than the 15 minute grace advances silently without crediting anything', () => {
    useTimerStore.setState({
      timeLeft: 0,
      isRunning: true,
      deadlineAt: NOW - 16 * 60 * 1000,
      lastSessionTimeLeft: 3000,
    });
    renderHook(() => useTimerEngine());
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockRecord).not.toHaveBeenCalled();
    const s = useTimerStore.getState();
    expect(s.completedSessions).toBe(0);
    expect(s.sessionCount).toBe(0);
    expect(s.mode).toBe('shortBreak');
    expect(s.timeLeft).toBe(300);
    expect(s.isRunning).toBe(false);
  });

  it('catch-up just inside the grace is still recorded', () => {
    useTimerStore.setState({
      timeLeft: 0,
      isRunning: true,
      deadlineAt: NOW - 14 * 60 * 1000,
      lastSessionTimeLeft: 3000,
    });
    renderHook(() => useTimerEngine());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(useTimerStore.getState().completedSessions).toBe(1);
  });

  it('records exactly once and stays paused under StrictMode double effects', () => {
    useTimerStore.setState({
      timeLeft: 0,
      isRunning: true,
      deadlineAt: NOW - 3000,
      lastSessionTimeLeft: 3000,
    });
    renderHook(() => useTimerEngine(), { wrapper: StrictMode });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(useTimerStore.getState().isRunning).toBe(false);
    expect(useTimerStore.getState().completedSessions).toBe(1);
  });

  it('re-arms from the new deadline when only deadlineAt changes', () => {
    useTimerStore.setState({
      timeLeft: 100,
      isRunning: true,
      deadlineAt: NOW + 100_000,
    });
    renderHook(() => useTimerEngine());
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // another tab paused/resumed: same running state, earlier deadline
    act(() => {
      useTimerStore.setState({ timeLeft: 1, deadlineAt: Date.now() + 1000 });
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('does nothing when another tab already claimed this completion', () => {
    const deadline = NOW + 1000;
    window.localStorage.setItem(
      'timer-completion-claim',
      `work:${deadline}|some-other-tab`,
    );
    useTimerStore.setState({
      timeLeft: 1,
      isRunning: true,
      deadlineAt: deadline,
    });
    renderHook(() => useTimerEngine());
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockPlayAlarm).not.toHaveBeenCalled();
    expect(useTimerStore.getState().mode).toBe('work');
  });

  it('records breaks without a task', () => {
    useTimerStore.setState({
      mode: 'shortBreak',
      timeLeft: 1,
      lastSessionTimeLeft: 300,
      isRunning: true,
      deadlineAt: NOW + 1000,
    });
    renderHook(() => useTimerEngine());
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(mockRecord).toHaveBeenCalledWith({
      taskId: null,
      durationSec: 300,
      mode: 'shortBreak',
      endedAt: NOW + 1000,
    });
    expect(useTimerStore.getState().mode).toBe('work');
  });

  it('flushes the retry queue on mount and when back online', () => {
    renderHook(() => useTimerEngine());
    expect(mockFlush).toHaveBeenCalledTimes(1);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(mockFlush).toHaveBeenCalledTimes(2);
  });
});
