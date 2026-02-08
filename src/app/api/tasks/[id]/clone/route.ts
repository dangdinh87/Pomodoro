import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    // Fetch the original task
    const { data: originalTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !originalTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Create a cloned task with reset progress (backward compatible)
    const clonedTask: Record<string, any> = {
      user_id: user.id,
      title: `${originalTask.title} (Copy)`,
      description: originalTask.description,
      priority: originalTask.priority,
      estimate_pomodoros: originalTask.estimate_pomodoros,
      actual_pomodoros: 0,  // Reset progress
      time_spent: 0,        // Reset time
      status: 'TODO',       // Reset status to TODO
      tags: originalTask.tags,
      is_deleted: false,
    }

    // Only include new fields if they exist in original (migration may not be applied)
    if (originalTask.due_date !== undefined) {
      clonedTask.due_date = originalTask.due_date
    }
    if (originalTask.parent_task_id !== undefined) {
      clonedTask.parent_task_id = originalTask.parent_task_id
    }
    if (originalTask.display_order !== undefined) {
      clonedTask.display_order = (originalTask.display_order ?? 0) + 1
    }

    const { data: newTask, error: insertError } = await supabase
      .from('tasks')
      .insert(clonedTask)
      .select('*')
      .single()

    if (insertError) {
      console.error('Error cloning task:', insertError)
      return NextResponse.json(
        { error: 'Failed to clone task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ task: newTask }, { status: 201 })
  } catch (error) {
    console.error('Error cloning task:', error)
    return NextResponse.json(
      { error: 'Failed to clone task' },
      { status: 500 }
    )
  }
}
