import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import {
  validateUpdateTask,
  type UpdateTaskPayload,
} from '../task-schemas'
import { isTaskOwnedByUser, wouldCreateParentCycle } from '../task-ownership'

// PostgREST code for `.single()` matching no row (missing or not the caller's task)
const NO_ROWS_ERROR_CODE = 'PGRST116'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function notFoundResponse() {
  return NextResponse.json({ error: 'Task not found' }, { status: 404 })
}

function validationErrorResponse(error: { message: string; details?: Record<string, string[]> }) {
  return NextResponse.json(
    { error: error.message, details: error.details },
    { status: 400 },
  )
}

function buildUpdatePayload(payload: UpdateTaskPayload) {
  const updates: Record<string, unknown> = {}
  if (payload.title !== undefined) updates.title = payload.title
  if (payload.description !== undefined) updates.description = payload.description
  if (payload.priority !== undefined) updates.priority = payload.priority
  if (payload.estimate_pomodoros !== undefined) {
    updates.estimate_pomodoros = payload.estimate_pomodoros
  }
  if (payload.tags !== undefined) updates.tags = payload.tags
  if (payload.status !== undefined) updates.status = payload.status
  if (payload.due_date !== undefined) updates.due_date = payload.due_date
  if (payload.parent_task_id !== undefined) updates.parent_task_id = payload.parent_task_id
  if (payload.display_order !== undefined) updates.display_order = payload.display_order
  if (payload.is_template !== undefined) updates.is_template = payload.is_template
  updates.updated_at = new Date().toISOString()
  return updates
}

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return unauthorizedResponse()
  }

  const userId = user.id
  const { id } = params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return validationErrorResponse({ message: 'Request body must be valid JSON' })
  }

  try {
    const parsed = validateUpdateTask(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const parentTaskId = parsed.data.parent_task_id
    if (parentTaskId) {
      if (!(await isTaskOwnedByUser(supabase, parentTaskId, userId))) {
        return validationErrorResponse({
          message: 'Invalid task data',
          details: { parent_task_id: ['Parent task not found'] },
        })
      }
      if (await wouldCreateParentCycle(supabase, userId, id, parentTaskId)) {
        return validationErrorResponse({
          message: 'Invalid task data',
          details: { parent_task_id: ['A task cannot be nested under itself or its subtasks'] },
        })
      }
    }

    const updates = buildUpdatePayload(parsed.data)

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', String(userId))
      .select('*')
      .single()

    if (error?.code === NO_ROWS_ERROR_CODE) {
      return notFoundResponse()
    }

    if (error) {
      console.error('Error updating task:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId,
        taskId: id,
      })
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 },
      )
    }

    return NextResponse.json({ task: data })
  } catch (error) {
    console.error('Error updating task', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return unauthorizedResponse()
  }

  const userId = user.id
  const { id } = params
  const { searchParams } = new URL(request.url)
  const hard = searchParams.get('hard') === 'true'

  try {
    if (hard) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', String(userId))

      if (error) {
        console.error('Error hard-deleting task:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          userId,
          taskId: id,
        })
        return NextResponse.json(
          { error: 'Failed to delete task' },
          { status: 500 },
        )
      }

      return NextResponse.json({ ok: true })
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', String(userId))
      .select('*')
      .single()

    if (error?.code === NO_ROWS_ERROR_CODE) {
      return notFoundResponse()
    }

    if (error) {
      console.error('Error soft-deleting task:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId,
        taskId: id,
      })
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 },
      )
    }

    return NextResponse.json({ task: data })
  } catch (error) {
    console.error('Error deleting task', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 },
    )
  }
}

