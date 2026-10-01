import { useAuthStore } from '@/stores/auth-store';
import type { TimerMode } from '@/stores/timer-store';

export interface SessionPayload {
  taskId: string | null;
  durationSec: number;
  mode: TimerMode;
}

// Outbox: every session is written to the queue BEFORE it is sent and removed
// only once the server acknowledges it. A tab closing mid-request therefore
// leaves the item behind to be flushed next time (plus `keepalive` lets the
// request itself usually survive unload). Server-side idempotency is still
// needed to fully rule out a duplicate when the ack is lost.
interface QueuedSession {
  id: string;
  payload: SessionPayload;
  /** null = queued while auth was still loading; stamped on first flush */
  userId: string | null;
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
  try {
    const next = fn(readQueue())
      .filter((q) => Date.now() - q.queuedAt < MAX_AGE_MS)
      .slice(-MAX_QUEUE);
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
  } catch {
    // Storage full/unavailable: lose the retry, not the app
  }
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
// network: offline/aborted. server: 5xx or 401 (a logged-in client may just
// have an expired token), retried a limited number of times.
type SendOutcome = 'ok' | 'drop' | 'network' | 'server';

async function send(payload: SessionPayload): Promise<SendOutcome> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // let the request survive tab close / reload
    });
    if (res.ok) return 'ok';
    return res.status >= 500 || res.status === 401 ? 'server' : 'drop';
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

/**
 * Records a finished focus/break segment. Guests are skipped; if auth is
 * still loading the session is queued until a user is known. `onRecorded`
 * runs only after the server accepted the session.
 */
export async function recordSession(
  payload: SessionPayload,
  onRecorded?: () => void,
): Promise<RecordResult> {
  const durationSec = normalizeDuration(payload.durationSec);
  if (durationSec < 1) return 'skipped';

  const { user, isLoading } = useAuthStore.getState();
  if (!user && !isLoading) return 'skipped';

  const item: QueuedSession = {
    id: newId(),
    payload: { ...payload, durationSec },
    userId: user?.id ?? null,
    queuedAt: Date.now(),
    attempts: 0,
    sendingAt: user ? Date.now() : undefined,
  };
  updateQueue((q) => [...q, item]);
  if (!user) return 'queued'; // flushed once auth resolves

  const outcome = await send(item.payload);
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

async function flushLocked(userId: string, onRecorded?: () => void) {
  // Items queued before auth resolved belong to whoever is logged in now
  updateQueue((q) =>
    q.map((i) => (i.userId === null ? { ...i, userId } : i)),
  );

  const candidates = readQueue().filter(
    (i) =>
      i.userId === userId &&
      !(i.sendingAt && Date.now() - i.sendingAt < SENDING_GRACE_MS),
  );

  let sent = false;
  for (const item of candidates) {
    patchItem(item.id, { sendingAt: Date.now() });
    const outcome = await send(item.payload);
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

/** Retries queued sessions of the current user. Safe to call often. */
export async function flushSessionQueue(onRecorded?: () => void) {
  if (flushing || typeof window === 'undefined') return;
  const user = useAuthStore.getState().user;
  if (!user || readQueue().length === 0) return;
  flushing = true;
  try {
    // Prevent two tabs flushing the same queue (would duplicate sessions)
    const locks = (navigator as Navigator & { locks?: LockManager }).locks;
    if (locks) {
      await locks.request(
        'session-queue-flush',
        { ifAvailable: true },
        async (lock) => {
          if (lock) await flushLocked(user.id, onRecorded);
        },
      );
    } else {
      await flushLocked(user.id, onRecorded);
    }
  } finally {
    flushing = false;
  }
}
