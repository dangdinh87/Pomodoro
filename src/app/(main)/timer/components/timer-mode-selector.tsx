'use client';

import { memo, useState } from 'react';
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip';
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

const MODES: { value: TimerMode; labelKey: string }[] = [
    { value: 'work', labelKey: 'timerUi.mode.work' },
    { value: 'shortBreak', labelKey: 'timerUi.mode.shortBreak' },
    { value: 'longBreak', labelKey: 'timerUi.mode.longBreak' },
];

export const TimerModeSelector = memo(function TimerModeSelector() {
    const { t } = useTranslation();
    const mode = useTimerStore((state) => state.mode);
    const isRunning = useTimerStore((state) => state.isRunning);
    const timeLeft = useTimerStore((state) => state.timeLeft);
    const setMode = useTimerStore((state) => state.setMode);
    const setTimeLeft = useTimerStore((state) => state.setTimeLeft);
    const settings = useTimerStore((state) => state.settings);
    const setIsRunning = useTimerStore((state) => state.setIsRunning);
    const setDeadlineAt = useTimerStore((state) => state.setDeadlineAt);

    // State for confirmation dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);

    const switchMode = (newMode: TimerMode) => {
        setIsRunning(false);
        setDeadlineAt(null);
        setMode(newMode);

        // FIX: Also set lastSessionTimeLeft to sync with new mode duration
        let newDuration: number;
        if (newMode === 'work') {
            newDuration = settings.workDuration * 60;
        } else if (newMode === 'shortBreak') {
            newDuration = settings.shortBreakDuration * 60;
        } else {
            newDuration = settings.longBreakDuration * 60;
        }
        setTimeLeft(newDuration);
        useTimerStore.getState().setLastSessionTimeLeft(newDuration);
    };

    // Check if timer has progress (paused or running with elapsed time)
    const hasProgress = () => {
        const totalDuration = mode === 'work'
            ? settings.workDuration * 60
            : mode === 'shortBreak'
                ? settings.shortBreakDuration * 60
                : settings.longBreakDuration * 60;
        return timeLeft < totalDuration;
    };

    // Handle mode change - confirm if running OR paused with progress
    const handleModeChange = (newMode: TimerMode) => {
        if (newMode === mode) return;

        if (isRunning || hasProgress()) {
            setPendingMode(newMode);
            setConfirmOpen(true);
        } else {
            switchMode(newMode);
        }
    };

    // Confirmed switch - user chose to discard progress
    const handleConfirmedSwitch = () => {
        if (pendingMode) {
            switchMode(pendingMode);
        }
        setConfirmOpen(false);
        setPendingMode(null);
    };

    // Cancel switch - keep timer running
    const handleCancelSwitch = () => {
        setConfirmOpen(false);
        setPendingMode(null);
    };

    return (
        <>
            <FilterChipGroup label={t('timerUi.modeGroup')} className="mb-8 justify-center">
                {MODES.map(({ value, labelKey }) => (
                    <FilterChip
                        key={value}
                        active={mode === value}
                        onClick={() => handleModeChange(value)}
                        className="h-9 px-4 text-sm"
                    >
                        {t(labelKey)}
                    </FilterChip>
                ))}
            </FilterChipGroup>

            {/* Mode Switch Confirmation Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('timer.mode_switch_confirm.title') || 'Switch mode?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('timer.mode_switch_confirm.description') ||
                                'Timer is running. Switching mode will discard your current progress.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelSwitch}>
                            {t('common.cancel') || 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleConfirmedSwitch}>
                            {t('timer.mode_switch_confirm.confirm') || 'Switch anyway'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});
