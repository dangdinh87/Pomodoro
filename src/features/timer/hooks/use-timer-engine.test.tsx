import { StrictMode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { installMemoryStorage } from '@/test-utils/memory-storage';
import { useTimerStore } from '@/stores/timer-store';
import { useTasksStore } from '@/stores/task-store';
import { getBrowserTimeZone, studyDayOf } from '@/lib/stats/study-day';
import { useTimerEngine } from './use-timer-engine';

const mockRecord = vi.fn();
const mockFlush = vi.fn();
const mockPlayAlarm = vi.fn();
const mockPreloadAlarm = vi.fn();
const mockNotify = vi.fn();

vi.mock('@/lib/timer/use-session-recorder', () => ({
  useSessionRecorder: () => ({ record: mockRecord, flush: mockFlush }),
}));
vi.mock('@/lib/timer/alarm', () => ({
  playAlarm: () => mockPlayAlarm(),
  preloadAlarm: () => mockPreloadAlarm(),
}));
vi.mock('@/lib/timer/notifications', () => ({
  notifyPhaseComplete: (m: string, t: unknown) => mockNotify(m, t),
}));
vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key }),
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
  keepScreenOn: false,
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
    expect(mockNotify).toHaveBeenCalledWith('work', expect.any(Function));
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

// One-minute phases keep the chain tests short.
const MINUTE = 60_000;
// Completion claims are remembered per (mode, deadline) for the whole file, so
// every test below runs at its own instant to stay independent.
let T = NOW;
let seq = 0;
const nextInstant = () => {
  T = NOW + ++seq * 1000 * MINUTE;
  vi.setSystemTime(T);
};
const quick = { ...settings, workDuration: 1, shortBreakDuration: 1, longBreakDuration: 1 };

function resetStore(overrides: Record<string, unknown> = {}) {
  useTasksStore.setState({ activeTaskId: 'task-1' } as never);
  useTimerStore.setState({
    mode: 'work',
    timeLeft: 60,
    isRunning: false,
    deadlineAt: null,
    sessionCount: 0,
    sessionCountDay: null,
    completedSessions: 0,
    lastSessionTimeLeft: 60,
    settings: quick,
    usePlan: false,
    plan: [],
    ...overrides,
  });
}

describe('useTimerEngine auto-start chain', () => {
  beforeEach(() => {
    installMemoryStorage();
    vi.useFakeTimers();
    nextInstant();
    vi.clearAllMocks();
  });
  afterEach(() => vi.useRealTimers());

  const runPhase = (ms = MINUTE + 1000) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  const interact = (type = 'pointerdown') =>
    act(() => {
      window.dispatchEvent(new Event(type));
    });

  it('never rolls a long break into a focus session by itself', () => {
    resetStore({ mode: 'longBreak', timeLeft: 1, lastSessionTimeLeft: 60, isRunning: true, deadlineAt: T + 1000 });
    renderHook(() => useTimerEngine());
    interact();
    runPhase(1500);

    const s = useTimerStore.getState();
    expect(s.mode).toBe('work');
    expect(s.isRunning).toBe(false);
    expect(s.timeLeft).toBe(60);
  });

  it('a focus session still rolls into its break (autoStartBreak)', () => {
    resetStore({ timeLeft: 1, isRunning: true, deadlineAt: T + 1000 });
    renderHook(() => useTimerEngine());
    runPhase(1500);
    expect(useTimerStore.getState().mode).toBe('shortBreak');
    expect(useTimerStore.getState().isRunning).toBe(true);
  });

  it('a short break rolls into focus while the user is around and autoStartWork is on', () => {
    resetStore({ mode: 'shortBreak', timeLeft: 1, isRunning: true, deadlineAt: T + 1000 });
    renderHook(() => useTimerEngine());
    interact('keydown');
    runPhase(1500);
    expect(useTimerStore.getState().mode).toBe('work');
    expect(useTimerStore.getState().isRunning).toBe(true);
  });

  it('a short break does not roll into focus when autoStartWork is off', () => {
    resetStore({
      mode: 'shortBreak',
      timeLeft: 1,
      isRunning: true,
      deadlineAt: T + 1000,
      settings: { ...quick, autoStartWork: false },
    });
    renderHook(() => useTimerEngine());
    interact();
    runPhase(1500);
    expect(useTimerStore.getState().mode).toBe('work');
    expect(useTimerStore.getState().isRunning).toBe(false);
  });

  it('waits on the start screen after a whole focus + break cycle without any interaction', () => {
    // started by the user (mount counts as presence), then left alone
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());

    runPhase(); // focus 1 (attended) -> break auto-starts
    expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: true });
    runPhase(); // break (nobody around) -> focus auto-starts
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: true });
    runPhase(); // focus 2 (nobody around): a whole idle cycle -> stop
    expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: false, timeLeft: 60 });
    expect(mockRecord).toHaveBeenCalledTimes(3);

    // and it stays stopped
    runPhase(5 * MINUTE);
    expect(mockRecord).toHaveBeenCalledTimes(3);
  });

  it.each([
    ['pointerdown', () => window.dispatchEvent(new Event('pointerdown'))],
    ['pointermove', () => window.dispatchEvent(new Event('pointermove'))],
    ['keydown', () => window.dispatchEvent(new Event('keydown'))],
    ['window focus', () => window.dispatchEvent(new Event('focus'))],
    ['tab becoming visible', () => document.dispatchEvent(new Event('visibilitychange'))],
  ])('%s during a phase keeps the chain going', (_name, fire) => {
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());

    runPhase(); // focus 1 -> break
    runPhase(MINUTE / 2);
    act(() => fire()); // the user is back in the middle of the break
    runPhase(MINUTE / 2 + 1000); // break ends -> focus
    runPhase(); // focus 2 (idle) -> break still auto-starts: only 1 idle phase so far
    expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: true });
  });

  it('counts the next idle cycle from zero after the user comes back', () => {
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    runPhase(); // focus 1 -> break
    runPhase(); // break (idle) -> focus
    interact(); // user returns during focus 2
    runPhase(); // focus 2 (attended) -> break
    expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: true });
    runPhase(); // break (idle 1) -> focus
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: true });
  });

  it('manual start after the chain stopped resumes normal chaining', () => {
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    runPhase();
    runPhase();
    runPhase(); // stopped on the break
    expect(useTimerStore.getState().isRunning).toBe(false);

    interact('pointerdown'); // click Start
    act(() => useTimerStore.getState().resumeTimer());
    runPhase(); // break (attended)
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: true });
  });
});

describe('useTimerEngine study-day counter', () => {
  beforeEach(() => {
    installMemoryStorage();
    vi.useFakeTimers();
    nextInstant();
    vi.clearAllMocks();
  });
  afterEach(() => vi.useRealTimers());

  const today = () => studyDayOf(new Date(T), getBrowserTimeZone());

  it('a first session on a new study day counts as 1, so it never triggers yesterday\'s long break', () => {
    resetStore({
      timeLeft: 1,
      isRunning: true,
      deadlineAt: T + 1000,
      sessionCount: 3, // yesterday's 4th-session-to-be
      sessionCountDay: '1999-12-31',
    });
    renderHook(() => useTimerEngine());
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    const s = useTimerStore.getState();
    expect(s.sessionCount).toBe(1);
    expect(s.mode).toBe('shortBreak');
  });

  it('today\'s 4th session still earns the long break', () => {
    resetStore({
      timeLeft: 1,
      isRunning: true,
      deadlineAt: T + 1000,
      sessionCount: 3,
      sessionCountDay: today(),
    });
    renderHook(() => useTimerEngine());
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    const s = useTimerStore.getState();
    expect(s.sessionCount).toBe(4);
    expect(s.mode).toBe('longBreak');
  });

  it('zeroes a stale count when the app opens or the tab becomes visible on a new day', () => {
    resetStore({ sessionCount: 4, sessionCountDay: '1999-12-31' });
    renderHook(() => useTimerEngine());
    expect(useTimerStore.getState().sessionCount).toBe(0);

    act(() => useTimerStore.setState({ sessionCount: 2, sessionCountDay: '1999-12-31' }));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(useTimerStore.getState().sessionCount).toBe(0);
  });
});

describe('useTimerEngine deadline timeout (throttled background tab)', () => {
  beforeEach(() => {
    installMemoryStorage();
    // Only setTimeout + Date are faked; setInterval is stubbed to never fire,
    // which is what a heavily throttled hidden tab looks like.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    nextInstant();
    vi.clearAllMocks();
    vi.spyOn(globalThis, 'setInterval').mockImplementation((() => 0) as never);
    vi.spyOn(globalThis, 'clearInterval').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // No break auto-start: only the first completion is under test
  const running = { settings: { ...quick, autoStartBreak: false } };

  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  it('completes exactly at the deadline, once, without any interval tick', () => {
    resetStore({ ...running, timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());

    advance(MINUTE - 1);
    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockPlayAlarm).not.toHaveBeenCalled();

    advance(1);
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'work', completedFullSession: true, endedAt: T + MINUTE }),
    );
    expect(mockPlayAlarm).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledTimes(1);

    advance(10 * MINUTE);
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockPlayAlarm).toHaveBeenCalledTimes(1);
  });

  it('pausing cancels the pending completion', () => {
    resetStore({ ...running, timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    advance(30_000);
    act(() => useTimerStore.getState().pauseTimer());
    advance(2 * MINUTE);
    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockPlayAlarm).not.toHaveBeenCalled();
  });

  it('resuming re-arms for the new deadline', () => {
    resetStore({ ...running, timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    advance(30_000);
    act(() => useTimerStore.getState().pauseTimer());
    advance(MINUTE);
    act(() => useTimerStore.getState().resumeTimer()); // 60s left from "now"

    advance(MINUTE - 1);
    expect(mockRecord).not.toHaveBeenCalled();
    advance(1);
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('completes right away when the tab wakes up after the deadline passed', () => {
    resetStore({ ...running, timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    // the clock moved on while no timer was allowed to run
    vi.setSystemTime(T + MINUTE + 20_000);
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith(expect.objectContaining({ endedAt: T + MINUTE }));
    advance(MINUTE);
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('visibilitychange before the deadline re-arms instead of completing early', () => {
    resetStore({ ...running, timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    advance(20_000);
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(mockRecord).not.toHaveBeenCalled();
    advance(40_000);
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('completes once under StrictMode double effects', () => {
    resetStore({ ...running, timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine(), { wrapper: StrictMode });
    advance(MINUTE);
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockPlayAlarm).toHaveBeenCalledTimes(1);
  });

  it('does nothing when another tab already claimed the completion', () => {
    window.localStorage.setItem('timer-completion-claim', `work:${T + MINUTE}|some-other-tab`);
    resetStore({ ...running, timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    advance(MINUTE);
    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockPlayAlarm).not.toHaveBeenCalled();
  });

  it('does not fire after the engine unmounted', () => {
    resetStore({ ...running, timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    const { unmount } = renderHook(() => useTimerEngine());
    unmount();
    advance(2 * MINUTE);
    expect(mockRecord).not.toHaveBeenCalled();
  });

  it('preloads the alarm sound when a run starts', () => {
    resetStore({ ...running, timeLeft: 60, isRunning: false });
    renderHook(() => useTimerEngine());
    expect(mockPreloadAlarm).not.toHaveBeenCalled();
    act(() => useTimerStore.getState().resumeTimer());
    expect(mockPreloadAlarm).toHaveBeenCalled();
  });
});
