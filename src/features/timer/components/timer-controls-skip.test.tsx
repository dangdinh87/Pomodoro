import { act, render, screen, fireEvent } from '@testing-library/react';
import confetti from 'canvas-confetti';
import { useTimerStore } from '@/stores/timer-store';
import { useTasksStore } from '@/stores/task-store';
import { requestTimerSkip } from '../lib/request-skip';
import { TimerControls } from './timer-controls';

const mockRecord = vi.fn();

vi.mock('@/contexts/i18n-context', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/lib/timer/use-session-recorder', () => ({
  useSessionRecorder: () => ({ record: mockRecord, flush: vi.fn() }),
}));
vi.mock('@/lib/timer/alarm', () => ({ playAlarm: vi.fn() }));
vi.mock('@/lib/timer/notifications', () => ({ requestNotificationPermission: vi.fn() }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

describe('TimerControls skip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTasksStore.setState({ activeTaskId: 'task-1' } as never);
    useTimerStore.setState({
      mode: 'work',
      timeLeft: 600, // 15 of 25 minutes done
      lastSessionTimeLeft: 1500,
      isRunning: false,
      deadlineAt: null,
      sessionCount: 0,
    });
  });

  it('records the focused time but never earns a pomodoro (not a natural end)', () => {
    render(<TimerControls />);
    fireEvent.click(screen.getByTitle('timer.controls.skip_hint'));

    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith({
      taskId: 'task-1',
      durationSec: 900,
      mode: 'work',
      completedFullSession: false,
    });
  });

  it('does not fire confetti on a skip: only SessionCelebration celebrates, and only a natural end', () => {
    render(<TimerControls />);
    fireEvent.click(screen.getByTitle('timer.controls.skip_hint'));

    expect(confetti).not.toHaveBeenCalled();
  });

  it('requestTimerSkip (the command palette) skips exactly like the button: records, never earns a pomodoro', () => {
    render(<TimerControls />);
    act(() => {
      expect(requestTimerSkip()).toBe(true);
    });

    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith({
      taskId: 'task-1',
      durationSec: 900,
      mode: 'work',
      completedFullSession: false,
    });
  });

  it('requestTimerSkip on a running timer asks first and records only after confirming', () => {
    useTimerStore.setState({ isRunning: true, deadlineAt: Date.now() + 600_000 });
    render(<TimerControls />);
    act(() => {
      requestTimerSkip();
    });

    expect(screen.getByText('timer.skip_confirm.title')).toBeInTheDocument();
    expect(mockRecord).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('timer.skip_confirm.confirm'));
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('closes the confirmation when the phase ends by itself, so a late Confirm cannot skip the next phase', () => {
    useTimerStore.setState({ isRunning: true, deadlineAt: Date.now() + 600_000 });
    render(<TimerControls />);
    act(() => {
      requestTimerSkip();
    });
    expect(screen.getByText('timer.skip_confirm.title')).toBeInTheDocument();

    // what the engine does at the deadline: next phase, timeLeft is the full break (never 0)
    act(() => {
      useTimerStore.setState({ mode: 'shortBreak', timeLeft: 300, lastSessionTimeLeft: 300, isRunning: false, deadlineAt: null });
    });

    expect(screen.queryByText('timer.skip_confirm.title')).not.toBeInTheDocument();
    expect(mockRecord).not.toHaveBeenCalled();
    expect(useTimerStore.getState().mode).toBe('shortBreak');
  });

  it('keeps the confirmation open while the same phase simply keeps counting down', () => {
    useTimerStore.setState({ isRunning: true, deadlineAt: Date.now() + 600_000 });
    render(<TimerControls />);
    act(() => {
      requestTimerSkip();
    });
    act(() => {
      useTimerStore.setState({ timeLeft: 599 });
    });
    expect(screen.getByText('timer.skip_confirm.title')).toBeInTheDocument();
  });

  it('stops answering once the controls unmount', () => {
    const { unmount } = render(<TimerControls />);
    unmount();
    expect(requestTimerSkip()).toBe(false);
    expect(mockRecord).not.toHaveBeenCalled();
  });
});
