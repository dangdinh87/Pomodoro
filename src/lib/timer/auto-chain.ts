import type { TimerMode } from '@/stores/timer-store';

/**
 * Whether the app may start the phase after `finished` by itself (on top of the
 * user's autoStartBreak / autoStartWork settings).
 *
 * - A long break always ends the chain.
 * - A focus session always rolls into its break.
 * - A break rolls into the next focus only if somebody touched the page since the
 *   previous focus began. One focus + break nobody attended is a whole idle cycle:
 *   the timer then waits on the start screen and records nothing more.
 */
export function mayAutoChain(finished: TimerMode, attendedSinceFocusStart: boolean): boolean {
  if (finished === 'longBreak') return false;
  return finished === 'work' || attendedSinceFocusStart;
}
