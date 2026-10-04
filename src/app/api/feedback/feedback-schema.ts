import { FEEDBACK_TYPES as feedbackTypes } from '@/db/schema'

export type FeedbackType = (typeof feedbackTypes)[number]

export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000
const NAME_MAX_LENGTH = 100
// RFC 5321 practical limit for an email address
const EMAIL_MAX_LENGTH = 254
// Pragmatic shape check (something@something.tld); deliverability is not verified
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface FeedbackPayload {
  type: FeedbackType
  message: string
  rating: number | null
  name: string | null
  email: string | null
}

type ValidationResult =
  | { success: true; data: FeedbackPayload }
  | { success: false; error: string }

/** Optional free-text field: trimmed, empty → null, non-string or too long → error. */
function parseOptionalText(value: unknown, maxLength: number): string | null | false {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length > maxLength ? false : trimmed
}

export function validateFeedback(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { success: false, error: 'Request body must be an object' }
  }

  const { type, message, rating, name, email } = body as Record<string, unknown>

  if (typeof message !== 'string' || !message.trim()) {
    return { success: false, error: 'Message is required' }
  }
  if (message.trim().length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    return {
      success: false,
      error: `Message must be at most ${FEEDBACK_MESSAGE_MAX_LENGTH} characters`,
    }
  }

  if (typeof type !== 'string' || !feedbackTypes.includes(type as FeedbackType)) {
    return { success: false, error: 'Invalid feedback type' }
  }

  let parsedRating: number | null = null
  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' }
    }
    parsedRating = rating
  }

  const parsedName = parseOptionalText(name, NAME_MAX_LENGTH)
  if (parsedName === false) {
    return { success: false, error: `Name must be at most ${NAME_MAX_LENGTH} characters` }
  }

  const parsedEmail = parseOptionalText(email, EMAIL_MAX_LENGTH)
  if (parsedEmail === false || (parsedEmail !== null && !EMAIL_PATTERN.test(parsedEmail))) {
    return { success: false, error: 'Email is invalid' }
  }

  return {
    success: true,
    data: {
      type: type as FeedbackType,
      message: message.trim(),
      rating: parsedRating,
      name: parsedName,
      email: parsedEmail,
    },
  }
}
