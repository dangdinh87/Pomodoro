import type { TimerMode } from '@/stores/timer-store';

/** localStorage key of the persisted timer store (zustand `persist` name). */
export const TIMER_STORAGE_KEY = 'timer-storage';

/**
 * How late a phase may have finished (tab closed/crashed/reloaded, laptop asleep) and still count
 * as a real session. Within this window the engine records it as if it had just completed; beyond
 * it the timer silently moves to the next phase without crediting a session, so reopening the app
 * days later cannot mint sessions or streak days. The deadline watcher rings within it only.
 */
export const CATCH_UP_GRACE_MS = 15 * 60 * 1000;

export interface RunningPhase {
  mode: TimerMode;
  /** When the phase ends (ms since epoch). */
  deadlineAt: number;
}

const MODES: readonly string[] = ['work', 'shortBreak', 'longBreak'];

/**
 * The phase that is counting down, straight from storage, or null when the timer is paused,
 * stopped or unreadable. For pages that must not load the timer store (and zustand) just to know
 * when the bell is due.
 */
export function readRunningPhase(storage: Pick<Storage, 'getItem'> = window.localStorage): RunningPhase | null {
  try {
    const state = JSON.parse(storage.getItem(TIMER_STORAGE_KEY) ?? 'null')?.state;
    if (!state?.isRunning || !MODES.includes(state.mode)) return null;
    const { deadlineAt } = state;
    return typeof deadlineAt === 'number' && Number.isFinite(deadlineAt) ? { mode: state.mode, deadlineAt } : null;
  } catch {
    return null;
  }
}
