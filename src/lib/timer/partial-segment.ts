import { useTimerStore } from '@/stores/timer-store';
import type { SessionPayload } from './session-recorder';

type Recorder = (payload: SessionPayload) => unknown;

/**
 * Focus seconds since the last recorded segment of the running phase: what would
 * be lost if the timer were thrown away now. Breaks are never counted.
 */
export function pendingFocusSeconds(): number {
  const { mode, timeLeft, lastSessionTimeLeft } = useTimerStore.getState();
  if (mode !== 'work') return 0;
  return Math.max(0, lastSessionTimeLeft - timeLeft);
}

/**
 * Records the pending focus segment for `taskId` as a partial one: the time
 * counts towards the task and stats, but it never earns a pomodoro. Returns
 * whether anything was recorded.
 */
export function recordPendingFocus(taskId: string | null, record: Recorder): boolean {
  const durationSec = pendingFocusSeconds();
  if (durationSec < 1) return false;
  void record({ taskId, durationSec, mode: 'work', completedFullSession: false });
  return true;
}
