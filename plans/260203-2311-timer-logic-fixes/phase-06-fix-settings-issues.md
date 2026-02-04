# Phase 06: Fix Timer Settings Issues

## Context

Multiple settings-related issues discovered during deep analysis of timer settings implementation.

## Overview

**Severity:** LOW-MEDIUM
**Effort:** 1h
**Files:**
- `src/components/settings/timer-settings.tsx`
- `src/app/(main)/timer/components/timer-settings.tsx`
- `src/stores/timer-store.ts`
- `src/app/(main)/timer/components/timer-mode-selector.tsx`

## Issues

### Issue 6: Dual localStorage (never read)
**Severity:** LOW

Both timer-settings.tsx files write to `pomodoro-timer-settings` but this key is NEVER read.

```typescript
// timer-settings.tsx:104-106
updateSettings(normalized)  // → saves to timer-storage via Zustand
localStorage.setItem('pomodoro-timer-settings', JSON.stringify(normalized))  // DEAD CODE!
```

**Fix:** Remove the redundant `localStorage.setItem` call.

### Issue 7: lastSessionTimeLeft not synced
**Severity:** MEDIUM

When `updateSettings()` updates `timeLeft`, it doesn't sync `lastSessionTimeLeft`. This can cause incorrect duration calculations.

```typescript
// timer-store.ts:169-182 - MISSING sync
if (!state.isRunning && !state.usePlan) {
  if (state.mode === 'work' && newSettings.workDuration) {
    nextState.timeLeft = newSettings.workDuration * 60;
    // nextState.lastSessionTimeLeft = newSettings.workDuration * 60;  ← MISSING!
  }
}
```

**Fix:** Add `lastSessionTimeLeft` sync when `timeLeft` is updated.

### Issue 8: Mode switch no lastSessionTimeLeft
**Severity:** LOW

`switchMode()` in timer-mode-selector.tsx doesn't set `lastSessionTimeLeft`.

```typescript
// timer-mode-selector.tsx:17-29
const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setDeadlineAt(null);
    setMode(newMode);
    setTimeLeft(settings.workDuration * 60);  // Sets timeLeft
    // Missing: setLastSessionTimeLeft()
};
```

**Fix:** Add `setLastSessionTimeLeft()` call after `setTimeLeft()`.

## Implementation Steps

### Step 1: Remove Dead localStorage Code

In both `src/components/settings/timer-settings.tsx` and `src/app/(main)/timer/components/timer-settings.tsx`:

```typescript
// REMOVE this line:
localStorage.setItem('pomodoro-timer-settings', JSON.stringify(normalized))
```

### Step 2: Sync lastSessionTimeLeft in updateSettings

In `src/stores/timer-store.ts`:

```typescript
updateSettings: (newSettings: Partial<TimerSettings>) =>
  set((state: TimerState) => {
    // ... validation code ...

    const nextSettings = { ...state.settings, ...newSettings };
    const nextState: Partial<TimerState> = {
      settings: nextSettings,
    };

    if (!state.isRunning && !state.usePlan) {
      if (state.mode === 'work' && newSettings.workDuration) {
        const newTimeLeft = newSettings.workDuration * 60;
        nextState.timeLeft = newTimeLeft;
        nextState.lastSessionTimeLeft = newTimeLeft;  // ADD THIS
      } else if (state.mode === 'shortBreak' && newSettings.shortBreakDuration) {
        const newTimeLeft = newSettings.shortBreakDuration * 60;
        nextState.timeLeft = newTimeLeft;
        nextState.lastSessionTimeLeft = newTimeLeft;  // ADD THIS
      } else if (state.mode === 'longBreak' && newSettings.longBreakDuration) {
        const newTimeLeft = newSettings.longBreakDuration * 60;
        nextState.timeLeft = newTimeLeft;
        nextState.lastSessionTimeLeft = newTimeLeft;  // ADD THIS
      }
    }
    return nextState;
  }),
```

### Step 3: Add lastSessionTimeLeft to mode switch

In `src/app/(main)/timer/components/timer-mode-selector.tsx`:

```typescript
const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setDeadlineAt(null);
    setMode(newMode);

    let newDuration: number;
    if (newMode === 'work') {
        newDuration = settings.workDuration * 60;
    } else if (newMode === 'shortBreak') {
        newDuration = settings.shortBreakDuration * 60;
    } else {
        newDuration = settings.longBreakDuration * 60;
    }

    setTimeLeft(newDuration);
    useTimerStore.getState().setLastSessionTimeLeft(newDuration);  // ADD THIS
};
```

## Todo List

- [ ] Remove dead localStorage code from settings components
- [ ] Sync lastSessionTimeLeft in updateSettings
- [ ] Add lastSessionTimeLeft to mode switch
- [ ] Test settings changes update both timeLeft and lastSessionTimeLeft
- [ ] Test mode switch sets lastSessionTimeLeft

## Success Criteria

1. No redundant localStorage writes
2. Changing settings updates both timeLeft and lastSessionTimeLeft
3. Switching modes sets lastSessionTimeLeft correctly
4. Duration calculations are accurate after settings changes

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing behavior | Low | Thorough testing |
| localStorage cleanup | None | Old key is never read |
