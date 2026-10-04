import { SESSION_LIMIT_CODE } from '@/config/constants';
import { ensureSession, type SessionUser } from '@/lib/auth-client';
import { useAuthStore } from '@/stores/auth-store';
import type { TimerMode } from '@/stores/timer-store';

export interface SessionPayload {
  taskId: string | null;
  durationSec: number;
  mode: TimerMode;
  /**
   * The focus segment ran to its natural end (deadline reached): the only kind
   * that earns the task a pomodoro. Stop, task switch and skip leave it unset.
   */
  completedFullSession?: boolean;
  /** When the segment ended (epoch ms). Defaults to the moment it is recorded. */
  endedAt?: number;
  /**
   * Idempotency key chosen by the caller when the same segment can be recorded
   * from several windows at once (see `phaseSessionId`). Default: a random id.
   */
  clientSessionId?: string;
}

// Outbox: every session is written to the queue BEFORE it is sent and removed
// only once the server acknowledges it. A tab closing mid-request therefore
// leaves the item behind to be flushed next time (plus `keepalive` lets the
// request itself usually survive unload). The item id travels as
// `clientSessionId`: if the ack is lost the retry is recognised server-side
// and acknowledged without recording the session twice.
interface QueuedSession {
  id: string;
  payload: SessionPayload;
  /** null = queued while auth was still loading or the guest sign-in failed; stamped on first flush */
  userId: string | null;
  /** userId was a guest: re-homed when that guest signs in to a real account */
  guest?: boolean;
  queuedAt: number;
  attempts: number;
  /** set while a request is in flight so a concurrent flush skips the item */
  sendingAt?: number;
}

export type RecordResult = 'recorded' | 'queued' | 'dropped' | 'skipped';

const ENDPOINT = '/api/tasks/session-complete';
const QUEUE_KEY = 'session-record-queue';
const MAX_QUEUE = 20;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const SENDING_GRACE_MS = 30_000;
const MAX_DURATION_SEC = 4 * 60 * 60; // server rejects > 14400

// Sessions the outbox had to give up on (older than 24 h, or pushed out by a full
// queue) are announced once through this: the recorder has no UI, so a hook
// (use-outbox-drop-notice) subscribes and shows the toast.
type DropListener = (count: number) => void;
const dropListeners = new Set<DropListener>();
const NOTICE_COOLDOWN_MS = 10 * 60 * 1000;
let undelivered = 0;
let noticedAt = 0;

function notifyDropped(count: number) {
  // Nobody to tell yet (app still starting): hand it over when someone subscribes
  if (dropListeners.size === 0) {
    undelivered += count;
    return;
  }
  // A queue that stays full would otherwise toast on every session
  const now = Date.now();
  if (now - noticedAt < NOTICE_COOLDOWN_MS) return;
  noticedAt = now;
  dropListeners.forEach((listener) => listener(count));
}

/** Calls `listener` with how many sessions were just dropped as too old / over capacity. */
export function onSessionsDropped(listener: DropListener): () => void {
  dropListeners.add(listener);
  if (undelivered > 0) {
    const count = undelivered;
    undelivered = 0;
    notifyDropped(count);
  }
  return () => void dropListeners.delete(listener);
}

function newId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

function readQueue(): QueuedSession[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Synchronous read-modify-write of the queue. Never hold a snapshot across an
 * await: always go through this so items appended meanwhile (live records,
 * other tabs) are not lost.
 */
function updateQueue(fn: (queue: QueuedSession[]) => QueuedSession[]) {
  let dropped = 0;
  try {
    const wanted = fn(readQueue());
    const next = wanted
      .filter((q) => Date.now() - q.queuedAt < MAX_AGE_MS)
      .slice(-MAX_QUEUE);
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
    dropped = wanted.length - next.length;
  } catch {
    // Storage full/unavailable: lose the retry, not the app
  }
  if (dropped > 0) notifyDropped(dropped);
}

const patchItem = (id: string, patch: Partial<QueuedSession>) =>
  updateQueue((q) => q.map((i) => (i.id === id ? { ...i, ...patch } : i)));
const removeItem = (id: string) =>
  updateQueue((q) => q.filter((i) => i.id !== id));

/** Server expects an integer 1..14400; returns 0 if nothing worth sending. */
export function normalizeDuration(durationSec: number): number {
  if (!Number.isFinite(durationSec)) return 0;
  return Math.min(MAX_DURATION_SEC, Math.max(0, Math.round(durationSec)));
}

// ok: acknowledged. drop: permanent rejection (400 invalid, 429 daily cap).
// network: offline/aborted. server: anything else that is not an acknowledgement
// (5xx, 401 since a logged-in client may just have an expired token, and a 403 /
// 429 from a firewall in front of the app), retried a limited number of times.
type SendOutcome = 'ok' | 'drop' | 'network' | 'server';

/** Did the app itself answer 429 because of the daily cap (typed `code`), not a firewall or CDN? */
async function isDailyLimit(res: Response): Promise<boolean> {
  try {
    return ((await res.json()) as { code?: unknown } | null)?.code === SESSION_LIMIT_CODE;
  } catch {
    return false; // not JSON: not ours
  }
}

/** When the segment ended: its own end time, else when it was queued (items stored by older versions). */
function endTime({ payload, queuedAt }: QueuedSession): string {
  const ms = payload.endedAt ?? queuedAt;
  return new Date(Number.isFinite(ms) ? ms : queuedAt).toISOString();
}

async function send(item: QueuedSession): Promise<SendOutcome> {
  const { payload } = item;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: payload.taskId,
        durationSec: payload.durationSec,
        mode: payload.mode,
        completedFullSession: payload.completedFullSession === true,
        // The outbox id makes a retry (lost response, two tabs) idempotent
        clientSessionId: item.id,
        endedAt: endTime(item),
      }),
      keepalive: true, // let the request survive tab close / reload
    });
    if (res.ok) return 'ok';
    if (res.status === 400) return 'drop';
    if (res.status === 429 && (await isDailyLimit(res))) return 'drop';
    return 'server';
  } catch {
    return 'network';
  }
}

/** Applies a failed attempt to a queued item (counts attempts, drops at max). */
function markFailure(id: string, outcome: SendOutcome) {
  updateQueue((q) =>
    q.flatMap((i) => {
      if (i.id !== id) return [i];
      const attempts = outcome === 'server' ? i.attempts + 1 : i.attempts;
      if (attempts >= MAX_ATTEMPTS) return [];
      return [{ ...i, attempts, sendingAt: undefined }];
    }),
  );
}

// One guest sign-in at a time: sessions finishing together share it, so a guest
// never burns more than one of the per-IP sign-in allowance.
let guestSignIn: Promise<SessionUser | null> | null = null;

/** Creates (or finds) the session of a guest who has none yet; null on failure. */
function startGuestSession(): Promise<SessionUser | null> {
  guestSignIn ??= ensureSession()
    .catch(() => null)
    .finally(() => {
      guestSignIn = null;
    });
  return guestSignIn;
}

/**
 * Records a finished focus/break segment. A guest without a session gets an
 * anonymous one first; if that fails (rate limit, offline) the item stays in
 * the outbox with no owner and a later flush retries. While auth is still
 * loading the session is queued until a user is known. `onRecorded` runs only
 * after the server accepted the session.
 */
export async function recordSession(
  payload: SessionPayload,
  onRecorded?: () => void,
): Promise<RecordResult> {
  const durationSec = normalizeDuration(payload.durationSec);
  if (durationSec < 1) return 'skipped';

  const { user, isLoading } = useAuthStore.getState();
  const now = Date.now();
  const { clientSessionId, ...rest } = payload;
  const item: QueuedSession = {
    id: clientSessionId ?? newId(),
    payload: { ...rest, durationSec, endedAt: payload.endedAt ?? now },
    userId: user?.id ?? null,
    guest: user?.isAnonymous,
    queuedAt: now,
    attempts: 0,
    // Mark in flight right away so a concurrent flush cannot send it twice
    sendingAt: user || !isLoading ? now : undefined,
  };
  // Another window may have queued this very phase a moment ago (same caller id):
  // keep a single item; both windows still post, and the server drops the repeat.
  updateQueue((q) => (q.some((i) => i.id === item.id) ? q : [...q, item]));
  if (!user && isLoading) return 'queued'; // flushed once auth resolves

  if (!user) {
    const guest = await startGuestSession();
    if (!guest) {
      patchItem(item.id, { sendingAt: undefined });
      return 'queued';
    }
    patchItem(item.id, { userId: guest.id, guest: guest.isAnonymous, sendingAt: Date.now() });
  }

  const outcome = await send(item);
  if (outcome === 'ok') {
    removeItem(item.id);
    onRecorded?.();
    return 'recorded';
  }
  if (outcome === 'drop') {
    removeItem(item.id);
    return 'dropped';
  }
  markFailure(item.id, outcome);
  return 'queued';
}

let flushing = false;

type AuthSnapshot = { user: { id: string } | null; isLoading: boolean };

/**
 * When to retry the outbox after the auth store changes: a user appeared or
 * changed, or auth just resolved (a guest with nothing to sign in as needs a
 * retry of the guest sign-in that failed earlier).
 */
export function shouldFlushOnAuthChange(state: AuthSnapshot, prev: AuthSnapshot): boolean {
  const userChanged = Boolean(state.user) && state.user?.id !== prev.user?.id;
  const authResolved = prev.isLoading && !state.isLoading;
  return userChanged || authResolved;
}

async function flushLocked(onRecorded?: () => void) {
  let current: SessionUser | null = useAuthStore.getState().user;
  // A guest who finished sessions but never got a session (sign-in failed):
  // try again now. Only for items that really have no owner, so stale items
  // of other users never mint guest accounts.
  if (!current && readQueue().some((i) => i.userId === null)) {
    current = await startGuestSession();
  }
  if (!current) return;
  const { id: userId, isAnonymous } = current;

  // Items queued before auth resolved belong to whoever is logged in now. So do
  // a guest's items once that guest signed in to a real account (the guest's
  // data moved with them, so they must not be stranded under the old guest id).
  updateQueue((q) =>
    q.map((i) =>
      i.userId === null || (i.guest && !isAnonymous && i.userId !== userId)
        ? { ...i, userId, guest: isAnonymous }
        : i,
    ),
  );

  const candidates = readQueue().filter(
    (i) =>
      i.userId === userId &&
      !(i.sendingAt && Date.now() - i.sendingAt < SENDING_GRACE_MS),
  );

  let sent = false;
  for (const item of candidates) {
    patchItem(item.id, { sendingAt: Date.now() });
    const outcome = await send(item);
    if (outcome === 'ok') {
      removeItem(item.id);
      sent = true;
    } else if (outcome === 'drop') {
      removeItem(item.id);
    } else {
      markFailure(item.id, outcome);
      if (outcome === 'network') break; // offline: the rest would fail too
      // 5xx/401: skip this item and keep going so it cannot block the others
    }
  }
  if (sent) onRecorded?.();
}

/** Retries queued sessions of the current user (or guest). Safe to call often. */
export async function flushSessionQueue(onRecorded?: () => void) {
  if (flushing || typeof window === 'undefined') return;
  const { user, isLoading } = useAuthStore.getState();
  if (readQueue().length === 0 || (!user && isLoading)) return;
  flushing = true;
  try {
    // Prevent two tabs flushing the same queue (would duplicate sessions)
    const locks = (navigator as Navigator & { locks?: LockManager }).locks;
    if (locks) {
      await locks.request(
        'session-queue-flush',
        { ifAvailable: true },
        async (lock) => {
          if (lock) await flushLocked(onRecorded);
        },
      );
    } else {
      await flushLocked(onRecorded);
    }
  } finally {
    flushing = false;
  }
}
