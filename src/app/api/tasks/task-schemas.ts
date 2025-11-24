const priorityValues = ['LOW', 'MEDIUM', 'HIGH'] as const
const statusValues = ['PENDING', 'IN_PROGRESS', 'DONE'] as const

export type TaskPriorityDb = (typeof priorityValues)[number]
export type TaskStatusDb = (typeof statusValues)[number]

export interface CreateTaskPayload {
  title: string
  description: string | null
  priority: TaskPriorityDb
  estimate_pomodoros: number
  tags: string[]
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  status?: TaskStatusDb
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

  if (body.title && body.title.trim().length > 200) {
    issues.title = ['Title must be shorter than 200 characters']
  }

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

  if (!Object.keys(normalized).length) {
    issues.general = ['At least one field is required']
  }

  if (Object.keys(issues).length) {
    return formatError('Invalid task data', issues)
  }

  return { success: true, data: normalized }
}



