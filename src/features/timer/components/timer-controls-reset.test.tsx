import { render, screen, fireEvent } from '@testing-library/react';
import { useTimerStore } from '@/stores/timer-store';
import { useResetDialogStore } from '../lib/request-reset';
import { TimerControls } from './timer-controls';

vi.mock('@/contexts/i18n-context', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/lib/timer/use-session-recorder', () => ({
  useSessionRecorder: () => ({ record: vi.fn(), flush: vi.fn() }),
}));
vi.mock('@/lib/timer/alarm', () => ({ playAlarm: vi.fn() }));
vi.mock('@/lib/timer/notifications', () => ({ requestNotificationPermission: vi.fn() }));

describe('TimerControls reset button', () => {
  beforeEach(() => {
    useResetDialogStore.setState({ open: false, mode: null });
    useTimerStore.setState({
      mode: 'work',
      timeLeft: 600,
      lastSessionTimeLeft: 1500,
      isRunning: false,
      deadlineAt: null,
    });
  });

  it('asks for confirmation when the session has progress', () => {
    render(<TimerControls />);
    fireEvent.click(screen.getByRole('button', { name: 'timer.controls.aria.reset' }));
    expect(useResetDialogStore.getState().open).toBe(true);
    expect(useTimerStore.getState().timeLeft).toBe(600);
  });

  it('resets straight away on a fresh timer', () => {
    useTimerStore.setState({ timeLeft: 1500, lastSessionTimeLeft: 1500 });
    render(<TimerControls />);
    fireEvent.click(screen.getByRole('button', { name: 'timer.controls.aria.reset' }));
    expect(useResetDialogStore.getState().open).toBe(false);
  });
});

describe('TimerControls skip chain', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useTimerStore.setState({
      mode: 'longBreak',
      timeLeft: 600,
      lastSessionTimeLeft: 900,
      isRunning: false,
      deadlineAt: null,
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreak: true,
        autoStartWork: true,
        clockType: 'digital',
        clockSize: 'medium',
        lowTimeWarningEnabled: true,
        keepScreenOn: false,
      },
    });
  });
  afterEach(() => vi.useRealTimers());

  it('skipping a long break leaves the next focus waiting even with autoStartWork on', () => {
    render(<TimerControls />);
    fireEvent.click(screen.getByTitle('timer.controls.skip_hint'));
    vi.advanceTimersByTime(100);
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: false });
  });

  it('skipping a short break still auto-starts the focus when autoStartWork is on', () => {
    useTimerStore.setState({ mode: 'shortBreak', timeLeft: 100, lastSessionTimeLeft: 300 });
    render(<TimerControls />);
    fireEvent.click(screen.getByTitle('timer.controls.skip_hint'));
    vi.advanceTimersByTime(100);
    expect(useTimerStore.getState()).toMatchObject({ mode: 'work', isRunning: true });
  });
});
