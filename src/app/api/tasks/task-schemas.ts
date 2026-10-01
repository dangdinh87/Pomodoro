const priorityValues = ['LOW', 'MEDIUM', 'HIGH'] as const
const statusValues = ['TODO', 'DOING', 'DONE'] as const

export type TaskPriorityDb = (typeof priorityValues)[number]
export type TaskStatusDb = (typeof statusValues)[number]

export interface CreateTaskPayload {
  title: string
  description: string | null
  priority: TaskPriorityDb
  estimate_pomodoros: number
  tags: string[]
  due_date?: string | null
  is_template?: boolean
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  status?: TaskStatusDb
  display_order?: number
}

interface ValidationErrorDetail {
  message: string
  details?: Record<string, string[]>
}

interface ValidationSuccess<T> {
  success: true
  data: T
}

interface ValidationFailure {
  success: false
  error: ValidationErrorDetail
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

const isObject = (value: unknown): value is Record<string, any> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_PATTERN.test(value)

const isValidDateString = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value))

// Validates optional nullable fields that are stored as-is (ids, dates).
// Records an issue and returns undefined when the value is present but invalid.
function parseOptionalField(
  value: unknown,
  isValid: (value: unknown) => value is string,
  field: string,
  message: string,
  issues: Record<string, string[]>,
): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (!isValid(value)) {
    issues[field] = [message]
    return undefined
  }
  return value
}

const normalizeDescription = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > 2000) {
    throw new Error('Description must be less than 2000 characters')
  }
  return trimmed
}

const normalizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const normalized = value
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter((tag) => tag.length > 0)
    .slice(0, 10)
  return Array.from(new Set(normalized))
}

const parsePriority = (value: unknown): TaskPriorityDb => {
  const fallback: TaskPriorityDb = 'MEDIUM'
  if (typeof value !== 'string') return fallback
  const normalized = value.toUpperCase()
  if (priorityValues.includes(normalized as TaskPriorityDb)) {
    return normalized as TaskPriorityDb
  }
  return fallback
}

const parseStatus = (value: unknown): TaskStatusDb | undefined => {
  if (typeof value !== 'string') return undefined
  const normalized = value.toUpperCase()
  if (statusValues.includes(normalized as TaskStatusDb)) {
    return normalized as TaskStatusDb
  }
  return undefined
}

const parseEstimate = (value: unknown): number => {
  const numberValue = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numberValue)) return 1
  const rounded = Math.round(numberValue)
  return Math.min(64, Math.max(1, rounded))
}

const MAX_SEARCH_LENGTH = 100

/**
 * The term is bound as a parameter (no injection risk), but `%` and `*` are
 * stripped so a search is always a plain substring match, and the length is capped.
 */
export function sanitizeSearchTerm(value: string | null): string {
  if (!value) return ''
  return value.replace(/[,()"\\%*]/g, ' ').trim().slice(0, MAX_SEARCH_LENGTH)
}

/** Tags containing these characters can't be created through the UI, so reject them as filters. */
export function isValidTagFilter(value: string): boolean {
  return value.length > 0 && value.length <= 50 && !/[,{}"\\]/.test(value)
}

function formatError(message: string, details?: Record<string, string[]>) {
  return {
    success: false as const,
    error: { message, details },
  }
}

export function validateCreateTask(body: unknown): ValidationResult<CreateTaskPayload> {
  if (!isObject(body)) {
    return formatError('Request body must be an object')
  }

  const issues: Record<string, string[]> = {}

  if (typeof body.title !== 'string' || !body.title.trim()) {
    issues.title = ['Title is required']
  }

  if (typeof body.title === 'string' && body.title.trim().length > 200) {
    issues.title = ['Title must be shorter than 200 characters']
  }

  const dueDate = parseOptionalField(
    body.due_date, isValidDateString, 'due_date', 'Due date is invalid', issues,
  )

  if (Object.keys(issues).length) {
    return formatError('Invalid task data', issues)
  }

  try {
    const normalized: CreateTaskPayload = {
      title: body.title.trim(),
      description: normalizeDescription(body.description ?? null),
      priority: parsePriority(body.priority),
      estimate_pomodoros: parseEstimate(body.estimate_pomodoros),
      tags: normalizeTags(body.tags),
      due_date: dueDate ?? null,
      is_template: Boolean(body.is_template),
    }

    return { success: true, data: normalized }
  } catch (error: any) {
    return formatError(error.message ?? 'Invalid task data')
  }
}

export function validateUpdateTask(body: unknown): ValidationResult<UpdateTaskPayload> {
  if (!isObject(body)) {
    return formatError('Request body must be an object')
  }

  const normalized: UpdateTaskPayload = {}
  const issues: Record<string, string[]> = {}

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      issues.title = ['Title must be a non-empty string']
    } else if (body.title.trim().length > 200) {
      issues.title = ['Title must be shorter than 200 characters']
    } else {
      normalized.title = body.title.trim()
    }
  }

  if (body.description !== undefined) {
    try {
      normalized.description = normalizeDescription(body.description)
    } catch (error: any) {
      issues.description = [error.message ?? 'Description is invalid']
    }
  }

  if (body.priority !== undefined) {
    normalized.priority = parsePriority(body.priority)
  }

  if (body.estimate_pomodoros !== undefined) {
    normalized.estimate_pomodoros = parseEstimate(body.estimate_pomodoros)
  }

  if (body.tags !== undefined) {
    normalized.tags = normalizeTags(body.tags)
  }

  if (body.status !== undefined) {
    const status = parseStatus(body.status)
    if (!status) {
      issues.status = ['Status is invalid']
    } else {
      normalized.status = status
    }
  }

  const dueDate = parseOptionalField(
    body.due_date, isValidDateString, 'due_date', 'Due date is invalid', issues,
  )
  if (dueDate !== undefined) {
    normalized.due_date = dueDate
  }

  if (body.display_order !== undefined) {
    const order = Number(body.display_order)
    if (!Number.isNaN(order)) {
      normalized.display_order = Math.max(0, Math.round(order))
    }
  }

  if (body.is_template !== undefined) {
    normalized.is_template = Boolean(body.is_template)
  }

  if (!Object.keys(normalized).length) {
    issues.general = ['At least one field is required']
  }

  if (Object.keys(issues).length) {
    return formatError('Invalid task data', issues)
  }

  return { success: true, data: normalized }
}



