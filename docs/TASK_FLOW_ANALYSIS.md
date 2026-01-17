# Phân Tích Luồng Task - Client to Supabase

## 📋 Tổng Quan

Ứng dụng Pomodoro có hệ thống quản lý task hoàn chỉnh với tích hợp timer tracking. Dưới đây là phân tích chi tiết từng phần.

---

## 🎯 1. KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   UI Layer   │─────▶│  Hook Layer  │─────▶│ Store Layer  │  │
│  │              │      │              │      │              │  │
│  │ - TaskPage   │      │ - useTasks   │      │ - TaskStore  │  │
│  │ - TaskMgmt   │      │ - useTask    │      │ - TimerStore │  │
│  │ - TaskForm   │      │   Actions    │      │              │  │
│  │ - TaskList   │      │ - useTask    │      │              │  │
│  │ - TaskItem   │      │   Filters    │      │              │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API ROUTES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  GET    /api/tasks              - Fetch all tasks               │
│  POST   /api/tasks              - Create task                   │
│  PATCH  /api/tasks/[id]         - Update task                   │
│  DELETE /api/tasks/[id]         - Soft delete task              │
│  DELETE /api/tasks/[id]?hard=1  - Hard delete task              │
│  POST   /api/tasks/session-complete - Track completed session   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Supabase Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Auth       │      │   Database   │      │     RLS      │  │
│  │              │      │              │      │              │  │
│  │ - getUser()  │      │ - tasks      │      │ - Policies   │  │
│  │ - Cookies    │      │ - sessions   │      │ - Security   │  │
│  │              │      │ - streaks    │      │              │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 2. LUỒNG CHI TIẾT CÁC CHỨC NĂNG

### 2.1 📖 **FETCH TASKS** (Read)

```
┌──────────────┐
│ TaskMgmt UI  │
└──────┬───────┘
       │ useQuery('tasks')
       ▼
┌──────────────┐
│  useTasks()  │
└──────┬───────┘
       │ GET /api/tasks
       ▼
┌────────────────────────────────────────┐
│   /api/tasks/route.ts                  │
├────────────────────────────────────────┤
│ 1. createClient() from cookies         │
│ 2. supabase.auth.getUser()             │
│    ├─ ❌ No user → 401 Unauthorized    │
│    └─ ✅ Has user → Continue            │
│ 3. Query tasks table                   │
│    SELECT *                            │
│    FROM tasks                          │
│    WHERE user_id = {userId}            │
│      AND is_deleted = false           │
│    ORDER BY created_at DESC            │
│ 4. RLS Policy Check                   │
│    auth.uid()::text = user_id          │
└────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│   Response                             │
├────────────────────────────────────────┤
│ { tasks: [                             │
│   {                                    │
│     id: "uuid",                        │
│     user_id: "uuid",                   │
│     title: "Task name",                │
│     description: "...",                │
│     priority: "HIGH|MEDIUM|LOW",       │
│     estimate_pomodoros: 4,             │
│     actual_pomodoros: 2,               │
│     time_spent: 3600000, // ms         │
│     status: "PENDING|IN_PROGRESS|DONE",│
│     tags: ["work", "urgent"],          │
│     is_deleted: false,                 │
│     created_at: "2024-01-01T00:00:00Z",│
│     updated_at: "2024-01-01T00:00:00Z" │
│   }                                    │
│ ]}                                     │
└────────────────────────────────────────┘
       │
       ▼ mapTaskFromApi()
┌────────────────────────────────────────┐
│   Transform to Client Format           │
├────────────────────────────────────────┤
│ - Priority: HIGH → high                │
│ - Status: PENDING → pending            │
│ - Snake_case → camelCase               │
│ - estimate_pomodoros → estimatePomodoros│
└────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│   React Query Cache                    │
└────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│   UI Updates (TaskList Component)      │
└────────────────────────────────────────┘
```

**Key Points:**

- ✅ Authentication qua cookies (Supabase Auth)
- ✅ RLS policies bảo vệ data
- ✅ Optimistic updates với React Query
- ✅ Soft delete (is_deleted = false)

---

### 2.2 ➕ **CREATE TASK** (Create)

```
┌──────────────────┐
│ TaskFormModal UI │
└────────┬─────────┘
         │ User fills form & clicks "Create"
         ▼
┌──────────────────┐
│ Form Validation  │
├──────────────────┤
│ - Title required │
│ - Estimate ≥ 1   │
│ - Tags normalize │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   useTasks() → createTask()          │
├──────────────────────────────────────┤
│ Input: {                             │
│   title: "New task",                 │
│   description: "Details...",         │
│   priority: "medium",                │
│   estimatePomodoros: 3,              │
│   tags: ["work", "coding"]           │
│ }                                    │
└────────┬─────────────────────────────┘
         │ POST /api/tasks
         │ Body: {
         │   title: "New task",
         │   description: "Details...",
         │   priority: "MEDIUM",  // Uppercase
         │   estimate_pomodoros: 3,
         │   tags: ["work", "coding"]
         │ }
         ▼
┌────────────────────────────────────────┐
│   /api/tasks/route.ts (POST)           │
├────────────────────────────────────────┤
│ 1. isAuthorized(request)               │
│    └─ Check API_ROUTE_TOKEN if exists  │
│ 2. supabase.auth.getUser()             │
│    └─ Get userId from session          │
│ 3. validateCreateTask(body)            │
│    ├─ Title: required, max 200 chars   │
│    ├─ Description: optional, max 2000  │
│    ├─ Priority: HIGH|MEDIUM|LOW        │
│    ├─ Estimate: 1-64 pomodoros         │
│    └─ Tags: max 10, deduplicated       │
│ 4. buildInsertPayload()                │
│    └─ Add user_id to payload           │
│ 5. INSERT into tasks table             │
│ 6. RLS Policy Check                    │
│    auth.uid()::text = user_id          │
└────────────────────────────────────────┘
         │
         ▼ ✅ Success
┌────────────────────────────────────────┐
│   Response { task: {...} }             │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│   React Query                          │
├────────────────────────────────────────┤
│ - invalidateQueries(['tasks'])         │
│ - Refetch task list                    │
│ - Toast success message                │
└────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│   UI Updates                           │
├────────────────────────────────────────┤
│ - Close modal                          │
│ - Show new task in list                │
│ - Animate list item appearance         │
└────────────────────────────────────────┘
```

**Validation Rules:**

```typescript
// task-schemas.ts
- title: required, max 200 characters
- description: optional, max 2000 characters
- priority: "HIGH" | "MEDIUM" | "LOW" (default: "MEDIUM")
- estimate_pomodoros: 1-64 (default: 1)
- tags: max 10 unique tags
```

---

### 2.3 ✏️ **UPDATE TASK** (Update)

```
┌──────────────────┐
│  TaskItem UI     │
└────────┬─────────┘
         │ Click Edit button
         ▼
┌──────────────────┐
│ TaskFormModal    │
│ (Edit Mode)      │
└────────┬─────────┘
         │ Modify fields
         ▼
┌──────────────────────────────────────┐
│   useTasks() → updateTask()          │
├──────────────────────────────────────┤
│ Input: {                             │
│   id: "task-uuid",                   │
│   input: {                           │
│     title: "Updated title",          │
│     status: "in_progress",           │
│     priority: "high"                 │
│   }                                  │
│ }                                    │
└────────┬─────────────────────────────┘
         │ PATCH /api/tasks/[id]
         │
         ▼
┌────────────────────────────────────────┐
│   /api/tasks/[id]/route.ts (PATCH)     │
├────────────────────────────────────────┤
│ 1. isAuthorized(request)               │
│ 2. supabase.auth.getUser()             │
│ 3. validateUpdateTask(body)            │
│    └─ Partial validation (all optional)│
│ 4. buildUpdatePayload()                │
│    └─ Only include provided fields     │
│    └─ Add updated_at timestamp         │
│ 5. UPDATE tasks                        │
│    SET {updates}                       │
│    WHERE id = {id}                     │
│      AND user_id = {userId}            │
│ 6. RLS Policy Check                    │
└────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│   React Query - Optimistic Update      │
├────────────────────────────────────────┤
│ onMutate: {                            │
│   - Cancel ongoing queries             │
│   - Save previous state                │
│   - Update cache immediately (UI fast) │
│ }                                      │
│ onError: {                             │
│   - Rollback to previous state         │
│   - Show error toast                   │
│ }                                      │
│ onSettled: {                           │
│   - Refetch from server                │
│   - Sync with actual state             │
│ }                                      │
└────────────────────────────────────────┘
```

**Common Update Operations:**

1. **Toggle Status** (Done/Pending)

   ```typescript
   updateTask({
     id,
     input: {
       status: task.status === 'done' ? 'pending' : 'done',
     },
   });
   ```

2. **Start Focus Mode**

   ```typescript
   // Set task as active
   setActiveTask(taskId);
   // Move to in_progress if pending
   if (task.status === 'pending') {
     updateTask({ id, input: { status: 'in_progress' } });
   }
   ```

3. **Edit Task Details**
   ```typescript
   updateTask({
     id,
     input: {
       title,
       description,
       priority,
       estimatePomodoros,
     },
   });
   ```

---

### 2.4 🗑️ **DELETE TASK** (Delete)

```
┌──────────────────┐
│  TaskItem UI     │
└────────┬─────────┘
         │ Click Delete button
         ▼
┌────────────────────────────────────────┐
│   Alert Dialog Confirmation            │
├────────────────────────────────────────┤
│ "Are you sure you want to delete       │
│  this task? This action cannot be      │
│  undone."                              │
│                                        │
│  [Cancel]  [Delete]                    │
└────────┬───────────────────────────────┘
         │ User confirms
         ▼
┌────────────────────────────────────────┐
│   useTasks() → hardDeleteTask()        │
└────────┬───────────────────────────────┘
         │ DELETE /api/tasks/[id]?hard=true
         ▼
┌────────────────────────────────────────┐
│   /api/tasks/[id]/route.ts (DELETE)    │
├────────────────────────────────────────┤
│ URL params: hard=true                  │
│                                        │
│ if (hard) {                            │
│   DELETE FROM tasks                    │
│   WHERE id = {id}                      │
│     AND user_id = {userId}             │
│ } else {                               │
│   UPDATE tasks                         │
│   SET is_deleted = true                │
│   WHERE id = {id}                      │
│     AND user_id = {userId}             │
│ }                                      │
└────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│   React Query - Optimistic Delete      │
├────────────────────────────────────────┤
│ onMutate: {                            │
│   - Remove from cache immediately      │
│   - Save previous state                │
│ }                                      │
│ onError: {                             │
│   - Restore deleted task to cache      │
│   - Show error toast                   │
│ }                                      │
│ onSettled: {                           │
│   - Show success toast                 │
│   - Refetch list                       │
│ }                                      │
└────────────────────────────────────────┘
```

**Delete Types:**

- **Soft Delete:** `is_deleted = true` (not used in UI currently)
- **Hard Delete:** Physical removal from database (current implementation)

---

### 2.5 ⏱️ **TIMER INTEGRATION** (Session Tracking)

```
┌────────────────────────────────────────┐
│   Timer Page                           │
├────────────────────────────────────────┤
│ 1. TaskSelector Component              │
│    - Shows active task                 │
│    - Can select from today's tasks     │
│    └─ useTasksStore().activeTaskId     │
│                                        │
│ 2. Timer Component                     │
│    - Countdown display                 │
│    - Start/Pause/Reset buttons         │
│    └─ useTimerStore()                  │
└────────┬───────────────────────────────┘
         │ User completes a pomodoro
         ▼
┌────────────────────────────────────────┐
│   Timer completes (timeLeft = 0)       │
├────────────────────────────────────────┤
│ - Play alarm sound                     │
│ - Show notification                    │
│ - Call handleTimerComplete()           │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│   POST /api/tasks/session-complete     │
├────────────────────────────────────────┤
│ Body: {                                │
│   taskId: "active-task-uuid",          │
│   durationSec: 1500, // 25 min        │
│   mode: "work" // or "shortBreak"     │
│ }                                      │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│   session-complete/route.ts            │
├────────────────────────────────────────┤
│ 1. Authenticate user                   │
│                                        │
│ 2. Create Session Record               │
│    INSERT INTO sessions {              │
│      user_id,                          │
│      task_id,                          │
│      duration,                         │
│      mode                              │
│    }                                   │
│                                        │
│ 3. Update Task Progress (if work mode) │
│    RPC: increment_task_pomodoro()      │
│    └─ actual_pomodoros++               │
│    └─ time_spent += duration           │
│                                        │
│ 4. Update Streak (if work mode)        │
│    UPSERT streaks {                    │
│      current: +1 (if consecutive day)  │
│      longest: max(current, longest)    │
│      last_session: now()               │
│    }                                   │
└────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│   Response & UI Updates                │
├────────────────────────────────────────┤
│ - Invalidate tasks query               │
│ - Task progress bar updates            │
│ - Actual pomodoros count increases     │
│ - Streak counter updates               │
│ - Session saved to history             │
└────────────────────────────────────────┘
```

**Database RPC Function:**

```sql
-- increment_task_pomodoro()
-- Parameters:
--   - task_id_input: UUID
--   - user_id_input: UUID
--   - duration_ms_input: INTEGER
--
-- Actions:
--   - Increment actual_pomodoros by 1
--   - Add duration_ms to time_spent
--   - Set updated_at to NOW()
```

**Streak Logic:**

- **Same day:** Update timestamp only
- **Consecutive day:** Increment current streak
- **Broken streak:** Reset current to 1, keep longest
- **New user:** Create initial streak record

---

## 🎨 3. UI COMPONENTS BREAKDOWN

### 3.1 Component Tree

```
TasksPage (page.tsx)
└─ TaskManagement (task-management.tsx)
   ├─ Header Section
   │  ├─ Title & Subtitle
   │  └─ Add Task Button
   │
   ├─ TaskFilters (components/task-filters.tsx)
   │  ├─ Search Input
   │  ├─ Status Filter Select
   │  ├─ Priority Filter Select
   │  ├─ Date Range Picker
   │  └─ Reset Filters Button
   │
   ├─ TaskList (components/task-list.tsx)
   │  └─ TaskItem[] (components/task-item.tsx)
   │     ├─ Checkbox (Toggle Status)
   │     ├─ Task Info
   │     │  ├─ Title
   │     │  ├─ Priority Badge
   │     │  ├─ Active Badge (if active)
   │     │  ├─ Progress Bar
   │     │  ├─ Time Spent
   │     │  └─ Tags
   │     └─ Action Buttons
   │        ├─ Focus Button (Start/Stop)
   │        ├─ Edit Button
   │        └─ Delete Button
   │
   ├─ TaskFormModal (components/task-form-modal.tsx)
   │  ├─ Title Input
   │  ├─ Description Textarea
   │  ├─ Estimate Pomodoros Input
   │  ├─ Priority Select
   │  ├─ Status Select
   │  ├─ Tags Input with Badge Display
   │  └─ Actions (Cancel / Save)
   │
   └─ DeleteConfirmDialog
      └─ AlertDialog with Cancel/Confirm
```

### 3.2 Key UI Features

#### A. **TaskItem Component**

```
┌─────────────────────────────────────────────────────┐
│ [✓] High Priority Task Name        [HIGH] [ACTIVE] │
│     Progress: ████░░ 2/4  Time: 45 min             │
│     Tags: [work] [urgent]                           │
│                                                     │
│     [Actions: Focus | Edit | Delete] (on hover)    │
└─────────────────────────────────────────────────────┘
```

**States:**

- ✅ **Active:** Border glow, "Focusing" badge, auto status → in_progress
- ✅ **Done:** Strikethrough, grayscale, checkbox checked
- ✅ **Hover:** Show action buttons, lift effect
- ✅ **Animation:** Smooth enter/exit with Framer Motion

#### B. **TaskFormModal**

```
┌─────────────────────────────────────────────┐
│  Add Task                             [✕]   │
├─────────────────────────────────────────────┤
│  Task Name *                                │
│  [____________________________________]     │
│                                             │
│  Description                                │
│  [____________________________________]     │
│  [____________________________________]     │
│                                             │
│  Estimated Pomodoros    Priority            │
│  [4  ▼]                [Medium ▼]           │
│                                             │
│  Status                                     │
│  [Pending ▼]                                │
│                                             │
│  Tags                                       │
│  [work] [urgent] [✕]                        │
│  [Add tags...____________] [+ Add]          │
│                                             │
├─────────────────────────────────────────────┤
│                    [Cancel]  [Create Task]  │
└─────────────────────────────────────────────┘
```

**Validation:**

- Title required indicator (\*)
- Real-time error display
- Auto-focus on title field
- Tag deduplication
- Enter key to add tags

#### C. **TaskFilters**

```
┌─────────────────────────────────────────────────────────┐
│ [🔍 Search tasks...]  [Status ▼] [Priority ▼]          │
│                       [Date Range] [Reset 🗑]           │
└─────────────────────────────────────────────────────────┘
```

**Filter Logic:**

```typescript
// useFilteredTasks()
filters:
  - Query: Search in title, description, tags
  - Status: all | pending | in_progress | done | cancelled
  - Priority: all | low | medium | high
  - Date Range: Filter by created_at

Sort: Latest first (created_at DESC)
```

#### D. **TaskSelector (in Timer Page)**

```
┌─────────────────────────────────────────────┐
│  Active Task                          [▼]   │
│  ┌─────────────────────────────────────┐   │
│  │ ● Finish project documentation      │   │
│  │   2/4 Pomodoros · 45 min spent      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Today's Tasks                              │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Review pull requests              │   │
│  │   0/2 Pomodoros                     │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Write unit tests                  │   │
│  │   0/3 Pomodoros                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Features:**

- Shows active task prominently
- Lists today's incomplete tasks
- Quick task switching
- Auto-updates on task selection

---

## 🔐 4. AUTHENTICATION & SECURITY

### 4.1 Authentication Flow

```
┌────────────────────────────────────────┐
│   Browser                              │
├────────────────────────────────────────┤
│ - Supabase Auth Session (HttpOnly)    │
│ - Session cookies automatically sent   │
│   with every request                   │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│   API Route                            │
├────────────────────────────────────────┤
│ 1. Create Supabase client from cookies│
│    const supabase = await createClient()│
│                                        │
│ 2. Get authenticated user              │
│    const { data: { user } }            │
│      = await supabase.auth.getUser()   │
│                                        │
│ 3. Validate user exists                │
│    if (!user) return 401 Unauthorized  │
│                                        │
│ 4. Use user.id for queries             │
│    WHERE user_id = user.id             │
└────────────────────────────────────────┘
```

### 4.2 RLS (Row Level Security) Policies

```sql
-- Tasks Table RLS Policies

-- 1. SELECT Policy
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (
  auth.uid()::text = user_id
  AND is_deleted = false
);

-- 2. INSERT Policy
CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (
  auth.uid()::text = user_id
);

-- 3. UPDATE Policy
CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (
  auth.uid()::text = user_id
);

-- 4. DELETE Policy
CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (
  auth.uid()::text = user_id
);
```

**Key Security Features:**

- ✅ User can only see their own tasks
- ✅ User can only modify their own tasks
- ✅ Deleted tasks hidden from SELECT
- ✅ auth.uid() ensures authenticated user
- ✅ Type cast to text for comparison

### 4.3 API Route Authorization

```typescript
// Optional API_ROUTE_TOKEN for extra security
function isAuthorized(request: Request) {
  if (!API_ROUTE_TOKEN) return true; // No token required

  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return false;

  const token = header.slice(7);
  return token === API_ROUTE_TOKEN;
}
```

**Current Setup:**

- ❌ `API_ROUTE_TOKEN` not set → All authenticated users allowed
- ✅ Auth still required via Supabase session
- ✅ RLS policies provide data-level security

---

## 📊 5. STATE MANAGEMENT

### 5.1 React Query (Server State)

```typescript
// Query Key Structure
['tasks'] → All tasks for current user

// Cache Strategy
{
  staleTime: 0,           // Data considered stale immediately
  cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  refetchOnWindowFocus: true, // Refresh when tab gains focus
  refetchOnReconnect: true    // Refresh when reconnects
}

// Optimistic Updates
onMutate: {
  - Cancel ongoing queries
  - Snapshot current state
  - Update cache immediately → Fast UI
}

onError: {
  - Rollback to snapshot → User sees instant feedback
  - Show error toast
}

onSettled: {
  - Always refetch from server → Ensure consistency
}
```

### 5.2 Zustand (Client State)

```typescript
// task-store.ts
interface TasksState {
  activeTaskId: string | null;  // Currently focused task
  setActiveTask: (id: string | null) => void;
}

// Persisted to localStorage
{
  name: 'task-storage',
  partialize: (state) => ({
    activeTaskId: state.activeTaskId
  })
}
```

```typescript
// timer-store.ts
interface TimerState {
  mode: 'work' | 'shortBreak' | 'longBreak';
  timeLeft: number;           // seconds
  isRunning: boolean;
  deadlineAt: number | null;  // absolute timestamp
  sessionCount: number;
  completedSessions: number;
  totalFocusTime: number;     // seconds
  settings: {
    workDuration: 25,         // minutes
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreak: true,
    autoStartWork: true,
  };
}

// Persisted to localStorage
{
  name: 'timer-storage',
  partialize: (state) => ({
    settings: state.settings,
    sessionCount: state.sessionCount,
    completedSessions: state.completedSessions,
    totalFocusTime: state.totalFocusTime,
  })
}
```

**Why Split State?**

- 🔄 **React Query:** Server data, auto-sync, caching
- 💾 **Zustand:** UI state, persistence, performance

---

## 🐛 6. ERROR HANDLING

### 6.1 Client-Side

```typescript
// useTasks() hook
createTaskMutation: {
  onSuccess: () => {
    queryClient.invalidateQueries(['tasks']);
    toast.success('Task created successfully');
  },
  onError: (error) => {
    toast.error('Failed to create task');
    console.error(error);
  }
}
```

### 6.2 Server-Side

```typescript
// API Routes
try {
  // ... operation ...
} catch (error) {
  console.error('Error creating task', {
    error,
    message: error.message,
    details: error.details,
    userId,
    payload,
  });

  return NextResponse.json(
    {
      error: 'Failed to create task',
      details: error.message,
    },
    { status: 500 },
  );
}
```

### 6.3 Validation Errors

```typescript
// task-schemas.ts
const issues: Record<string, string[]> = {};

if (!body.title.trim()) {
  issues.title = ['Title is required'];
}

if (body.title.length > 200) {
  issues.title = ['Title must be shorter than 200 characters'];
}

if (Object.keys(issues).length) {
  return formatError('Invalid task data', issues);
}
```

**Error Types:**

- 400: Validation errors (with details)
- 401: Unauthorized (no session)
- 500: Server errors (Supabase/DB issues)

---

## 📈 7. PERFORMANCE OPTIMIZATIONS

### 7.1 React Query Benefits

```typescript
✅ Automatic caching
✅ Background refetching
✅ Deduplication of requests
✅ Optimistic updates (instant UI)
✅ Automatic retry on failure
✅ Stale-while-revalidate pattern
```

### 7.2 Optimistic Updates Example

```typescript
// Before: Wait for server → Slow UI
onClick → API Call (500ms) → Update UI

// After: Update immediately → Fast UI
onClick → Update UI (0ms) → API Call (background)
         ↓
         Success? Keep changes
         Error? Rollback + show error
```

### 7.3 Component Optimizations

```typescript
// Memoized filtered tasks
const filteredTasks = useMemo(() => {
  return tasks.filter(...).sort(...)
}, [tasks, filters]);

// Framer Motion: Efficient animations
<AnimatePresence mode="popLayout">
  {tasks.map(task => (
    <AnimatedListItem key={task.id}>
      <TaskItem task={task} />
    </AnimatedListItem>
  ))}
</AnimatePresence>
```

---

## ✅ 8. TESTING CHECKLIST

### 8.1 Create Task

- [ ] Create with only title (required field)
- [ ] Create with all fields filled
- [ ] Validation: Empty title → Show error
- [ ] Validation: Title > 200 chars → Show error
- [ ] Validation: Description > 2000 chars → Show error
- [ ] Validation: Estimate < 1 → Clamp to 1
- [ ] Tags: Add/remove tags
- [ ] Tags: Duplicate tags → Deduplicate
- [ ] Tags: Max 10 tags → Truncate
- [ ] Close modal → Reset form

### 8.2 Read Tasks

- [ ] Fetch on page load
- [ ] Show loading skeleton
- [ ] Empty state when no tasks
- [ ] Only show user's own tasks
- [ ] Hide deleted tasks (is_deleted = true)
- [ ] Sort by created_at DESC

### 8.3 Update Task

- [ ] Edit title, description, priority
- [ ] Toggle status (pending ↔ done)
- [ ] Start focus → Status to in_progress
- [ ] Optimistic update → Instant UI
- [ ] Error → Rollback changes
- [ ] Close modal → Save changes

### 8.4 Delete Task

- [ ] Show confirmation dialog
- [ ] Cancel → No deletion
- [ ] Confirm → Hard delete
- [ ] Optimistic delete → Instant removal
- [ ] Error → Restore task

### 8.5 Filters

- [ ] Search: Title, description, tags
- [ ] Status filter: All/Pending/InProgress/Done
- [ ] Priority filter: All/Low/Medium/High
- [ ] Date range: Filter by created_at
- [ ] Reset filters: Clear all filters

### 8.6 Timer Integration

- [ ] Select task in TaskSelector
- [ ] Complete pomodoro → Increment actual_pomodoros
- [ ] Complete pomodoro → Add time_spent
- [ ] Complete break → No task update
- [ ] Session saved to sessions table
- [ ] Streak updated (consecutive days)

### 8.7 Authentication

- [ ] Not logged in → Show "Sign in to manage tasks"
- [ ] Logged in → Show task management
- [ ] Logout → Redirect to login
- [ ] Session expired → Redirect to login

### 8.8 RLS Policies

- [ ] User A cannot see User B's tasks
- [ ] User A cannot update User B's tasks
- [ ] User A cannot delete User B's tasks
- [ ] Deleted tasks not returned in SELECT

---

## 🔧 9. COMMON ISSUES & SOLUTIONS

### Issue 1: Tasks not appearing after creation

**Cause:** RLS policies missing or incorrect
**Solution:** Check policies in `supabase_schema.sql`

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'tasks';
```

### Issue 2: 401 Unauthorized errors

**Cause:** User session expired or not authenticated
**Solution:**

- Check `supabase.auth.getUser()` returns user
- Verify cookies are sent with request
- Check middleware refreshes session

### Issue 3: Type mismatch (UUID vs TEXT)

**Cause:** `user_id` type inconsistency
**Solution:** Cast in RLS policies

```sql
auth.uid()::text = user_id  -- ✅ Correct
auth.uid() = user_id         -- ❌ Type error
```

### Issue 4: Optimistic updates not working

**Cause:** Query key mismatch
**Solution:** Ensure consistent query keys

```typescript
// Must match exactly
useQuery({ queryKey: ['tasks'] });
queryClient.invalidateQueries({ queryKey: ['tasks'] });
```

### Issue 5: Task not updating in timer

**Cause:** activeTaskId not synced
**Solution:** Check TaskSelector sets activeTaskId

```typescript
const { activeTaskId, setActiveTask } = useTasksStore();
setActiveTask(task.id); // Set when selecting task
```

---

## 📝 10. FUTURE IMPROVEMENTS

### Performance

- [ ] Infinite scroll for large task lists
- [ ] Virtual scrolling for 1000+ tasks
- [ ] Debounced search input
- [ ] Prefetch task details on hover

### Features

- [ ] Task dependencies (parent/child)
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Task sharing/collaboration
- [ ] Task notes/comments
- [ ] Attachments

### UX

- [ ] Drag & drop reordering
- [ ] Bulk operations (select multiple)
- [ ] Keyboard shortcuts
- [ ] Task search history
- [ ] Quick add task (Cmd+K)

### Data

- [ ] Export tasks (CSV, JSON)
- [ ] Import tasks
- [ ] Archive completed tasks
- [ ] Trash bin (restore deleted)
- [ ] Task analytics/insights

---

## 📚 11. RELATED FILES

### Frontend

```
src/
├── app/(main)/tasks/
│   └── page.tsx                          # Tasks page
├── components/tasks/
│   ├── task-management.tsx               # Main container
│   └── components/
│       ├── task-filters.tsx              # Filters UI
│       ├── task-form-modal.tsx           # Create/Edit modal
│       ├── task-form.tsx                 # Form component (old)
│       ├── task-item.tsx                 # Single task UI
│       └── task-list.tsx                 # Task list container
├── hooks/
│   ├── use-tasks.ts                      # React Query hooks
│   ├── use-task-actions.ts               # Action handlers
│   ├── use-task-filters.ts               # Filter logic
│   └── use-task-form.ts                  # Form state
└── stores/
    ├── task-store.ts                     # Zustand store
    └── timer-store.ts                    # Timer state
```

### Backend

```
src/app/api/tasks/
├── route.ts                              # GET, POST /api/tasks
├── [id]/
│   └── route.ts                          # PATCH, DELETE /api/tasks/:id
├── task-schemas.ts                       # Validation schemas
└── session-complete/
    └── route.ts                          # POST session tracking
```

### Database

```
supabase_schema.sql                       # RLS policies
docs/
├── TASK_CREATE_FIX.md                    # Previous fix documentation
└── TASK_FLOW_ANALYSIS.md                 # This document
```

---

## 🎯 SUMMARY

**Luồng hoạt động hoàn chỉnh:**

1. ✅ **UI Layer:** Modern, responsive, với animations
2. ✅ **State Management:** React Query + Zustand
3. ✅ **API Routes:** RESTful với validation
4. ✅ **Database:** Supabase với RLS policies
5. ✅ **Authentication:** Cookie-based sessions
6. ✅ **Real-time:** Optimistic updates for speed
7. ✅ **Timer Integration:** Track pomodoros automatically
8. ✅ **Error Handling:** Comprehensive error messages
9. ✅ **Performance:** Cached queries, optimistic UI

**Đánh giá:**

- 🟢 **Architecture:** Solid, scalable
- 🟢 **Security:** RLS policies protecting data
- 🟢 **UX:** Fast, responsive with optimistic updates
- 🟢 **Code Quality:** Type-safe, well-structured
- 🟡 **Testing:** Could add more automated tests
- 🟡 **Documentation:** Good, could add API docs

**Kết luận:** Hệ thống task management hoạt động tốt với đầy đủ CRUD, security, và real-time updates. Ready for production! 🚀
