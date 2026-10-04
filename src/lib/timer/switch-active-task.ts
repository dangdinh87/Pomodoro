import { useTasksStore } from '@/stores/task-store';
import { useTimerStore } from '@/stores/timer-store';
import type { SessionPayload } from './session-recorder';

type Recorder = (payload: SessionPayload) => unknown;

/**
 * The one way to change (or clear) the active task while a timer may be running.
 *
 * The focus time since the last recorded segment belongs to the task that was
 * active, so it is recorded for that task first (a partial segment: time counts,
 * no pomodoro) and the baseline restarts. Without an active task nothing is
 * recorded: that time simply counts towards the task chosen next, as part of the
 * same pomodoro.
 */
export function switchActiveTask(nextTaskId: string | null, record: Recorder) {
  const { activeTaskId, setActiveTask } = useTasksStore.getState();
  if (activeTaskId === nextTaskId) return;

  if (activeTaskId) {
    const { mode, timeLeft, lastSessionTimeLeft, setLastSessionTimeLeft } =
      useTimerStore.getState();
    if (mode === 'work') {
      const durationSec = Math.max(0, lastSessionTimeLeft - timeLeft);
      if (durationSec > 0) {
        void record({
          taskId: activeTaskId,
          durationSec,
          mode: 'work',
          completedFullSession: false,
        });
      }
      setLastSessionTimeLeft(timeLeft);
    }
  }
  setActiveTask(nextTaskId);
}
