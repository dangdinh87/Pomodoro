import { useTimerStore } from '@/stores/timer-store';
import { pendingFocusSeconds, recordPendingFocus } from './partial-segment';

describe('partial focus segment', () => {
  beforeEach(() => {
    useTimerStore.setState({ mode: 'work', timeLeft: 600, lastSessionTimeLeft: 1500 });
  });

  it('is the focus time since the last recorded segment', () => {
    expect(pendingFocusSeconds()).toBe(900);
  });

  it('never counts breaks or negative values', () => {
    useTimerStore.setState({ mode: 'shortBreak', timeLeft: 100, lastSessionTimeLeft: 300 });
    expect(pendingFocusSeconds()).toBe(0);
    useTimerStore.setState({ mode: 'work', timeLeft: 1600, lastSessionTimeLeft: 1500 });
    expect(pendingFocusSeconds()).toBe(0);
  });

  it('records it as a partial segment (time counts, no pomodoro)', () => {
    const record = vi.fn();
    expect(recordPendingFocus('task-1', record)).toBe(true);
    expect(record).toHaveBeenCalledWith({
      taskId: 'task-1',
      durationSec: 900,
      mode: 'work',
      completedFullSession: false,
    });
  });

  it('records nothing when there is nothing pending', () => {
    useTimerStore.setState({ timeLeft: 1500, lastSessionTimeLeft: 1500 });
    const record = vi.fn();
    expect(recordPendingFocus(null, record)).toBe(false);
    expect(record).not.toHaveBeenCalled();
  });
});
