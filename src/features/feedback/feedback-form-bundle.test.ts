import { describe, expect, it, vi } from 'vitest'

// The form runs in the browser. Anything it imports ships in the feedback panel's chunk, so it must
// not reach the database schema (drizzle's pg-core and every table definition).
vi.mock('drizzle-orm/pg-core', () => {
  throw new Error('drizzle-orm/pg-core was loaded by the browser feedback form')
})

describe('feedback form imports', () => {
  it('does not pull in the database schema', async () => {
    const form = await import('./feedback-form')
    expect(form.MESSAGE_MAX).toBe(2000)
  })
})
