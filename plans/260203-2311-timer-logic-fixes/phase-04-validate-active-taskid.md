# Phase 04: Validate activeTaskId

## Context

The session-complete API endpoint accepts a `taskId` without validating that the task exists and belongs to the authenticated user. If the task was deleted or belongs to another user, the session records with an invalid taskId, and the RPC to increment task progress fails silently.

## Overview

**Severity:** LOW
**Effort:** 1 hour
**File:** `src/app/api/tasks/session-complete/route.ts`

Validate that the provided taskId exists and belongs to the authenticated user before recording the session. If invalid, proceed without taskId rather than creating orphaned data.

## Key Insights

1. **Current behavior:** Session records with whatever taskId is passed, RPC fails silently
2. **Risk:** Orphaned session records pointing to non-existent tasks
3. **Data integrity:** Foreign key may not be enforced at DB level
4. **Client behavior:** `activeTaskId` persisted in localStorage, may become stale

## Requirements

### Functional
- Validate taskId exists in `tasks` table
- Validate task belongs to authenticated user (`user_id` match)
- If validation fails: record session with `task_id: null`
- Log warning when taskId validation fails (server-side)

### Non-Functional
- Minimal additional DB query (single select)
- Do not block session recording on validation failure
- Maintain backward compatibility with existing clients

## Architecture

### Current Flow
```
POST /api/tasks/session-complete
  └─▶ Insert session with taskId (no validation)
  └─▶ Call increment_task_pomodoro RPC (may fail)
```

### Fixed Flow
```
POST /api/tasks/session-complete
  └─▶ If taskId provided:
        └─▶ Query task by id + user_id
        └─▶ If not found: taskId = null, log warning
  └─▶ Insert session with validated taskId
  └─▶ If taskId valid: Call increment_task_pomodoro RPC
```

## Related Code

### Current Implementation (session-complete/route.ts:52-63)
```typescript
// 3. Update Task progress (if applicable)
if (taskId && mode === 'work') {
    const { error: incError } = await supabase.rpc('increment_task_pomodoro', {
        task_id_input: taskId,
        user_id_input: userId,
        duration_ms_input: duration * 1000,
    })

    if (incError) {
        console.error('Error updating task progress', incError)
    }
}
```

### Session Insert (session-complete/route.ts:33-43)
```typescript
const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .insert({
        user_id: userId,
        task_id: taskId ?? null,  // Unvalidated taskId
        duration,
        mode,
    })
    .select('*')
    .single()
```

## Implementation Steps

### Step 1: Add Task Validation Function
**Location:** Before session insert, after parsing body

```typescript
// Validate taskId if provided
let validatedTaskId: string | null = null;

if (taskId) {
    const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single();

    if (taskError || !taskData) {
        console.warn(`Invalid taskId ${taskId} for user ${userId}: ${taskError?.message || 'not found'}`);
        // Proceed without taskId - don't block session recording
        validatedTaskId = null;
    } else {
        validatedTaskId = taskId;
    }
} else {
    validatedTaskId = null;
}
```

### Step 2: Update Session Insert
Replace `taskId` with `validatedTaskId`:

```typescript
const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .insert({
        user_id: userId,
        task_id: validatedTaskId,  // Use validated taskId
        duration,
        mode,
    })
    .select('*')
    .single()
```

### Step 3: Update Task Progress Conditional
Only call RPC if `validatedTaskId` is truthy:

```typescript
// 3. Update Task progress (if applicable)
if (validatedTaskId && mode === 'work') {
    const { error: incError } = await supabase.rpc('increment_task_pomodoro', {
        task_id_input: validatedTaskId,
        user_id_input: userId,
        duration_ms_input: duration * 1000,
    })

    if (incError) {
        console.error('Error updating task progress', incError)
    }
}
```

### Complete Updated Code
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const userId = user.id
    const body = await request.json()
    const {
      taskId,
      durationSec,
      mode,
    }: {
      taskId?: string | null
      durationSec: number
      mode: 'work' | 'shortBreak' | 'longBreak'
    } = body

    const duration = Math.max(0, Math.round(durationSec))

    // 2. Validate taskId if provided
    let validatedTaskId: string | null = null;

    if (taskId) {
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single();

      if (taskError || !taskData) {
        console.warn(`Invalid taskId ${taskId} for user ${userId}: ${taskError?.message || 'not found'}`);
        validatedTaskId = null;
      } else {
        validatedTaskId = taskId;
      }
    }

    // 3. Record session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        task_id: validatedTaskId,
        duration,
        mode,
      })
      .select('*')
      .single()

    if (sessionError) {
      console.error('Error creating session', sessionError)
      return NextResponse.json(
        { error: 'Failed to record session completion' },
        { status: 500 },
      )
    }

    // 4. Update Task progress (if applicable)
    if (validatedTaskId && mode === 'work') {
      const { error: incError } = await supabase.rpc('increment_task_pomodoro', {
        task_id_input: validatedTaskId,
        user_id_input: userId,
        duration_ms_input: duration * 1000,
      })

      if (incError) {
        console.error('Error updating task progress', incError)
      }
    }

    // 5. Update Streak (unchanged)
    // ... rest of streak logic ...

    return NextResponse.json({ session: sessionData })
  } catch (error) {
    console.error('Error recording session completion', error)
    return NextResponse.json(
      { error: 'Failed to record session completion' },
      { status: 500 },
    )
  }
}
```

## Todo List

- [ ] Add task validation query after parsing body
- [ ] Create `validatedTaskId` variable
- [ ] Log warning when taskId invalid
- [ ] Update session insert to use `validatedTaskId`
- [ ] Update task progress conditional to use `validatedTaskId`
- [ ] Test: Valid taskId - session records with task, progress updates
- [ ] Test: Invalid taskId - session records without task, no RPC call
- [ ] Test: Deleted task - session records without task
- [ ] Test: Another user's task - session records without task

## Success Criteria

1. Valid taskId: Session records with task, RPC updates progress
2. Invalid taskId: Session records with `task_id: null`, no error
3. Server logs warning for invalid taskId (not error)
4. No 500 errors from invalid taskId
5. Client behavior unchanged (receives session data)

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Extra DB query latency | Low | Single indexed lookup, ~10-20ms |
| Task deleted between validation and RPC | Very Low | Race condition is edge case, RPC handles gracefully |
| Breaking change for clients | None | Same response shape, just sanitized data |

## Security Considerations

- **Authorization:** Validates task belongs to authenticated user
- **Data integrity:** Prevents cross-user task association
- **Audit:** Logs invalid taskId attempts for monitoring

## Next Steps

After implementation:
1. Test with browser devtools to verify taskId handling
2. Check server logs for any warnings
3. Consider client-side cleanup of stale `activeTaskId` (future enhancement)

## Unresolved Questions

1. Should we return a warning in the response when taskId is invalid?
   - Current: Silent sanitization
   - Alternative: Include `warning: 'taskId not found'` in response

2. Should we clear `activeTaskId` on client when validation fails?
   - Would require response change and client-side handling
   - Lower priority, can be future enhancement
