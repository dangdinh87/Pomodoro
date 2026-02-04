# Phase 07: Minor Improvements (Optional)

## Context

Additional minor issues discovered during analysis. These are low priority and optional.

## Overview

**Severity:** LOW
**Effort:** 30m
**Status:** Optional - implement if time permits

## Issues

### Issue 9: Hardcoded Sound Volume
**Severity:** LOW
**Files:** `use-timer-engine.ts:81`, `timer-controls.tsx:89`

Both files hardcode `audio.volume = 0.5`:

```typescript
const audio = new Audio('/sounds/alarm.mp3');
audio.volume = 0.5;  // Hardcoded
```

**Fix:** Could add volume setting to timer settings, or use system store.

### Issue 10: No Skip Hotkey
**Severity:** LOW
**File:** `use-timer-hotkeys.ts`

Current hotkeys:
- Space: Pause/Resume
- R: Reset
- Missing: Skip (could be S or N for "Next")

```typescript
// Could add:
else if (e.key === 's' || e.key === 'S') {
    e.preventDefault();
    // Trigger skip logic
}
```

**Note:** Skip has confirmation dialog, so hotkey implementation is more complex.

### Issue 11: Duplicate Timer Settings Files
**Severity:** LOW

Two timer-settings.tsx files exist:
- `src/components/settings/timer-settings.tsx` (full version, 498 lines)
- `src/app/(main)/timer/components/timer-settings.tsx` (simple version, 236 lines)

**Fix:** Consider consolidating or clearly documenting their different purposes.

## Implementation

These are optional improvements. Prioritize based on user needs.

## Todo List

- [ ] (Optional) Add volume setting to timer settings
- [ ] (Optional) Add skip hotkey with confirmation handling
- [ ] (Optional) Document or consolidate settings files

## Success Criteria

- Lower priority items addressed if time permits
- Core timer issues (Phase 1-4, 6) take precedence
