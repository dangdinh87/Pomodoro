import { useTasksStore } from '@/stores/task-store';
import { useTimerStore } from '@/stores/timer-store';
import { switchActiveTask } from './switch-active-task';

const record = vi.fn();
const active = () => useTasksStore.getState().activeTaskId;
const baseline = () => useTimerStore.getState().lastSessionTimeLeft;

describe('switchActiveTask', () => {
  beforeEach(() => {
    record.mockReset();
    useTasksStore.setState({ activeTaskId: 'A' } as never);
    useTimerStore.setState({
      mode: 'work',
      timeLeft: 900, // 10 of 25 minutes focused since the baseline
      lastSessionTimeLeft: 1500,
    });
  });

  it('records the running segment for the old task, then switches', () => {
    let activeWhenRecorded: string | null = null;
    record.mockImplementation(() => {
      activeWhenRecorded = active();
    });

    switchActiveTask('B', record);

    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith({
      taskId: 'A',
      durationSec: 600,
      mode: 'work',
      completedFullSession: false, // a partial segment never earns a pomodoro
    });
    expect(activeWhenRecorded).toBe('A'); // recorded before the switch
    expect(active()).toBe('B');
  });

  it('restarts the baseline so the time is not counted again for the new task', () => {
    switchActiveTask('B', record);
    expect(baseline()).toBe(900);
  });

  it('records the segment when the task is cleared (stop, done, delete)', () => {
    switchActiveTask(null, record);
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ taskId: 'A', durationSec: 600 }));
    expect(active()).toBeNull();
    expect(baseline()).toBe(900);
  });

  it('does not invent a segment when no task was active: that time follows the next task', () => {
    useTasksStore.setState({ activeTaskId: null } as never);
    switchActiveTask('B', record);
    expect(record).not.toHaveBeenCalled();
    expect(baseline()).toBe(1500);
    expect(active()).toBe('B');
  });

  it('is a no-op when re-selecting the active task', () => {
    switchActiveTask('A', record);
    expect(record).not.toHaveBeenCalled();
    expect(baseline()).toBe(1500);
    expect(active()).toBe('A');
  });

  it('records nothing during a break but still switches', () => {
    useTimerStore.setState({ mode: 'shortBreak', timeLeft: 100, lastSessionTimeLeft: 300 });
    switchActiveTask('B', record);
    expect(record).not.toHaveBeenCalled();
    expect(baseline()).toBe(300);
    expect(active()).toBe('B');
  });

  it('skips the record when nothing was focused yet', () => {
    useTimerStore.setState({ timeLeft: 1500 });
    switchActiveTask('B', record);
    expect(record).not.toHaveBeenCalled();
    expect(active()).toBe('B');
  });
});
