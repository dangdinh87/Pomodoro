# Timer Logic Fixes - Task Extraction Report

**Plan:** Timer Logic Fixes Plan
**Plan Path:** plans/260203-2311-timer-logic-fixes/
**Analyzed:** 2026-02-04
**Report Type:** Task Extraction & Structured Breakdown

---

## Phase Summary

- **Total phases:** 8
- **Phases to implement:** 6 (Phase 5 = resolved, Phase 7 = optional, Phase 8 = last)
- **Implementation order:** Phase 1 → 2 → 6 → 3 → 4 → 8

### Files to Modify

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

### Dependencies

- No blocking dependencies between phases
- Phase 3 requires AlertDialog component (already exists)
- Phase 3 & 8 require i18n updates
- Phase 8 should be implemented LAST as it documents all changes

---

## Tasks by Phase

### Phase 1: Fix Session Count Logic (HIGH, 30m)

**Context:** Long break triggers at wrong time because `newSessionCount` calculated locally always increments, but store only increments on valid (≥50%) sessions.

**Acceptance Criteria:**
1. Skipping 4 sessions (<50%) does NOT trigger long break
2. Completing 4 valid sessions (≥50%) DOES trigger long break
3. No regression in auto-start behavior

**File:** `src/app/(main)/timer/components/timer-controls.tsx`

**Tasks:**
- 1.1 Modify `handleSessionComplete()` to increment `sessionCount` BEFORE checking
- 1.2 Use `useTimerStore.getState().sessionCount` to read updated value post-increment
- 1.3 Add guard clause `updatedSessionCount > 0` before modulo check
- 1.4 Set `lastSessionTimeLeft` for short/long break modes (already in code)
- 1.5 Manual test: Skip 4 sessions → No long break
- 1.6 Manual test: Complete 4 valid sessions → Long break triggers
- 1.7 Manual test: Mix scenarios (3 valid + 1 skip = no long break)

---

### Phase 2: Fix Auto-Complete Duration (MEDIUM, 30m)

**Context:** Auto-complete records full configured duration instead of actual elapsed time. Manual skip correctly uses `totalTime - timeLeft`.

**Acceptance Criteria:**
1. Auto-completed session records same duration as manual complete at 0
2. `lastSessionTimeLeft` correctly reflects initial time at session start
3. No inflation in focus time statistics
4. Fallback handles edge cases gracefully

**File:** `src/app/(main)/timer/hooks/use-timer-engine.ts`

**Tasks:**
- 2.1 Replace duration calculation in `handleLoopComplete()` function
- 2.2 Use `useTimerStore.getState().lastSessionTimeLeft` instead of config duration
- 2.3 Add fallback: if `lastSessionTimeLeft > 0` use it, else use config duration
- 2.4 Verify `lastSessionTimeLeft` is set on all mode transitions (check lines 137, 142, 150)
- 2.5 Manual test: Auto-complete full session → duration = config value
- 2.6 Manual test: Auto-complete after settings change → duration = actual elapsed

---

### Phase 3: Add Mode Switch Confirmation (MEDIUM, 1h)

**Context:** Users can switch modes while timer running without warning, losing progress.

**Acceptance Criteria:**
1. Clicking mode tab while paused → switches immediately
2. Clicking mode tab while running → shows confirmation dialog
3. Canceling → keeps current mode and timer state
4. Confirming → switches mode and resets timer
5. Dialog text displays correctly in EN and VI

**File:** `src/app/(main)/timer/components/timer-mode-selector.tsx`

**Tasks:**
- 3.1 Add imports: useState, AlertDialog components
- 3.2 Subscribe to `isRunning` from useTimerStore
- 3.3 Add state variables: `confirmOpen` (boolean), `pendingMode` (TimerMode | null)
- 3.4 Create `handleModeChange()` handler with logic:
  - If same mode: return
  - If running: set pending + open dialog
  - If not running: switch immediately
- 3.5 Create `handleConfirmedSwitch()` to close dialog and call `switchMode(pendingMode)`
- 3.6 Create `handleCancelSwitch()` to close dialog without switching
- 3.7 Update Tabs `onValueChange` to call `handleModeChange()` instead of `switchMode()`
- 3.8 Add AlertDialog JSX with proper structure
- 3.9 Add i18n strings to en.json: mode_switch_confirm.{title, description, confirm}
- 3.10 Add i18n strings to vi.json: mode_switch_confirm.{title, description, confirm}
- 3.11 Manual test: Switch while paused → immediate
- 3.12 Manual test: Switch while running → confirmation appears
- 3.13 Manual test: Both EN and VI locales

---

### Phase 4: Validate activeTaskId (LOW, 1h)

**Context:** Session records with unvalidated taskId; deleted/foreign tasks create orphaned data.

**Acceptance Criteria:**
1. Valid taskId: Session records with task, RPC updates progress
2. Invalid taskId: Session records with `task_id: null`, no error
3. Server logs warning for invalid taskId (not error)
4. No 500 errors from invalid taskId
5. Client behavior unchanged (receives session data)

**File:** `src/app/api/tasks/session-complete/route.ts`

**Tasks:**
- 4.1 Add task validation query after parsing request body
- 4.2 Create `validatedTaskId` variable initialized to null
- 4.3 If taskId provided: query tasks table for matching id + user_id
- 4.4 If task not found: log warning, keep validatedTaskId = null
- 4.5 If task found: set validatedTaskId = taskId
- 4.6 Update session insert to use `validatedTaskId` instead of `taskId`
- 4.7 Update task progress conditional: only call RPC if `validatedTaskId` truthy
- 4.8 Manual test: Valid taskId → session with task
- 4.9 Manual test: Invalid taskId → session without task
- 4.10 Manual test: Deleted task → session without task
- 4.11 Manual test: Another user's task → session without task

---

### Phase 6: Fix Settings Issues (MEDIUM, 1h)

**Context:** Multiple settings-related bugs: dead localStorage code, missing lastSessionTimeLeft sync, mode switch doesn't set lastSessionTimeLeft.

**Acceptance Criteria:**
1. No redundant localStorage writes
2. Changing settings updates both `timeLeft` and `lastSessionTimeLeft`
3. Switching modes sets `lastSessionTimeLeft` correctly
4. Duration calculations accurate after settings changes

**Sub-Issues & Tasks:**

#### 6a: Remove Dead localStorage Code (LOW)
**File:** `src/components/settings/timer-settings.tsx` + `src/app/(main)/timer/components/timer-settings.tsx`

- 6a.1 Remove `localStorage.setItem('pomodoro-timer-settings', ...)` from component 1
- 6a.2 Remove `localStorage.setItem('pomodoro-timer-settings', ...)` from component 2
- 6a.3 Verify no other code reads `pomodoro-timer-settings` key

#### 6b: Sync lastSessionTimeLeft in updateSettings (MEDIUM)
**File:** `src/stores/timer-store.ts`

- 6b.1 Find `updateSettings` function in timer-store
- 6b.2 When `timeLeft` updates for work mode: also set `lastSessionTimeLeft = newTimeLeft`
- 6b.3 When `timeLeft` updates for shortBreak mode: also set `lastSessionTimeLeft = newTimeLeft`
- 6b.4 When `timeLeft` updates for longBreak mode: also set `lastSessionTimeLeft = newTimeLeft`
- 6b.5 Only apply when `!state.isRunning && !state.usePlan`
- 6b.6 Manual test: Change work duration → both timeLeft and lastSessionTimeLeft update

#### 6c: Add lastSessionTimeLeft to Mode Switch (LOW)
**File:** `src/app/(main)/timer/components/timer-mode-selector.tsx` (also done in Phase 3)

- 6c.1 In `switchMode()` function, after `setTimeLeft(newDuration)` call:
- 6c.2 Add `useTimerStore.getState().setLastSessionTimeLeft(newDuration)`
- 6c.3 Manual test: Switch mode → lastSessionTimeLeft is set

---

### Phase 8: Timer Guide Popup (MEDIUM, 1.5h)

**Context:** User onboarding guide explaining updated timer features.

**Acceptance Criteria:**
1. Guide popup appears on first visit
2. "Don't show again" persists preference
3. Version suffix allows forcing guide on major updates
4. Content clear and helpful
5. Responsive on mobile
6. Accessible via keyboard

**Files:** NEW `src/components/timer/timer-guide-dialog.tsx` + `src/app/(main)/timer/components/enhanced-timer.tsx` + i18n

**Tasks:**
- 8.1 Create new `src/components/timer/timer-guide-dialog.tsx` component
  - Export `TimerGuideDialog` functional component
  - Props: `open` (boolean), `onClose(dontShowAgain)` callback
  - Use Dialog, Button, Checkbox components
  - Sections: modes, valid sessions, keyboard, task linking, settings
- 8.2 Add state for `dontShowAgain` checkbox
- 8.3 Use icons from lucide-react: Timer, CheckCircle, Keyboard, ListTodo, Settings
- 8.4 Make scrollable on mobile (max-h-[80vh] overflow-y-auto)
- 8.5 Add i18n strings to `src/i18n/locales/en.json`:
  - timerGuide.title, timerGuide.modes.{title, work, shortBreak, longBreak}
  - timerGuide.validSession.{title, rule, skip}
  - timerGuide.keyboard.{title, space, reset}
  - timerGuide.task.{title, select, auto}
  - timerGuide.settings.{title, customize, autoStart}
  - timerGuide.{dontShowAgain, gotIt}
- 8.6 Add same i18n strings to `src/i18n/locales/vi.json`
- 8.7 Integrate into `src/app/(main)/timer/components/enhanced-timer.tsx`:
  - Add `GUIDE_VERSION = 'v1'` constant
  - Add `GUIDE_STORAGE_KEY = 'timer-guide-shown-v1'`
  - Add state: `showGuide` (boolean)
  - useEffect on mount: check localStorage for guide key
  - If not seen: setTimeout 500ms then `setShowGuide(true)`
  - Add `handleCloseGuide()` callback
- 8.8 Render `<TimerGuideDialog open={showGuide} onClose={handleCloseGuide} />`
- 8.9 Manual test: First visit → guide appears
- 8.10 Manual test: Check "don't show again" → guide doesn't appear on refresh
- 8.11 Manual test: Change GUIDE_VERSION → guide appears again
- 8.12 Manual test: Mobile responsive
- 8.13 Manual test: Both EN and VI locales

---

## Implementation Order Rationale

1. **Phase 1 (HIGH)** - Foundational fix, core Pomodoro logic
2. **Phase 2 (MEDIUM)** - Data accuracy issue, affects statistics
3. **Phase 6 (MEDIUM)** - Settings data integrity, blocks accurate duration calculations
4. **Phase 3 (MEDIUM)** - UX improvement, prevents data loss
5. **Phase 4 (LOW)** - Data integrity, prevents orphaned records
6. **Phase 8 (MEDIUM)** - User onboarding, documents all changes (implement LAST)

---

## Testing Requirements

### Unit Tests (if applicable)
- Session count edge cases
- Duration calculation accuracy

### Manual Testing Checklist

**Session Count Logic:**
- [ ] Skip session <50% - verify no long break at session 4
- [ ] Complete 4 valid sessions - verify long break triggers
- [ ] 3 valid + 1 skip - verify no long break, then 4 valid = long break

**Auto-Complete Duration:**
- [ ] Let timer auto-complete - verify recorded duration matches elapsed
- [ ] Compare with manual skip - verify same duration recorded

**Mode Switch Confirmation:**
- [ ] Switch while paused - verify immediate switch
- [ ] Switch while running - verify confirmation dialog
- [ ] Cancel confirmation - verify stays on current mode
- [ ] Confirm switch - verify mode changes and timer resets

**TaskId Validation:**
- [ ] Create session with valid taskId - verify session recorded with task
- [ ] Create session with deleted taskId - verify session recorded without task
- [ ] Create session with another user's taskId - verify session recorded without task

**Settings Sync:**
- [ ] Change work duration - verify both timeLeft and lastSessionTimeLeft update
- [ ] Change short break duration - verify both values sync
- [ ] Switch mode - verify lastSessionTimeLeft is set

**Timer Guide:**
- [ ] First visit - verify guide popup appears
- [ ] Check "don't show again" - verify preference persists
- [ ] Increment GUIDE_VERSION - verify guide appears again
- [ ] Mobile and desktop - verify responsive
- [ ] English and Vietnamese - verify translation

---

## Ambiguities/Blockers

**None identified** - Plan is well-documented with clear acceptance criteria and implementation steps.

---

## Unresolved Questions

1. **Phase 4 - TaskId Response Warning:** Should API return warning in response when taskId invalid, or continue silent sanitization?
   - Current plan: Silent sanitization
   - Alternative: Include `warning: 'taskId not found'` in response

2. **Phase 4 - Client-side Cleanup:** Should client clear stale `activeTaskId` localStorage when validation fails?
   - Current plan: Server-side only
   - Note: Would require response change and client handling (future enhancement)

---

## Key Success Metrics

1. All 4 core issues (P1-P4) resolved without regressions
2. 100% of acceptance criteria met across all phases
3. Manual testing checklist 100% complete
4. No new bugs introduced
5. Settings sync and data integrity verified
6. User onboarding guide improves adoption

