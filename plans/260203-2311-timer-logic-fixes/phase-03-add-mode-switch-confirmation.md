# Phase 03: Add Mode Switch Confirmation

## Context

Users can switch timer modes (Work/Short Break/Long Break) while a session is running, losing their progress without any warning. This is a destructive action that should require confirmation.

## Overview

**Severity:** MEDIUM
**Effort:** 1 hour
**File:** `src/app/(main)/timer/components/timer-mode-selector.tsx`

Add an AlertDialog confirmation when user attempts to switch modes while the timer is running.

## Key Insights

1. **Current behavior:** `switchMode` immediately stops timer and changes mode
2. **UX pattern:** AlertDialog already used in timer-controls.tsx for skip confirmation
3. **Similar implementation:** Reference `skipConfirmOpen` pattern in timer-controls.tsx
4. **i18n required:** New strings for dialog title/description/buttons

## Requirements

### Functional
- Show confirmation dialog when switching modes while `isRunning === true`
- Options: "Discard and switch" or "Cancel"
- If timer not running, switch immediately (no dialog)
- Track pending mode for deferred switch

### Non-Functional
- Consistent with existing AlertDialog patterns
- i18n support for en.json and vi.json
- No change to mode switching logic once confirmed

## Architecture

### Current Flow
```
User clicks mode tab
  └─▶ switchMode(newMode)
        └─▶ setIsRunning(false)
        └─▶ setMode(newMode)
        └─▶ setTimeLeft(...)
```

### Fixed Flow
```
User clicks mode tab
  └─▶ handleModeChange(newMode)
        ├─▶ if (isRunning)
        │     └─▶ Open AlertDialog, store pendingMode
        └─▶ else
              └─▶ switchMode(newMode)

User confirms in dialog
  └─▶ switchMode(pendingMode)
```

## Related Code

### Current Implementation (timer-mode-selector.tsx:17-29)
```typescript
const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setDeadlineAt(null);
    setMode(newMode);

    if (newMode === 'work') {
        setTimeLeft(settings.workDuration * 60);
    } else if (newMode === 'shortBreak') {
        setTimeLeft(settings.shortBreakDuration * 60);
    } else {
        setTimeLeft(settings.longBreakDuration * 60);
    }
};
```

### AlertDialog Pattern (timer-controls.tsx:235-255)
```typescript
<AlertDialog open={skipConfirmOpen} onOpenChange={setSkipConfirmOpen}>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>{t('timer.skip_confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('timer.skip_confirm.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSkip}>
                {t('timer.skip_confirm.confirm')}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

## Implementation Steps

### Step 1: Add Required Imports and State
**Location:** `timer-mode-selector.tsx`

```typescript
'use client';

import { memo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/animate-ui/components/animate/tabs';
import { useTranslation } from '@/contexts/i18n-context';
import { useTimerStore, TimerMode } from '@/stores/timer-store';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const TimerModeSelector = memo(function TimerModeSelector() {
    const { t } = useTranslation();
    const mode = useTimerStore((state) => state.mode);
    const isRunning = useTimerStore((state) => state.isRunning);  // ADD
    const setMode = useTimerStore((state) => state.setMode);
    const setTimeLeft = useTimerStore((state) => state.setTimeLeft);
    const settings = useTimerStore((state) => state.settings);
    const setIsRunning = useTimerStore((state) => state.setIsRunning);
    const setDeadlineAt = useTimerStore((state) => state.setDeadlineAt);

    // ADD: State for confirmation dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);
```

### Step 2: Add Mode Change Handler
```typescript
    const handleModeChange = (newMode: TimerMode) => {
        // If same mode, do nothing
        if (newMode === mode) return;

        // If timer running, show confirmation
        if (isRunning) {
            setPendingMode(newMode);
            setConfirmOpen(true);
            return;
        }

        // Timer not running, switch immediately
        switchMode(newMode);
    };

    const handleConfirmedSwitch = () => {
        setConfirmOpen(false);
        if (pendingMode) {
            switchMode(pendingMode);
            setPendingMode(null);
        }
    };

    const handleCancelSwitch = () => {
        setConfirmOpen(false);
        setPendingMode(null);
    };
```

### Step 3: Update Tabs onValueChange
```typescript
    return (
        <>
            <div className="mb-8 flex justify-center">
                <Tabs
                    value={mode}
                    onValueChange={(val) => handleModeChange(val as TimerMode)}  // CHANGE
                    className="w-fit"
                >
```

### Step 4: Add AlertDialog Component
```typescript
            {/* Mode Switch Confirmation Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('timer.mode_switch_confirm.title') || 'Switch mode?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('timer.mode_switch_confirm.description') ||
                                'The timer is running. Switching modes will discard your current session progress.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelSwitch}>
                            {t('common.cancel') || 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmedSwitch}>
                            {t('timer.mode_switch_confirm.confirm') || 'Discard and switch'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
```

### Step 5: Add i18n Strings
**Location:** `src/i18n/locales/en.json` (in timer section)

```json
"mode_switch_confirm": {
    "title": "Switch mode?",
    "description": "The timer is running. Switching modes will discard your current session progress.",
    "confirm": "Discard and switch"
}
```

**Location:** `src/i18n/locales/vi.json` (in timer section)

```json
"mode_switch_confirm": {
    "title": "Chuyển chế độ?",
    "description": "Đồng hồ đang chạy. Chuyển chế độ sẽ hủy tiến trình phiên hiện tại.",
    "confirm": "Hủy và chuyển"
}
```

## Todo List

- [ ] Add `useState` import and state variables
- [ ] Subscribe to `isRunning` from store
- [ ] Import AlertDialog components
- [ ] Implement `handleModeChange` with confirmation logic
- [ ] Implement `handleConfirmedSwitch` and `handleCancelSwitch`
- [ ] Update Tabs `onValueChange` to use `handleModeChange`
- [ ] Add AlertDialog JSX
- [ ] Add i18n strings to en.json
- [ ] Add i18n strings to vi.json
- [ ] Test: Switch while paused - immediate switch
- [ ] Test: Switch while running - confirmation appears
- [ ] Test: Cancel confirmation - stays on current mode
- [ ] Test: Confirm switch - mode changes

## Success Criteria

1. Clicking mode tab while paused switches immediately
2. Clicking mode tab while running shows confirmation dialog
3. Canceling keeps current mode and timer state
4. Confirming switches mode and resets timer
5. Dialog text displays correctly in both EN and VI

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dialog doesn't block tab change | High | Use controlled state pattern |
| i18n fallback not working | Low | Provide inline fallback strings |
| Re-render performance | Low | memo already in place |

## Security Considerations

None - client-side UI confirmation only.

## Next Steps

After implementation:
1. Test with both English and Vietnamese locales
2. Verify timer state consistency after cancel/confirm
3. Proceed to Phase 4 (taskId validation)
