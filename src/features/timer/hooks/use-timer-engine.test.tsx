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
const mockToastInfo = vi.fn();

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
vi.mock('sonner', () => ({ toast: { info: (...args: unknown[]) => mockToastInfo(...args) } }));

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

  it('waits on the start screen after one focus + break cycle without any interaction', () => {
    // Start pressed, then the user walks away (the Start press itself is not "around")
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());

    runPhase(); // focus 1 (nobody around) -> its break still auto-starts
    expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: true });
    runPhase(); // break (nobody around): a whole idle cycle -> the next focus waits
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: false, timeLeft: 60 });
    expect(mockRecord).toHaveBeenCalledTimes(2);

    // and it stays stopped
    runPhase(5 * MINUTE);
    expect(mockRecord).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['pointerdown', () => window.dispatchEvent(new Event('pointerdown'))],
    ['pointermove', () => window.dispatchEvent(new Event('pointermove'))],
    ['keydown', () => window.dispatchEvent(new Event('keydown'))],
    ['window focus', () => window.dispatchEvent(new Event('focus'))],
    ['tab becoming visible', () => document.dispatchEvent(new Event('visibilitychange'))],
  ])('%s during the focus keeps the chain going', (_name, fire) => {
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());

    runPhase(MINUTE / 2);
    act(() => fire()); // the user is at the screen during the focus
    runPhase(MINUTE / 2 + 1000); // focus ends -> break
    runPhase(); // break (idle) ends -> focus still auto-starts: they were around since the focus began
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: true });
  });

  it('interaction during the break alone also keeps the chain going', () => {
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());

    runPhase(); // focus 1 -> break
    runPhase(MINUTE / 2);
    interact('keydown');
    runPhase(MINUTE / 2 + 1000); // break ends -> focus
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: true });
  });

  it('counts the next idle cycle from zero once a new focus has begun', () => {
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    interact(); // around during focus 1
    runPhase(); // focus 1 -> break
    runPhase(); // break (idle) -> focus 2 (attended since focus 1 began)
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: true });
    runPhase(); // focus 2 (nobody around) -> break
    expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: true });
    runPhase(); // break (idle): nobody since focus 2 began -> stop
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: false });
  });

  it('a manual start after the chain stopped resumes normal chaining', () => {
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    runPhase();
    runPhase(); // stopped on the next focus
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: false });

    interact('pointerdown'); // click Start
    act(() => useTimerStore.getState().resumeTimer());
    interact('pointermove'); // and stays around
    runPhase(); // focus 2 (attended) -> break
    runPhase(); // break (idle) -> focus 3, someone was around since focus 2 began
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: true });
  });

  it('resuming a paused focus is not a new focus: earlier presence still counts', () => {
    resetStore({ timeLeft: 60, isRunning: true, deadlineAt: T + MINUTE });
    renderHook(() => useTimerEngine());
    runPhase(20_000);
    interact(); // around during this focus
    act(() => useTimerStore.getState().pauseTimer());
    act(() => useTimerStore.getState().resumeTimer()); // resume mid-phase
    runPhase(MINUTE); // focus ends -> break
    runPhase(); // break (idle) -> focus
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

// The engine lives in (main): leaving it by client navigation (/guide, /privacy, /terms)
// unmounts it while the store keeps its in-memory (now stale) `timeLeft`.
describe('useTimerEngine remount after client navigation', () => {
  beforeEach(() => {
    installMemoryStorage();
    vi.useFakeTimers();
    nextInstant();
    vi.clearAllMocks();
  });
  afterEach(() => vi.useRealTimers());

  const away = (ms: number) => vi.setSystemTime(Date.now() + ms);
  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  const runningFiveMinutes = () =>
    resetStore({
      timeLeft: 300,
      lastSessionTimeLeft: 300,
      isRunning: true,
      deadlineAt: T + 5 * MINUTE,
      settings: { ...quick, autoStartBreak: false },
    });

  it('keeps the original deadline: 3 minutes away take 3 minutes off the clock', () => {
    runningFiveMinutes();
    const first = renderHook(() => useTimerEngine());
    advance(1000);
    first.unmount(); // user opens /guide
    away(3 * MINUTE); // the store still says timeLeft ~299

    renderHook(() => useTimerEngine()); // and comes back
    const s = useTimerStore.getState();
    expect(s.deadlineAt).toBe(T + 5 * MINUTE);
    expect(s.timeLeft).toBe(300 - 1 - 180); // original minus the 1 s it ran and the 3 minutes away
    expect(s.isRunning).toBe(true);

    // still completes at the ORIGINAL deadline, once
    advance(2 * MINUTE);
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith(expect.objectContaining({ mode: 'work', endedAt: T + 5 * MINUTE }));
  });

  it('is exact when the engine was unmounted from the very start of the run', () => {
    runningFiveMinutes();
    renderHook(() => useTimerEngine()).unmount();
    away(2 * MINUTE);
    renderHook(() => useTimerEngine());
    expect(useTimerStore.getState().timeLeft).toBe(180);
    expect(useTimerStore.getState().deadlineAt).toBe(T + 5 * MINUTE);
  });

  it('completes exactly once when the deadline passed while away (recorded at the real end, no late alarm)', () => {
    runningFiveMinutes();
    renderHook(() => useTimerEngine()).unmount();
    away(5 * MINUTE + 2 * MINUTE); // deadline passed 2 minutes ago

    renderHook(() => useTimerEngine());
    advance(5000);

    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'work', completedFullSession: true, endedAt: T + 5 * MINUTE }),
    );
    expect(mockPlayAlarm).not.toHaveBeenCalled();
    expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: false, deadlineAt: null });

    advance(10 * MINUTE);
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('completes once under StrictMode when the deadline passed while away', () => {
    runningFiveMinutes();
    renderHook(() => useTimerEngine()).unmount();
    away(6 * MINUTE);
    renderHook(() => useTimerEngine(), { wrapper: StrictMode });
    advance(5000);
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('leaves the completion to the other tab that already claimed it', () => {
    runningFiveMinutes();
    renderHook(() => useTimerEngine()).unmount();
    away(6 * MINUTE);
    window.localStorage.setItem('timer-completion-claim', `work:${T + 5 * MINUTE}|some-other-tab`);
    renderHook(() => useTimerEngine());
    advance(5000);
    expect(mockRecord).not.toHaveBeenCalled();
  });

  it('does not touch a paused timer on remount', () => {
    resetStore({ timeLeft: 123, isRunning: false, deadlineAt: null });
    renderHook(() => useTimerEngine()).unmount();
    away(10 * MINUTE);
    renderHook(() => useTimerEngine());
    expect(useTimerStore.getState()).toMatchObject({ timeLeft: 123, isRunning: false, deadlineAt: null });
  });
});

// Sleep / wake: the clock jumps while no timer can run. A phase that ended long ago
// must not ring, record or earn a pomodoro "now"; a quiet notice says what happened.
describe('useTimerEngine late completion (sleep / wake)', () => {
  beforeEach(() => {
    installMemoryStorage();
    vi.useFakeTimers();
    nextInstant();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const HOUR = 60 * MINUTE;
  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  const startWork = (overrides: Record<string, unknown> = {}) =>
    resetStore({
      timeLeft: 60,
      isRunning: true,
      deadlineAt: T + MINUTE,
      settings: { ...quick, autoStartBreak: true },
      ...overrides,
    });

  it('a phase that ended hours ago (laptop slept) is not credited, not rung, not auto-started', () => {
    startWork();
    renderHook(() => useTimerEngine());
    advance(1000);
    vi.setSystemTime(T + 14 * HOUR); // lid reopened the next afternoon, same tab
    advance(500); // first tick after wake

    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockPlayAlarm).not.toHaveBeenCalled();
    expect(mockNotify).not.toHaveBeenCalled();
    const s = useTimerStore.getState();
    expect(s).toMatchObject({ mode: 'shortBreak', isRunning: false, deadlineAt: null, timeLeft: 60 });
    expect(s.completedSessions).toBe(0);
    expect(s.sessionCount).toBe(0);
    expect(mockToastInfo).toHaveBeenCalledTimes(1);
    expect(mockToastInfo).toHaveBeenCalledWith('timer.staleEnded', expect.anything());

    advance(10 * MINUTE);
    expect(mockRecord).not.toHaveBeenCalled(); // and nothing fires later either
    expect(mockToastInfo).toHaveBeenCalledTimes(1);
  });

  it('a break that ended hours ago is not recorded either', () => {
    startWork({ mode: 'shortBreak', lastSessionTimeLeft: 60 });
    renderHook(() => useTimerEngine());
    vi.setSystemTime(T + 3 * HOUR);
    advance(500);
    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockPlayAlarm).not.toHaveBeenCalled();
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: false });
    expect(mockToastInfo).toHaveBeenCalledTimes(1);
  });

  it('also catches a wake-up that surfaces through visibilitychange or the deadline timeout', () => {
    vi.useRealTimers();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.spyOn(globalThis, 'setInterval').mockImplementation((() => 0) as never);
    vi.spyOn(globalThis, 'clearInterval').mockImplementation(() => {});
    nextInstant();
    startWork({ settings: { ...quick, autoStartBreak: false } });
    renderHook(() => useTimerEngine());
    vi.setSystemTime(T + 5 * HOUR);
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockPlayAlarm).not.toHaveBeenCalled();
    expect(useTimerStore.getState().mode).toBe('shortBreak');
    expect(mockToastInfo).toHaveBeenCalledTimes(1);
  });

  it('a few minutes late (throttled / briefly suspended) is still a real, rung completion at the true end', () => {
    startWork();
    renderHook(() => useTimerEngine());
    vi.setSystemTime(T + MINUTE + 10 * MINUTE);
    advance(500);

    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'work', completedFullSession: true, endedAt: T + MINUTE }),
    );
    expect(mockPlayAlarm).toHaveBeenCalledTimes(1);
    expect(mockToastInfo).not.toHaveBeenCalled();
  });

  it('a reload after the grace window gets the same quiet notice (and still no credit)', () => {
    startWork({ timeLeft: 0, deadlineAt: T - 16 * MINUTE });
    renderHook(() => useTimerEngine());
    advance(1000);
    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockToastInfo).toHaveBeenCalledTimes(1);
  });

  it('a reload inside the grace window is credited quietly, without a notice', () => {
    startWork({ timeLeft: 0, deadlineAt: T - 2 * MINUTE });
    renderHook(() => useTimerEngine());
    advance(1000);
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockToastInfo).not.toHaveBeenCalled();
  });

  it('the tab that lost the completion claim shows no notice', () => {
    window.localStorage.setItem('timer-completion-claim', `work:${T + MINUTE}|some-other-tab`);
    startWork();
    renderHook(() => useTimerEngine());
    vi.setSystemTime(T + 14 * HOUR);
    advance(500);
    expect(mockToastInfo).not.toHaveBeenCalled();
    expect(mockRecord).not.toHaveBeenCalled();
  });
});
