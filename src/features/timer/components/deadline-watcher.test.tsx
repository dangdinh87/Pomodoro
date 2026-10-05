import { act, render } from '@testing-library/react';
import { installMemoryStorage } from '@/test-utils/memory-storage';
import { markEngineMounted } from '@/lib/timer/engine-presence';
import { TIMER_STORAGE_KEY } from '@/lib/timer/persisted-phase';
import { DeadlineWatcher } from './deadline-watcher';

const { playAlarm, preloadAlarm, notifyPhaseComplete } = vi.hoisted(() => ({
  playAlarm: vi.fn(),
  preloadAlarm: vi.fn(),
  notifyPhaseComplete: vi.fn(),
}));
vi.mock('@/lib/timer/alarm', () => ({ playAlarm, preloadAlarm }));
vi.mock('@/lib/timer/notifications', () => ({ notifyPhaseComplete }));
vi.mock('@/contexts/i18n-context', () => ({ useI18n: () => ({ t: (key: string) => `t:${key}` }) }));

const MINUTE = 60_000;
// Alarm claims are remembered per (mode, deadline) for the whole file: each test runs at its own instant
let now = 1_900_000_000_000;

function persistTimer(state: Record<string, unknown>) {
  window.localStorage.setItem(
    TIMER_STORAGE_KEY,
    JSON.stringify({
      state: { mode: 'work', timeLeft: 60, isRunning: false, deadlineAt: null, ...state },
      version: 3,
    }),
  );
}

/** Another tab wrote the timer (start, pause, reset). */
function storageEventFromOtherTab() {
  window.dispatchEvent(new StorageEvent('storage', { key: TIMER_STORAGE_KEY }));
}

/** Lets the on-demand import of the bell resolve and the ring run. */
async function settle() {
  await act(async () => {
    await vi.dynamicImportSettled();
    // ring() continues a few promise hops after the import resolved
    for (let i = 0; i < 10; i += 1) await Promise.resolve();
  });
}

describe('DeadlineWatcher (pages without the timer engine)', () => {
  // The bell is imported on demand; load the (mocked) modules once so every import after resolves at once
  beforeAll(async () => {
    await import('@/lib/timer/alarm');
    await import('@/lib/timer/notifications');
  });

  beforeEach(() => {
    installMemoryStorage();
    vi.useFakeTimers();
    now += 1000 * MINUTE;
    vi.setSystemTime(now);
    vi.clearAllMocks();
  });
  afterEach(() => vi.useRealTimers());

  it('rings once at the deadline: the chosen alarm plus the notification, even with the page in view', async () => {
    const deadlineAt = now + MINUTE;
    persistTimer({ isRunning: true, deadlineAt });
    render(<DeadlineWatcher />);
    await settle();
    expect(preloadAlarm).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(MINUTE - 1));
    await settle();
    expect(playAlarm).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    await settle();
    expect(playAlarm).toHaveBeenCalledTimes(1);
    expect(notifyPhaseComplete).toHaveBeenCalledTimes(1);
    expect(notifyPhaseComplete).toHaveBeenCalledWith('work', expect.any(Function), { evenIfVisible: true });
    expect(notifyPhaseComplete.mock.calls[0][1]('timer.x')).toBe('t:timer.x');

    // Once: later events about the same (still persisted) phase never ring it again
    storageEventFromOtherTab();
    act(() => vi.advanceTimersByTime(10 * MINUTE));
    await settle();
    expect(playAlarm).toHaveBeenCalledTimes(1);
  });

  it('never records the session or touches the timer: the engine does that when the app is opened again', async () => {
    const deadlineAt = now + MINUTE;
    persistTimer({ isRunning: true, deadlineAt });
    const before = window.localStorage.getItem(TIMER_STORAGE_KEY);
    render(<DeadlineWatcher />);
    await settle();
    act(() => vi.advanceTimersByTime(MINUTE));
    await settle();
    expect(playAlarm).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(TIMER_STORAGE_KEY)).toBe(before);
    // The completion is still free for the engine to claim (and record)
    expect(window.localStorage.getItem('timer-completion-claim')).toBeNull();
  });

  it('stays silent while the engine is mounted in this tab (the app page rings itself)', async () => {
    const release = markEngineMounted();
    try {
      persistTimer({ isRunning: true, deadlineAt: now + MINUTE });
      render(<DeadlineWatcher />);
    await settle();
      act(() => vi.advanceTimersByTime(2 * MINUTE));
      await settle();
      expect(playAlarm).not.toHaveBeenCalled();
      expect(notifyPhaseComplete).not.toHaveBeenCalled();
    } finally {
      release();
    }
  });

  it('stands down when the app mounts its engine before the deadline, and takes over when it leaves', async () => {
    const deadlineAt = now + 2 * MINUTE;
    persistTimer({ isRunning: true, deadlineAt });
    render(<DeadlineWatcher />);
    await settle();

    // Back on the app page
    const release = markEngineMounted();
    act(() => vi.advanceTimersByTime(MINUTE));
    await settle();
    // Off to /guide again, with a minute to go
    act(() => release());
    act(() => vi.advanceTimersByTime(MINUTE));
    await settle();
    expect(playAlarm).toHaveBeenCalledTimes(1);
  });

  it('does not ring a phase that ended more than 15 minutes ago (asleep through it), like the engine', async () => {
    const deadlineAt = now + MINUTE;
    persistTimer({ isRunning: true, deadlineAt });
    render(<DeadlineWatcher />);
    await settle();
    // The laptop sleeps: the clock jumps 16 minutes past the deadline before the timer gets to run
    vi.setSystemTime(deadlineAt + 16 * MINUTE - MINUTE);
    act(() => vi.advanceTimersByTime(MINUTE));
    await settle();
    expect(playAlarm).not.toHaveBeenCalled();
    expect(notifyPhaseComplete).not.toHaveBeenCalled();
  });

  it('still rings a phase it notices late within the grace window (short sleep)', async () => {
    const deadlineAt = now + MINUTE;
    persistTimer({ isRunning: true, deadlineAt });
    render(<DeadlineWatcher />);
    await settle();
    vi.setSystemTime(deadlineAt + 10 * MINUTE - MINUTE);
    act(() => vi.advanceTimersByTime(MINUTE));
    await settle();
    expect(playAlarm).toHaveBeenCalledTimes(1);
  });

  it('does not ring a phase that was already over when the page opened (the engine settles it quietly)', async () => {
    persistTimer({ isRunning: true, deadlineAt: now - 3000 });
    render(<DeadlineWatcher />);
    await settle();
    act(() => vi.advanceTimersByTime(MINUTE));
    await settle();
    expect(playAlarm).not.toHaveBeenCalled();
  });

  it('lets only one tab ring: none when another tab already claimed this bell', async () => {
    const deadlineAt = now + MINUTE;
    persistTimer({ isRunning: true, deadlineAt });
    window.localStorage.setItem('timer-alarm-claim', `work:${deadlineAt}|other-tab`);
    render(<DeadlineWatcher />);
    await settle();
    act(() => vi.advanceTimersByTime(MINUTE));
    await settle();
    expect(playAlarm).not.toHaveBeenCalled();
    expect(notifyPhaseComplete).not.toHaveBeenCalled();
  });

  it('follows other tabs: arms on a start there, and stays silent after a pause there', async () => {
    persistTimer({ isRunning: false });
    render(<DeadlineWatcher />);
    await settle();

    const deadlineAt = now + MINUTE;
    persistTimer({ isRunning: true, deadlineAt });
    act(() => storageEventFromOtherTab());
    act(() => vi.advanceTimersByTime(30_000));
    persistTimer({ isRunning: false, deadlineAt: null, timeLeft: 30 });
    act(() => storageEventFromOtherTab());
    act(() => vi.advanceTimersByTime(MINUTE));
    await settle();
    expect(playAlarm).not.toHaveBeenCalled();

    const next = Date.now() + MINUTE;
    persistTimer({ mode: 'shortBreak', isRunning: true, deadlineAt: next });
    act(() => storageEventFromOtherTab());
    act(() => vi.advanceTimersByTime(MINUTE));
    await settle();
    expect(playAlarm).toHaveBeenCalledTimes(1);
    expect(notifyPhaseComplete).toHaveBeenCalledWith('shortBreak', expect.any(Function), { evenIfVisible: true });
  });

  it('loads nothing heavy while no phase is running', async () => {
    persistTimer({ isRunning: false });
    render(<DeadlineWatcher />);
    await settle();
    expect(preloadAlarm).not.toHaveBeenCalled();
  });
});
