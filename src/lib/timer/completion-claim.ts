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
 * Id under which every window records the natural end of the same phase. The
 * claim below is check-then-write on localStorage, which two windows (separate
 * processes) can both win in the same few milliseconds; with one id per phase
 * the server's unique `(user_id, client_session_id)` turns that second record
 * into a no-op instead of a double session. Undefined without a usable deadline
 * (the recorder then makes a random id). Fits the server's `[A-Za-z0-9_-]{8,64}`.
 * No user id in it: the server scopes the constraint per user already, and the
 * user may still be unknown (auth loading) in one window and not in the other.
 */
export function phaseSessionId(mode: string, deadlineAt: number | null): string | undefined {
  return deadlineAt !== null && Number.isFinite(deadlineAt) ? `${mode}_${deadlineAt}` : undefined;
}

/**
 * One-shot: returns true only for the very first claim of `key`. Check-then-
 * write on localStorage is not atomic across windows, so this only spares the
 * common case (alarm / phase advance done once); correctness of the recorded
 * session rests on `phaseSessionId`, not on this claim.
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
