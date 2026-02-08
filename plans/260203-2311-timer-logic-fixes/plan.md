---
title: "Fix Timer Logic Issues"
description: "Address timer logic bugs: session count, duration, mode switch, taskId validation, and settings sync"
status: completed
priority: P2
effort: 6.5h
branch: feature/update-UI
tags: [timer, bugfix, session-management, ux, settings]
created: 2026-02-03
updated: 2026-02-04
---

# Timer Logic Fixes Plan

## Summary

This plan addresses timer logic issues discovered in the Pomodoro timer implementation:

### Core Issues (Phase 1-4)
| # | Issue | Severity | Effort | File |
|---|-------|----------|--------|------|
| 1 | Session count inconsistency | HIGH | 30m | timer-controls.tsx |
| 2 | Auto-complete uses full duration | MEDIUM | 30m | use-timer-engine.ts |
| 3 | No confirm on mode switch while running | MEDIUM | 1h | timer-mode-selector.tsx |
| 4 | activeTaskId not validated | LOW | 1h | session-complete/route.ts |

### Additional Issues (Phase 5-8)
| # | Issue | Severity | Effort | Files |
|---|-------|----------|--------|-------|
| 5 | Engine session count (analysis) | - | - | Resolved: Not a bug |
| 6 | Settings sync issues | MEDIUM | 1h | timer-store, settings, mode-selector |
| 7 | Minor improvements | LOW | 30m | Various (optional) |
| 8 | Timer Guide Popup | MEDIUM | 1.5h | New component + i18n |

### Phase 6 Sub-issues
| Sub | Issue | Description |
|-----|-------|-------------|
| 6a | Dual localStorage | `pomodoro-timer-settings` written but never read |
| 6b | lastSessionTimeLeft not synced | updateSettings doesn't sync on timeLeft change |
| 6c | Mode switch no lastSessionTimeLeft | switchMode doesn't set lastSessionTimeLeft |

## Root Cause Analysis

### Issue 1: Session Count Inconsistency
**File:** `src/app/(main)/timer/components/timer-controls.tsx:137-138`

```typescript
const newSessionCount = sessionCount + 1;  // Always increments (local calc)
if (isValidSession) incrementSessionCount(); // Conditional store update
```

**Problem:** `newSessionCount` used for long break check but store `sessionCount` only increments on valid (>=50%) sessions. Invalid sessions still trigger long break at wrong time.

**Example:** After 3 valid + 1 skipped session, `newSessionCount=4` triggers long break but `sessionCount=3`.

### Issue 2: Auto-Complete Uses Full Duration
**File:** `src/app/(main)/timer/hooks/use-timer-engine.ts:86-91`

```typescript
const duration = currentSettings.workDuration * 60; // Full config duration
```

**Problem:** Auto-complete always records full configured duration instead of actual elapsed time. Manual skip correctly uses `totalTime - timeLeft`.

**Impact:** Inflated focus time stats when auto-complete fires.

### Issue 3: No Confirm on Mode Switch While Running
**File:** `src/app/(main)/timer/components/timer-mode-selector.tsx:17-29`

```typescript
const switchMode = (newMode: TimerMode) => {
    setIsRunning(false); // Silently stops
    // ...no confirmation
};
```

**Problem:** User loses progress without warning when clicking mode tabs during active session.

### Issue 4: activeTaskId Not Validated
**File:** `src/app/api/tasks/session-complete/route.ts:53-62`

```typescript
if (taskId && mode === 'work') {
    const { error: incError } = await supabase.rpc('increment_task_pomodoro', {
        task_id_input: taskId, // May not exist or belong to user
        // ...
    });
    if (incError) console.error(...); // Silent fail, session still recorded
}
```

**Problem:** If task deleted or belongs to different user, RPC fails but session records with invalid taskId. Creates orphaned data.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Timer System                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌─────────────────────┐               │
│  │ TimerModeSelector │───▶│   timer-store.ts    │               │
│  │   (Issue 3)       │    │   (state mgmt)      │               │
│  └──────────────────┘    └─────────────────────┘               │
│           │                        │                            │
│           ▼                        ▼                            │
│  ┌──────────────────┐    ┌─────────────────────┐               │
│  │  TimerControls    │───▶│  useTimerEngine     │               │
│  │   (Issue 1)       │    │    (Issue 2)        │               │
│  └──────────────────┘    └─────────────────────┘               │
│           │                        │                            │
│           └────────────┬───────────┘                            │
│                        ▼                                        │
│               ┌─────────────────────┐                           │
│               │ /api/tasks/         │                           │
│               │ session-complete    │                           │
│               │   (Issue 4)         │                           │
│               └─────────────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Phase Overview

### Phase 1: Fix Session Count Logic (HIGH)
- Modify long break calculation to use actual `sessionCount` post-increment
- Ensure only valid sessions count toward 4-session cycle
- **File:** timer-controls.tsx

### Phase 2: Fix Auto-Complete Duration (MEDIUM)
- Use `lastSessionTimeLeft` to calculate actual elapsed duration
- Align with manual skip behavior
- **File:** use-timer-engine.ts

### Phase 3: Add Mode Switch Confirmation (MEDIUM)
- Add AlertDialog when `isRunning === true`
- Options: "Discard and switch" or "Cancel"
- Add i18n strings
- **File:** timer-mode-selector.tsx, en.json, vi.json

### Phase 4: Validate activeTaskId (LOW)
- Validate task exists and belongs to user before recording
- Clear invalid taskId, log warning
- **File:** session-complete/route.ts

### Phase 5: Engine Session Count Analysis (RESOLVED)
- Analyzed engine vs controls session count logic
- **Result:** Not a bug - auto-complete always counts as valid (100% completion)
- See `phase-05-fix-engine-session-count.md` for analysis

### Phase 6: Fix Settings Issues (MEDIUM)
- **6a:** Remove dead localStorage code (`pomodoro-timer-settings`)
- **6b:** Sync `lastSessionTimeLeft` when `updateSettings()` changes `timeLeft`
- **6c:** Add `lastSessionTimeLeft` to mode switch
- **Files:** timer-store.ts, timer-settings.tsx (x2), timer-mode-selector.tsx

### Phase 7: Minor Improvements (OPTIONAL)
- Hardcoded sound volume → could add setting
- No skip hotkey → could add 'S' key
- Duplicate settings files → could consolidate

### Phase 8: Timer Guide Popup (MEDIUM)
- Show onboarding guide on first visit
- Explain: modes, valid sessions (≥50%), keyboard shortcuts, task linking
- "Don't show again" preference with version-based reset
- **Files:** New `timer-guide-dialog.tsx` + enhanced-timer.tsx + i18n

## Dependencies

- All phases are independent and can be implemented in parallel
- Phase 3 requires AlertDialog component (already exists)
- Phase 3 requires i18n updates

## Testing Strategy

### Unit Tests (if applicable)
- Session count logic edge cases
- Duration calculation accuracy

### Manual Testing Checklist
- [ ] Skip session <50% - verify no long break at session 4
- [ ] Complete 4 valid sessions - verify long break triggers
- [ ] Let timer auto-complete - verify recorded duration matches elapsed
- [ ] Switch mode while running - verify confirmation dialog appears
- [ ] Create session with deleted task - verify graceful handling
- [ ] Change settings while paused - verify both timeLeft and lastSessionTimeLeft update
- [ ] Switch mode - verify lastSessionTimeLeft is set correctly
- [ ] Check localStorage - verify no `pomodoro-timer-settings` key exists
- [ ] First visit - verify guide popup appears
- [ ] "Don't show again" - verify preference persists

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking existing session flow | Thorough manual testing of all paths |
| Regression in auto-start behavior | Test auto-start combinations |
| i18n string mismatches | Update both en.json and vi.json |

## Success Criteria

1. Long break triggers only after 4 **valid** sessions (>=50% completion)
2. Recorded duration matches actual elapsed time in all scenarios
3. Mode switch while running shows confirmation dialog
4. Invalid taskId handled gracefully without orphaned data
5. No redundant localStorage writes (dead code removed)
6. Settings changes sync both `timeLeft` and `lastSessionTimeLeft`
7. Mode switch sets `lastSessionTimeLeft` correctly
8. Timer guide popup appears on first visit with clear instructions
9. "Don't show again" preference works with version-based reset

## Files Modified

1. `src/app/(main)/timer/components/timer-controls.tsx` (Phase 1)
2. `src/app/(main)/timer/hooks/use-timer-engine.ts` (Phase 2)
3. `src/app/(main)/timer/components/timer-mode-selector.tsx` (Phase 3, 6c)
4. `src/app/api/tasks/session-complete/route.ts` (Phase 4)
5. `src/i18n/locales/en.json` (Phase 3, 8)
6. `src/i18n/locales/vi.json` (Phase 3, 8)
7. `src/stores/timer-store.ts` (Phase 6b)
8. `src/components/settings/timer-settings.tsx` (Phase 6a)
9. `src/app/(main)/timer/components/timer-settings.tsx` (Phase 6a)
10. `src/components/timer/timer-guide-dialog.tsx` (Phase 8 - NEW)
11. `src/app/(main)/timer/components/enhanced-timer.tsx` (Phase 8)

## Implementation Order

Recommended sequence (by severity):
1. **Phase 1** - Session count (HIGH) - foundational fix
2. **Phase 2** - Duration (MEDIUM) - data accuracy
3. **Phase 6** - Settings sync (MEDIUM) - data integrity
4. **Phase 3** - Mode switch (MEDIUM) - UX improvement
5. **Phase 4** - TaskId validation (LOW) - data integrity
6. **Phase 7** - Minor improvements (LOW/OPTIONAL)
7. **Phase 8** - Timer Guide Popup (MEDIUM) - user onboarding

Note: Phase 5 is resolved (not a bug). Phase 8 should be implemented LAST as it documents all the changes.

## Related Documentation

- `phase-01-fix-session-count-logic.md` - Session count inconsistency
- `phase-02-fix-auto-complete-duration.md` - Auto-complete duration
- `phase-03-add-mode-switch-confirmation.md` - Mode switch confirmation
- `phase-04-validate-active-taskid.md` - TaskId validation
- `phase-05-fix-engine-session-count.md` - Analysis (resolved)
- `phase-06-fix-settings-issues.md` - Settings sync issues
- `phase-07-minor-improvements.md` - Optional improvements
- `phase-08-timer-guide-popup.md` - User onboarding guide

## Validation Summary

**Validated:** 2026-02-03
**Questions asked:** 5

### Confirmed Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Long break on skipped sessions | **No** | Only valid sessions (>=50%) count toward 4-session cycle |
| API response for invalid taskId | **Silent sanitization** | Record with task_id=null, no warning to client |
| Cancel mode switch behavior | **Keep running** | Timer stays running, no pause/resume needed |
| Code DRY (shared completion logic) | **Keep separate** | Engine = auto-complete, Controls = manual skip - different purposes |
| Implementation order | **By severity** | Phase 1→2→3→4 (HIGH→MEDIUM→MEDIUM→LOW) |
| Auto-trigger task todo→doing | **Keep** | Khi select task, tự động chuyển status từ 'todo' → 'doing' |
| Auto-done khi đủ pomodoros | **No** | Không auto-done khi actualPomodoros >= estimatePomodoros. User tự quyết định mark done |

### Action Items
- [x] Plan validated - no changes required
- [x] Implementation completed (2026-02-04)
  - Phase 1: Session count logic fixed
  - Phase 2: Auto-complete duration fixed
  - Phase 3: Mode switch confirmation added
  - Phase 4: activeTaskId validation added
  - Phase 6: Settings sync issues fixed
  - Phase 8: Timer guide popup added
