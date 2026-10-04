import { SESSION_MAX_DURATION_SEC } from '@/config/constants'
import { isUuid } from '../task-schemas'

const sessionModes = ['work', 'shortBreak', 'longBreak'] as const

// Accepted window for a client-reported end time: an offline session may be
// uploaded days later, and a few minutes of clock skew must not lose one.
const END_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const END_MAX_FUTURE_MS = 5 * 60 * 1000

// A UUID, or the fallback id the client mints without crypto.randomUUID
const CLIENT_SESSION_ID = /^[A-Za-z0-9_-]{8,64}$/

export type SessionMode = (typeof sessionModes)[number]

export interface SessionCompletionPayload {
  taskId: string | null
  durationSec: number
  mode: SessionMode
  /**
   * The focus segment ran to its natural end, so it earns the task a pomodoro.
   * Partial segments (stop, task switch, skip) only add time.
   */
  completedFullSession: boolean
  /** Client-minted id making a retried POST idempotent; null when absent or malformed. */
  clientSessionId: string | null
  /** When the client says the session ended; null when absent or unparseable. */
  endedAt: Date | null
}

type ValidationResult =
  | { success: true; data: SessionCompletionPayload }
  | { success: false; error: string }

/**
 * Validates a finished (or partially finished) timer session sent by the client.
 * Durations feed streaks and stats, so they are bounded here.
 * An unknown/invalid taskId is not an error: the session is recorded without a task.
 */
export function validateSessionCompletion(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { success: false, error: 'Request body must be an object' }
  }

  const { taskId, durationSec, mode, completedFullSession, clientSessionId, endedAt } = body as Record<
    string,
    unknown
  >

  if (typeof mode !== 'string' || !sessionModes.includes(mode as SessionMode)) {
    return { success: false, error: 'Invalid session mode' }
  }

  if (typeof durationSec !== 'number' || !Number.isFinite(durationSec)) {
    return { success: false, error: 'durationSec must be a number' }
  }

  if (completedFullSession !== undefined && typeof completedFullSession !== 'boolean') {
    return { success: false, error: 'completedFullSession must be a boolean' }
  }

  const roundedDuration = Math.round(durationSec)
  if (roundedDuration < 1 || roundedDuration > SESSION_MAX_DURATION_SEC) {
    return {
      success: false,
      error: `durationSec must be between 1 and ${SESSION_MAX_DURATION_SEC}`,
    }
  }

  return {
    success: true,
    data: {
      taskId: isUuid(taskId) ? taskId : null,
      durationSec: roundedDuration,
      mode: mode as SessionMode,
      completedFullSession: completedFullSession === true,
      clientSessionId:
        typeof clientSessionId === 'string' && CLIENT_SESSION_ID.test(clientSessionId)
          ? clientSessionId
          : null,
      endedAt: parseDate(endedAt),
    },
  }
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * The timestamp stored for a session: the client's end time when it is within
 * [now - 7 days, now + 5 minutes], otherwise (missing, garbage, a skewed clock,
 * or a replayed ancient session) the moment the server received it.
 */
export function resolveSessionEnd(endedAt: Date | null, now: number): Date {
  if (!endedAt) return new Date(now)
  const t = endedAt.getTime()
  return t >= now - END_MAX_AGE_MS && t <= now + END_MAX_FUTURE_MS ? endedAt : new Date(now)
}
