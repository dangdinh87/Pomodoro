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
    const isRunning = useTimerStore((state) => state.isRunning);
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

    // Handle mode change - check if running first
    const handleModeChange = (newMode: TimerMode) => {
        if (newMode === mode) return;

        if (isRunning) {
            // Show confirmation dialog
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
            <div className="mb-8 flex justify-center">
                <Tabs
                    value={mode}
                    onValueChange={(val) => handleModeChange(val as TimerMode)}
                    className="w-fit"
                >
                    <TabsList className="bg-background/80 dark:bg-background/60 backdrop-blur-md border border-border/50 p-1 rounded-full shadow-sm">
                        <TabsTrigger
                            value="work"
                            className="rounded-full px-6 py-2 text-sm font-medium text-foreground/60 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-md"
                        >
                            {t('timer.modes.work')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="shortBreak"
                            className="rounded-full px-6 py-2 text-sm font-medium text-foreground/60 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-md"
                        >
                            {t('timer.modes.shortBreak')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="longBreak"
                            className="rounded-full px-6 py-2 text-sm font-medium text-foreground/60 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-md"
                        >
                            {t('timer.modes.longBreak')}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

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
                        <AlertDialogAction onClick={handleConfirmedSwitch}>
                            {t('timer.mode_switch_confirm.confirm') || 'Switch anyway'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});
