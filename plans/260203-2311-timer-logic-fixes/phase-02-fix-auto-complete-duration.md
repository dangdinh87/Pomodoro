# Phase 02: Fix Auto-Complete Duration

## Context

The timer engine records full configured duration when auto-completing instead of actual elapsed time. This inflates focus time statistics and creates inconsistency with manual skip behavior.

## Overview

**Severity:** MEDIUM
**Effort:** 30 minutes
**File:** `src/app/(main)/timer/hooks/use-timer-engine.ts`

Fix the auto-complete logic to record actual elapsed duration instead of full configured duration.

## Key Insights

1. **Root cause:** `handleLoopComplete` uses `currentSettings.workDuration * 60` (full config) instead of calculating elapsed
2. **Manual skip correct:** `timer-controls.tsx` correctly uses `totalTime - timeLeft`
3. **lastSessionTimeLeft:** Store tracks initial time at session start for this purpose
4. **Auto-complete triggers when:** `timeLeft` reaches 0 (remaining <= 0)

## Requirements

### Functional
- Auto-complete records actual elapsed duration
- Duration = `lastSessionTimeLeft - 0` (since timeLeft=0 at completion)
- Behavior consistent with manual session complete

### Non-Functional
- No changes to timer countdown logic
- Maintain accuracy of totalFocusTime accumulation

## Architecture

### Current Flow (Buggy)
```
handleLoopComplete():
  1. Get currentSettings
  2. duration = currentSettings.workDuration * 60  // Full duration
  3. Send to API with full duration
```

### Fixed Flow
```
handleLoopComplete():
  1. Get lastSessionTimeLeft from store (set at session start)
  2. duration = lastSessionTimeLeft  // Actual elapsed (since timeLeft=0)
  3. Send to API with actual duration
```

## Related Code

### Current Implementation (use-timer-engine.ts:85-91)
```typescript
// Record session
const duration =
  (currentMode === 'work'
    ? currentSettings.workDuration
    : currentMode === 'shortBreak'
      ? currentSettings.shortBreakDuration
      : currentSettings.longBreakDuration) * 60; // Approximate for auto-complete
```

### Manual Skip Implementation (timer-controls.tsx:101-103)
```typescript
const totalTime = getTotalTimeForMode();
const completedDuration = totalTime - timeLeft;  // Correct calculation
```

### lastSessionTimeLeft Management (timer-controls.tsx:144)
```typescript
useTimerStore.getState().setLastSessionTimeLeft(newDuration);  // Set on mode transition
```

### Store Definition (timer-store.ts:37)
```typescript
// Tracks timeLeft at the start of a focus period for accurate partial recording
lastSessionTimeLeft: number;
```

## Implementation Steps

### Step 1: Use lastSessionTimeLeft for Duration
**Location:** `use-timer-engine.ts`, `handleLoopComplete` function

Replace:
```typescript
const duration =
  (currentMode === 'work'
    ? currentSettings.workDuration
    : currentMode === 'shortBreak'
      ? currentSettings.shortBreakDuration
      : currentSettings.longBreakDuration) * 60;
```

With:
```typescript
// Use actual elapsed duration (lastSessionTimeLeft since timeLeft=0 at completion)
const lastSessionTimeLeft = useTimerStore.getState().lastSessionTimeLeft;
const duration = lastSessionTimeLeft; // Full elapsed since we completed
```

### Step 2: Ensure lastSessionTimeLeft is Set Correctly
Verify that `lastSessionTimeLeft` is set when:
1. Timer starts for first time (mode change)
2. After mode transition in auto-complete
3. After settings change while paused

Current implementation already handles this at:
- `timer-controls.tsx:144, 149, 157` (mode transitions)
- `use-timer-engine.ts:137, 142, 150` (auto-complete transitions)

### Step 3: Add Fallback for Edge Cases
```typescript
const lastSessionTimeLeft = useTimerStore.getState().lastSessionTimeLeft;
// Fallback to config duration if lastSessionTimeLeft is invalid
const configDuration = (currentMode === 'work'
    ? currentSettings.workDuration
    : currentMode === 'shortBreak'
      ? currentSettings.shortBreakDuration
      : currentSettings.longBreakDuration) * 60;
const duration = lastSessionTimeLeft > 0 ? lastSessionTimeLeft : configDuration;
```

## Todo List

- [ ] Replace duration calculation in `handleLoopComplete`
- [ ] Use `lastSessionTimeLeft` from store state
- [ ] Add fallback for invalid `lastSessionTimeLeft`
- [ ] Verify `lastSessionTimeLeft` set correctly on all mode transitions
- [ ] Test: Auto-complete after full session - duration = config
- [ ] Test: Auto-complete after settings change mid-session - duration = actual elapsed

## Success Criteria

1. Auto-completed session records same duration as if manually completed at 0
2. `lastSessionTimeLeft` correctly reflects initial time at session start
3. No inflation in focus time statistics
4. Fallback handles edge cases gracefully

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| lastSessionTimeLeft not initialized | Medium | Fallback to config duration |
| State race condition | Low | Read from store.getState() is sync |
| Rehydration issues | Low | Default value in store handles this |

## Security Considerations

None - duration calculation is client-side and validated server-side.

## Next Steps

After implementation:
1. Compare auto-complete duration with manual complete duration
2. Verify history page shows accurate times
3. Proceed to Phase 3 (mode switch confirmation)
