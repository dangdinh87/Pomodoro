import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * True when `taskId` exists and belongs to `userId`.
 * Used before linking a task by id (parent task, session task) so a client
 * cannot reference another user's task.
 */
export async function isTaskOwnedByUser(
  supabase: SupabaseClient,
  taskId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error checking task ownership', { code: error.code, taskId })
    return false
  }
  return Boolean(data)
}

// Subtasks are shallow in practice; anything deeper is rejected to bound the walk.
const MAX_PARENT_DEPTH = 10

/**
 * True when making `parentId` the parent of `taskId` would create a cycle
 * (A → B → A), i.e. `taskId` is `parentId` itself or one of its ancestors.
 * A chain deeper than MAX_PARENT_DEPTH is also treated as invalid.
 */
export async function wouldCreateParentCycle(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  parentId: string,
): Promise<boolean> {
  let current: string | null = parentId
  for (let depth = 0; current && depth < MAX_PARENT_DEPTH; depth++) {
    if (current === taskId) return true
    const { data, error }: { data: { parent_task_id: string | null } | null; error: unknown } =
      await supabase
        .from('tasks')
        .select('parent_task_id')
        .eq('id', current)
        .eq('user_id', userId)
        .maybeSingle()
    if (error || !data) return false
    current = data.parent_task_id ?? null
  }
  return current !== null
}
