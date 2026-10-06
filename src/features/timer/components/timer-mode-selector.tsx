'use client';

import { memo, useState } from 'react';
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip';
import { useTranslation } from '@/contexts/i18n-context';
import { useTimerStore, TimerMode } from '@/stores/timer-store';
import { switchTimerMode, timerHasProgress } from '@/features/timer/lib/timer-mode';
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

    // State for confirmation dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);

    // Handle mode change - confirm if running OR paused with progress
    const handleModeChange = (newMode: TimerMode) => {
        if (newMode === mode) return;

        if (timerHasProgress()) {
            setPendingMode(newMode);
            setConfirmOpen(true);
        } else {
            switchTimerMode(newMode);
        }
    };

    // Confirmed switch - user chose to discard progress
    const handleConfirmedSwitch = () => {
        if (pendingMode) {
            switchTimerMode(pendingMode);
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
            <FilterChipGroup label={t('timerUi.modeGroup')} className="mb-(--stage-chips-mb) justify-center">
                {MODES.map(({ value, labelKey }) => (
                    <FilterChip
                        key={value}
                        active={mode === value}
                        onClick={() => handleModeChange(value)}
                        className="h-9 px-4 text-[0.9375rem]"
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
                            {t('timer.mode_switch_confirm.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('timer.mode_switch_confirm.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelSwitch}>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleConfirmedSwitch}>
                            {t('timer.mode_switch_confirm.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});
