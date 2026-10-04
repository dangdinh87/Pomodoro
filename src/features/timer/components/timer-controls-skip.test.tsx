import { render, screen, fireEvent } from '@testing-library/react';
import { useTimerStore } from '@/stores/timer-store';
import { useTasksStore } from '@/stores/task-store';
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
vi.mock('@/hooks/use-confetti', () => ({ useConfetti: () => ({ fireWorkComplete: vi.fn() }) }));

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
});
