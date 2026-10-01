import { FEEDBACK_MESSAGE_MAX_LENGTH } from '@/app/api/feedback/feedback-schema'

export const MESSAGE_MAX = FEEDBACK_MESSAGE_MAX_LENGTH
// Mirrors the server check so the form never sends what the API would reject.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type FeedbackFormErrors = { message?: 'required' | 'tooLong'; email?: 'invalid' }

export function validateFeedbackForm(input: { message: string; email: string }): FeedbackFormErrors {
  const errors: FeedbackFormErrors = {}
  const message = input.message.trim()
  if (!message) errors.message = 'required'
  else if (message.length > MESSAGE_MAX) errors.message = 'tooLong'
  const email = input.email.trim()
  if (email && !EMAIL_PATTERN.test(email)) errors.email = 'invalid'
  return errors
}

export const hasErrors = (errors: FeedbackFormErrors) => Object.keys(errors).length > 0

/** Whole minutes to wait, from a Retry-After header in seconds; at least 1. */
export function retryAfterMinutes(header: string | null): number {
  const seconds = Number(header)
  return Number.isFinite(seconds) && seconds > 0 ? Math.max(1, Math.ceil(seconds / 60)) : 10
}
