import { create } from 'zustand';

/** A focus session that just ran to its natural end and has not been acknowledged yet. */
export interface Celebration {
  /** Distinct per session, so a second celebration re-triggers confetti and the auto-close timer. */
  id: number;
  /** Length of the phase that just ended, in minutes. */
  minutes: number;
  /** When it ended (ms): picks the day's variant of the title. */
  at: number;
}

interface CelebrationState {
  pending: Celebration | null;
  dismiss: () => void;
}

let nextId = 1;

/** Not persisted: a reload mid-celebration just drops it. */
export const useCelebrationStore = create<CelebrationState>(() => ({
  pending: null,
  dismiss: () => useCelebrationStore.setState({ pending: null }),
}));

/**
 * Called by the timer engine when (and only when) a focus phase reaches its deadline on its own.
 * Skip, stop, reset and phases that ended while the app was closed never call it.
 */
export function announceFocusComplete(minutes: number) {
  useCelebrationStore.setState({ pending: { id: nextId++, minutes: Math.max(1, Math.round(minutes)), at: Date.now() } });
}
