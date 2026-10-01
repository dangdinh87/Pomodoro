// Every open tab runs the timer engine on the same persisted state. Only the
// first claimant of a completion may record the session / play the alarm /
// advance the phase; everyone else (other tabs, and the same tab re-entering
// with stale state, e.g. StrictMode double effects) gets `false`.

const CLAIM_KEY = 'timer-completion-claim';

/** Unique per tab so a claim can be attributed to its owner when debugging. */
const TAB_ID = Math.random().toString(36).slice(2);

/** Fallback when storage is unavailable: still one-shot within this tab. */
const claimedLocally = new Set<string>();

export function completionKey(mode: string, deadlineAt: number | null) {
  // A missing deadline must never collide with a later completion
  return `${mode}:${deadlineAt ?? `none-${Date.now()}`}`;
}

/**
 * One-shot: returns true only for the very first claim of `key`. Check-then-
 * write on localStorage is not strictly atomic, but the window is a few
 * microseconds and the server caps daily totals anyway.
 */
export function claimCompletion(key: string): boolean {
  if (claimedLocally.has(key)) return false;
  claimedLocally.add(key);
  if (claimedLocally.size > 50) {
    claimedLocally.delete(claimedLocally.values().next().value as string);
  }
  try {
    const existing = window.localStorage.getItem(CLAIM_KEY);
    if (existing && existing.split('|')[0] === key) return false;
    window.localStorage.setItem(CLAIM_KEY, `${key}|${TAB_ID}`);
    return true;
  } catch {
    return true;
  }
}
