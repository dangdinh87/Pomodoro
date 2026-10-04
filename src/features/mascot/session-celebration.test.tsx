import { act, fireEvent, render, screen } from '@testing-library/react';
import confetti from 'canvas-confetti';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { installMemoryStorage } from '@/test-utils/memory-storage';
import { useTimerStore } from '@/stores/timer-store';
import { useTasksStore } from '@/stores/task-store';
import { useTimerEngine } from '@/features/timer/hooks/use-timer-engine';
import { TimerControls } from '@/features/timer/components/timer-controls';
import { SessionCelebration } from './session-celebration';
import { useCelebrationStore } from './celebration-store';

const mockRecord = vi.fn();
let reducedMotion = false;

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
let stats = { streak: 4, focusSeconds: 1500 };
vi.mock('@/hooks/use-stats', () => ({
  useStats: () => ({
    data: { summary: { streak: { current: stats.streak, longest: 9 }, totalFocusTime: stats.focusSeconds, completedSessions: 1 } },
  }),
}));
vi.mock('@/lib/timer/use-session-recorder', () => ({
  useSessionRecorder: () => ({ record: mockRecord, flush: vi.fn(), switchActiveTask: vi.fn() }),
}));
vi.mock('@/lib/timer/alarm', () => ({ playAlarm: vi.fn(), preloadAlarm: vi.fn() }));
vi.mock('@/lib/timer/notifications', () => ({ notifyPhaseComplete: vi.fn(), requestNotificationPermission: vi.fn() }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => reducedMotion,
}));

const settings = {
  workDuration: 50,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartWork: false,
  clockType: 'digital' as const,
  clockSize: 'medium' as const,
  showClock: false,
  lowTimeWarningEnabled: true,
  keepScreenOn: false,
};

let testNo = 0;
let NOW = 0;

function Engine() {
  useTimerEngine();
  return null;
}

function renderStage(lang: Lang = 'en') {
  return render(
    <I18nProvider initialLang={lang}>
      <Engine />
      <TimerControls />
      <SessionCelebration />
    </I18nProvider>,
  );
}

/** A focus phase two seconds from its natural end. */
function focusAboutToEnd(patch: Partial<typeof settings> = {}) {
  useTimerStore.setState({
    mode: 'work',
    timeLeft: 2,
    lastSessionTimeLeft: 3000,
    isRunning: true,
    deadlineAt: NOW + 2000,
    settings: { ...settings, ...patch },
  });
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const dialog = () => screen.queryByRole('dialog');

describe('SessionCelebration', () => {
  beforeEach(() => {
    installMemoryStorage();
    vi.useFakeTimers();
    NOW = 1_800_000_000_000 + ++testNo * 10_000_000; // completion claims are remembered per deadline
    vi.setSystemTime(NOW);
    vi.clearAllMocks();
    reducedMotion = false;
    stats = { streak: 4, focusSeconds: 1500 };
    useCelebrationStore.setState({ pending: null });
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

  it('shows after a focus session ends on its own: Tomo party, title, minutes, streak, both buttons', () => {
    focusAboutToEnd();
    renderStage();
    expect(dialog()).toBeNull();

    advance(2500);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(modal.querySelector('svg[data-face="party"]')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent(/Session complete!|Nailed it!|Great focus!|One more tomato in the basket!/);
    expect(screen.getByText('+50 min')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '4-day streak' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Take a break' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Later' })).toBeInTheDocument();
    expect(confetti).toHaveBeenCalled();
  });

  it('uses the length of the phase in a custom plan', () => {
    focusAboutToEnd();
    useTimerStore.setState({ usePlan: true, plan: [{ id: 'a', type: 'work', minutes: 35 }], currentStepIndex: 0 });
    renderStage();
    advance(2500);
    expect(screen.getByText('+35 min')).toBeInTheDocument();
  });

  it('counts today in the streak while the stats do not include this session yet', () => {
    stats = { streak: 4, focusSeconds: 0 }; // streak reaches yesterday; the session is still being posted
    focusAboutToEnd();
    renderStage();
    advance(2500);
    expect(screen.getByRole('img', { name: '5-day streak' })).toBeInTheDocument();
  });

  it('shows a 1-day streak for a first-ever session', () => {
    stats = { streak: 0, focusSeconds: 0 };
    focusAboutToEnd();
    renderStage();
    advance(2500);
    expect(screen.getByRole('img', { name: '1-day streak' })).toBeInTheDocument();
  });

  it('speaks the language of the app', () => {
    focusAboutToEnd();
    renderStage('vi');
    advance(2500);
    expect(screen.getByText('+50 phút')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Chuỗi 4 ngày' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nghỉ ngay' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Để sau' })).toBeInTheDocument();
  });

  it('does not show when the phase was skipped, even past 50%', () => {
    useTimerStore.setState({ timeLeft: 600, lastSessionTimeLeft: 1500, settings: { ...settings, workDuration: 25 } });
    renderStage();

    fireEvent.click(screen.getByTitle('Skip session'));
    advance(3000);

    expect(mockRecord).toHaveBeenCalledWith(expect.objectContaining({ completedFullSession: false }));
    expect(dialog()).toBeNull();
    expect(useCelebrationStore.getState().pending).toBeNull();
  });

  it('does not show after a reset', () => {
    useTimerStore.setState({ timeLeft: 600, lastSessionTimeLeft: 1500, settings: { ...settings, workDuration: 25 } });
    renderStage();
    act(() => useTimerStore.getState().resetTimer());
    advance(3000);
    expect(useTimerStore.getState().timeLeft).toBe(25 * 60); // it did reset (the confirm dialog lives in EnhancedTimer)
    expect(useCelebrationStore.getState().pending).toBeNull();
    expect(dialog()).toBeNull();
  });

  it('does not show for a phase that ended while the app was closed', () => {
    useTimerStore.setState({ timeLeft: 0, isRunning: true, deadlineAt: NOW - 60_000 });
    renderStage();
    advance(1000);
    expect(dialog()).toBeNull();
  });

  it('does not show after a break ends', () => {
    useTimerStore.setState({ mode: 'shortBreak', timeLeft: 2, lastSessionTimeLeft: 300, isRunning: true, deadlineAt: NOW + 2000 });
    renderStage();
    advance(2500);
    expect(dialog()).toBeNull();
  });

  describe('with auto-start break on', () => {
    it('closes by itself after 5 seconds while the break keeps running', () => {
      focusAboutToEnd({ autoStartBreak: true });
      renderStage();
      advance(2500);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: true });

      advance(4000);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      advance(1100);
      expect(dialog()).toBeNull();
      expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: true });
    });

    it('the 5 seconds start when the tab is visible, not while it is hidden', () => {
      const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
      focusAboutToEnd({ autoStartBreak: true });
      renderStage();
      advance(2500);

      advance(60_000);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      visibility.mockReturnValue('visible');
      act(() => void document.dispatchEvent(new Event('visibilitychange')));
      advance(5100);
      expect(dialog()).toBeNull();
      visibility.mockRestore();
    });

    it('"Take a break" just closes: the break is already running', () => {
      focusAboutToEnd({ autoStartBreak: true });
      renderStage();
      advance(2500);
      fireEvent.click(screen.getByRole('button', { name: 'Take a break' }));
      expect(dialog()).toBeNull();
      expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: true });
    });
  });

  describe('with auto-start break off', () => {
    it('waits for the user, however long it takes', () => {
      focusAboutToEnd();
      renderStage();
      advance(2500);
      expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: false });

      advance(120_000);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('"Take a break" starts the break and closes', () => {
      focusAboutToEnd();
      renderStage();
      advance(2500);

      fireEvent.click(screen.getByRole('button', { name: 'Take a break' }));

      expect(dialog()).toBeNull();
      expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: true });
    });

    it('"Later" closes and leaves the break waiting', () => {
      focusAboutToEnd();
      renderStage();
      advance(2500);

      fireEvent.click(screen.getByRole('button', { name: 'Later' }));

      expect(dialog()).toBeNull();
      expect(useTimerStore.getState()).toMatchObject({ mode: 'shortBreak', isRunning: false });
    });

    it('Escape closes it too', () => {
      focusAboutToEnd();
      renderStage();
      advance(2500);
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(dialog()).toBeNull();
    });
  });

  it('reduced motion: no confetti', () => {
    reducedMotion = true;
    focusAboutToEnd();
    renderStage();
    advance(2500);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(confetti).not.toHaveBeenCalled();
  });

  it('leaves the existing alarm and notification to the engine: celebrating plays neither', async () => {
    const { playAlarm } = await import('@/lib/timer/alarm');
    const { notifyPhaseComplete } = await import('@/lib/timer/notifications');
    focusAboutToEnd();
    renderStage();
    advance(2500);
    expect(playAlarm).toHaveBeenCalledTimes(1);
    expect(notifyPhaseComplete).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(playAlarm).toHaveBeenCalledTimes(1);
    expect(notifyPhaseComplete).toHaveBeenCalledTimes(1);
  });
});
