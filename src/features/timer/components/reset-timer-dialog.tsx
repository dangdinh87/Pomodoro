'use client';

import { useEffect } from 'react';
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
import { useTranslation } from '@/contexts/i18n-context';
import { useSessionRecorder } from '@/lib/timer/use-session-recorder';
import { recordPendingFocus } from '@/lib/timer/partial-segment';
import { useTasksStore } from '@/stores/task-store';
import { useTimerStore } from '@/stores/timer-store';
import { closeResetDialog, useResetDialogStore } from '../lib/request-reset';

const mmss = (totalSec: number) => {
    const s = Math.max(0, Math.round(totalSec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** "Reset timer?" with the choice to keep what was focused. Mount once; open it with `requestTimerReset()`. */
export function ResetTimerDialog() {
    const { t } = useTranslation();
    const { record } = useSessionRecorder();
    const open = useResetDialogStore((s) => s.open);
    const askedMode = useResetDialogStore((s) => s.mode);
    const mode = useTimerStore((s) => s.mode);
    const timeLeft = useTimerStore((s) => s.timeLeft);
    const lastSessionTimeLeft = useTimerStore((s) => s.lastSessionTimeLeft);

    // The focus session ended (or the user switched phase) while the dialog was
    // open: resetting now would hit a different phase than the one asked about.
    useEffect(() => {
        if (open && askedMode !== mode) closeResetDialog();
    }, [open, askedMode, mode]);

    const focusedSec = mode === 'work' ? Math.max(0, lastSessionTimeLeft - timeLeft) : 0;
    const canSave = focusedSec >= 1;

    const saveAndReset = () => {
        recordPendingFocus(useTasksStore.getState().activeTaskId || null, record);
        useTimerStore.getState().resetTimer();
        closeResetDialog();
    };

    const resetWithoutSaving = () => {
        useTimerStore.getState().resetTimer();
        closeResetDialog();
    };

    return (
        <AlertDialog open={open} onOpenChange={(next) => !next && closeResetDialog()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('timer.reset_confirm.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {canSave
                            ? t('timer.reset_confirm.description_save', { time: mmss(focusedSec) })
                            : t('timer.reset_confirm.description')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={resetWithoutSaving}>
                        {t('timer.reset_confirm.discard')}
                    </AlertDialogAction>
                    {canSave && (
                        <AlertDialogAction onClick={saveAndReset}>
                            {t('timer.reset_confirm.save')}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
