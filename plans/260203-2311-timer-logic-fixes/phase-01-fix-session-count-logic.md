# Phase 01: Fix Session Count Logic

## Context

The timer controls component has a bug in session count handling that causes incorrect long break scheduling. The issue affects core Pomodoro workflow integrity.

## Overview

**Severity:** HIGH
**Effort:** 30 minutes
**File:** `src/app/(main)/timer/components/timer-controls.tsx`

Fix the session count inconsistency where `newSessionCount` is calculated independently from actual store state, causing long breaks to trigger at incorrect times.

## Key Insights

1. **Root cause:** Local `newSessionCount = sessionCount + 1` always increments, but store only increments on valid sessions
2. **Long break logic:** Uses `newSessionCount` which includes invalid sessions in count
3. **Expected behavior:** Only valid (>=50% completion) sessions should count toward 4-session cycle
4. **Current code location:** Lines 137-152 in `handleSessionComplete`

## Requirements

### Functional
- Long break triggers only after 4 **valid** sessions
- Invalid/skipped sessions do not count toward long break cycle
- Session count state remains accurate across all paths

### Non-Functional
- No changes to session recording logic
- Maintain backward compatibility with persisted state

## Architecture

### Current Flow (Buggy)
```
handleSessionComplete():
  1. Calculate newSessionCount = sessionCount + 1 (always)
  2. if (isValidSession) incrementSessionCount() (conditional)
  3. Check newSessionCount % 4 === 0 for long break (uses wrong value)
```

### Fixed Flow
```
handleSessionComplete():
  1. if (isValidSession) incrementSessionCount() (conditional)
  2. Get updated sessionCount from store
  3. Check updatedSessionCount % 4 === 0 for long break (uses correct value)
```

## Related Code

### Current Implementation (timer-controls.tsx:135-160)
```typescript
// Transition Logic
if (mode === 'work') {
    const newSessionCount = sessionCount + 1;  // BUG: Always increments
    if (isValidSession) incrementSessionCount();

    if (newSessionCount % settings.longBreakInterval === 0) {  // BUG: Uses wrong count
        setMode('longBreak');
        // ...
    } else {
        setMode('shortBreak');
        // ...
    }
}
```

### Store incrementSessionCount (timer-store.ts:116-117)
```typescript
incrementSessionCount: () =>
  set((state: TimerState) => ({ sessionCount: state.sessionCount + 1 })),
```

## Implementation Steps

### Step 1: Refactor Session Count Logic
**Location:** `timer-controls.tsx`, `handleSessionComplete` function

```typescript
// Transition Logic
if (mode === 'work') {
    // Increment session count FIRST (only if valid)
    if (isValidSession) {
        incrementSessionCount();
    }

    // Get the UPDATED session count from store
    const updatedSessionCount = useTimerStore.getState().sessionCount;

    // Use updated count for long break check
    if (updatedSessionCount > 0 && updatedSessionCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
        const newDuration = settings.longBreakDuration * 60;
        setTimeLeft(newDuration);
        useTimerStore.getState().setLastSessionTimeLeft(newDuration);
        if (settings.autoStartBreak && !skipWithoutRecording) setIsRunning(true);
    } else {
        setMode('shortBreak');
        const newDuration = settings.shortBreakDuration * 60;
        setTimeLeft(newDuration);
        useTimerStore.getState().setLastSessionTimeLeft(newDuration);
        if (settings.autoStartBreak && !skipWithoutRecording) setIsRunning(true);
    }
} else {
    // Break transition logic (unchanged)
    setMode('work');
    const newDuration = settings.workDuration * 60;
    setTimeLeft(newDuration);
    useTimerStore.getState().setLastSessionTimeLeft(newDuration);
    if (settings.autoStartWork && !skipWithoutRecording) setIsRunning(true);
}
```

### Step 2: Add Guard for Edge Cases
Ensure `updatedSessionCount > 0` before modulo check to prevent long break on first incomplete session.

## Todo List

- [ ] Modify `handleSessionComplete` to increment before checking
- [ ] Use `useTimerStore.getState().sessionCount` for updated value
- [ ] Add `> 0` guard to prevent edge case
- [ ] Test: Skip 4 sessions in a row - should NOT trigger long break
- [ ] Test: Complete 4 valid sessions - SHOULD trigger long break
- [ ] Test: Mix of valid/invalid - only valid count toward cycle

## Success Criteria

1. Skipping 4 sessions (<50%) does NOT trigger long break
2. Completing 4 valid sessions (>=50%) triggers long break
3. Mix scenario: 3 valid + 1 skip = no long break; 4 valid = long break
4. No regression in auto-start behavior

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Race condition reading store | Low | Zustand sync updates are immediate |
| Breaking existing session flow | Medium | Manual test all paths |
| Edge case: sessionCount=0 | Low | Add > 0 guard |

## Security Considerations

None - client-side timer logic only.

## Next Steps

After implementation:
1. Test manually with various session completion scenarios
2. Verify persisted state loads correctly after page refresh
3. Proceed to Phase 2 (auto-complete duration fix)
