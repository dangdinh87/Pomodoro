import { SESSION_MAX_DURATION_SEC } from '@/config/constants'
import { isUuid } from '../task-schemas'

const sessionModes = ['work', 'shortBreak', 'longBreak'] as const

export type SessionMode = (typeof sessionModes)[number]

export interface SessionCompletionPayload {
  taskId: string | null
  durationSec: number
  mode: SessionMode
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

  const { taskId, durationSec, mode } = body as Record<string, unknown>

  if (typeof mode !== 'string' || !sessionModes.includes(mode as SessionMode)) {
    return { success: false, error: 'Invalid session mode' }
  }

  if (typeof durationSec !== 'number' || !Number.isFinite(durationSec)) {
    return { success: false, error: 'durationSec must be a number' }
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
    },
  }
}
