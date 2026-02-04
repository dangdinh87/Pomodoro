# Brainstorm Report: Timer Logic Issues

**Date:** 2026-02-03
**Branch:** feature/update-UI
**Focus:** Timer actions, task interaction, session recording

---

## Problem Statement

User báo timer feature hoạt động chưa đúng mong muốn. Cần kiểm tra kỹ:
- Tất cả timer actions (pause, resume, reset, skip, mode switch)
- Timer-Task interaction
- Session recording accuracy

---

## Architecture Overview

### Timer State Flow
```
User Action → Timer Store → Timer Engine (useEffect loop) → UI Update
                ↓
         Session Complete → API → Database → Query Invalidation
```

### Key Components
| File | Purpose |
|------|---------|
| `timer-store.ts` | Zustand state management + persistence |
| `use-timer-engine.ts` | 250ms tick loop, deadline-based timing |
| `timer-controls.tsx` | Play/pause/skip/reset actions |
| `timer-mode-selector.tsx` | Mode tabs (work/short/long) |
| `task-selector.tsx` | Task focus selection |

---

## Issues Identified

### Issue 1: Session Count Inconsistency on Skip (HIGH)
**Location:** `timer-controls.tsx:137-138`
```typescript
const newSessionCount = sessionCount + 1;  // Always +1
if (isValidSession) incrementSessionCount(); // Conditional
```
**Problem:** `newSessionCount` used for long break check, but actual `sessionCount` only increments when valid session. Long break timing becomes inconsistent if user skips sessions <50%.

**Fix:** Use `sessionCount` directly for long break check, or increment unconditionally for break timing.

---

### Issue 2: Auto-Complete Uses Full Duration (MEDIUM)
**Location:** `use-timer-engine.ts:86-91`
```typescript
const duration = currentSettings.workDuration * 60; // Full duration
```
**vs** `timer-controls.tsx:102`
```typescript
const completedDuration = totalTime - timeLeft; // Actual duration
```
**Problem:** Auto-complete records full session duration even if user paused mid-way.

**Fix:** Calculate actual elapsed time in engine similar to controls.

---

### Issue 3: No Confirm on Mode Switch While Running (MEDIUM)
**Location:** `timer-mode-selector.tsx:17-29`
**Problem:** User can accidentally switch modes while timer running, losing progress without warning.

**Fix:** Add confirmation dialog when `isRunning === true`.

---

### Issue 4: activeTaskId Not Validated (LOW)
**Location:** `use-timer-engine.ts:96-98`
**Problem:** If task deleted while focused, session still records with invalid taskId. API silently fails on pomodoro increment.

**Fix:** Validate task exists in API before recording, or clear activeTaskId when task deleted.

---

## What's Working Correctly

- ✅ Pause/Resume - State consistency maintained
- ✅ Reset - Handles normal + plan mode correctly
- ✅ Deadline-based accuracy - 250ms tick with absolute deadline
- ✅ BUG-01 to BUG-08 fixes - All properly addressed
- ✅ Skip dialog auto-close (BUG-04)
- ✅ Focus time delta accumulation
- ✅ Mutex for concurrent completion prevention (BUG-05)

---

## Recommended Solution

### Priority Order
1. **Issue 1** - Fix session count logic (affects core pomodoro mechanics)
2. **Issue 2** - Fix auto-complete duration (data accuracy)
3. **Issue 3** - Add mode switch confirmation (UX safety)
4. **Issue 4** - Validate activeTaskId (data integrity)

### Implementation Approach
- **Issue 1 & 2**: Modify `use-timer-engine.ts` and `timer-controls.tsx`
- **Issue 3**: Modify `timer-mode-selector.tsx`, add AlertDialog
- **Issue 4**: Modify `session-complete/route.ts` API to validate task

### Risk Assessment
- Low risk changes - isolated to timer module
- No database schema changes needed
- Backward compatible with existing persisted state

---

## Success Metrics

1. Session count increments correctly on both auto-complete and manual skip
2. Recorded duration matches actual elapsed time
3. User gets confirmation before losing in-progress session
4. Invalid task IDs handled gracefully

---

## Next Steps

Create detailed implementation plan with `/plan:hard` to:
- Define exact code changes
- Identify test scenarios
- Plan validation approach

---

## Unresolved Questions

None - all behaviors clarified through code analysis.
