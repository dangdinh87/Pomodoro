import { describe, expect, it } from 'vitest'
import { hasErrors, MESSAGE_MAX, retryAfterMinutes, validateFeedbackForm } from './feedback-form'

describe('validateFeedbackForm', () => {
  it('requires a non-blank message', () => {
    expect(validateFeedbackForm({ message: '   ', email: '' }).message).toBe('required')
  })
  it('rejects too long messages', () => {
    expect(validateFeedbackForm({ message: 'a'.repeat(MESSAGE_MAX + 1), email: '' }).message).toBe('tooLong')
  })
  it('accepts empty email but rejects malformed', () => {
    expect(hasErrors(validateFeedbackForm({ message: 'hi', email: '' }))).toBe(false)
    expect(validateFeedbackForm({ message: 'hi', email: 'nope' }).email).toBe('invalid')
    expect(hasErrors(validateFeedbackForm({ message: 'hi', email: 'a@b.co' }))).toBe(false)
  })
})

describe('retryAfterMinutes', () => {
  it('rounds up and falls back', () => {
    expect(retryAfterMinutes('61')).toBe(2)
    expect(retryAfterMinutes('5')).toBe(1)
    expect(retryAfterMinutes(null)).toBe(10)
  })
})
