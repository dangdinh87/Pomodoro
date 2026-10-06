/** Client-safe half of the per-account task limit (the server half, with the database count, is task-limit.ts). */
export const MAX_TASKS_PER_USER = 2000;
export const TASK_LIMIT_CODE = 'TASK_LIMIT_REACHED';

/** Thrown by task helpers when the API answered HTTP 409 `TASK_LIMIT_REACHED`, so the UI can show a specific message. */
export class TaskLimitError extends Error {
  constructor(readonly max: number = MAX_TASKS_PER_USER) {
    super('Task limit reached');
    this.name = 'TaskLimitError';
  }
}

/** The error for a 409 response body (`{ code, max }`), or null when the 409 is about something else. */
export function taskLimitErrorFrom(body: unknown): TaskLimitError | null {
  if (!body || typeof body !== 'object' || (body as { code?: unknown }).code !== TASK_LIMIT_CODE) return null;
  const max = (body as { max?: unknown }).max;
  return new TaskLimitError(typeof max === 'number' ? max : undefined);
}
