// Every open tab runs the timer engine on the same persisted state. Only the
// first claimant of a completion may record the session / play the alarm /
// advance the phase; everyone else (other tabs, and the same tab re-entering
// with stale state, e.g. StrictMode double effects) gets `false`.

const CLAIM_KEY = 'timer-completion-claim';
const ALARM_CLAIM_KEY = 'timer-alarm-claim';

/** Unique per tab so a claim can be attributed to its owner when debugging. */
const TAB_ID = Math.random().toString(36).slice(2);

/** Fallback when storage is unavailable: still one-shot within this tab. */
const claimedLocally = new Set<string>();
const alarmClaimedLocally = new Set<string>();

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
  return claimOnce(CLAIM_KEY, claimedLocally, key);
}

/**
 * One-shot claim of the bell (alarm + system notification) for a phase end, shared by the engine
 * (app page) and the deadline watcher (content pages, where no engine runs), so that one tab rings
 * once even when one window is on /guide and another on the app. Separate from the completion
 * claim on purpose: ringing on /guide must leave the completion to the engine, which records the
 * session when the user comes back.
 */
export function claimAlarm(key: string): boolean {
  return claimOnce(ALARM_CLAIM_KEY, alarmClaimedLocally, key);
}

function claimOnce(storageKey: string, local: Set<string>, key: string): boolean {
  if (local.has(key)) return false;
  local.add(key);
  if (local.size > 50) {
    local.delete(local.values().next().value as string);
  }
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing && existing.split('|')[0] === key) return false;
    window.localStorage.setItem(storageKey, `${key}|${TAB_ID}`);
    return true;
  } catch {
    return true;
  }
}
