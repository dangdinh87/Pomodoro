import type { TimerMode } from '@/stores/timer-store';

/**
 * Phases in a row without any user activity after which the timer stops
 * chaining on its own: one focus + one break is a whole unattended cycle.
 */
export const MAX_IDLE_PHASES = 2;

/**
 * Whether the app may start the phase after `finished` by itself (on top of the
 * user's autoStartBreak / autoStartWork settings). A long break always ends the
 * chain, and so does an unattended cycle; the timer then waits on the start screen.
 */
export function mayAutoChain(finished: TimerMode, idlePhases: number): boolean {
  return finished !== 'longBreak' && idlePhases < MAX_IDLE_PHASES;
}
