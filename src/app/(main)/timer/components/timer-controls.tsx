'use client';

import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Pause,
    Play,
    RotateCcw,
    SkipForwardIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import { useTimerStore } from '@/stores/timer-store';
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
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// Minimum completion percentage to count as a valid pomodoro
const MINIMUM_COMPLETION_PERCENT = 50;

export const TimerControls = memo(function TimerControls() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    // ATOMIC SUBSCRIPTION
    const isRunning = useTimerStore((state) => state.isRunning);
    const mode = useTimerStore((state) => state.mode);
    const timeLeft = useTimerStore((state) => state.timeLeft);
    const settings = useTimerStore((state) => state.settings);

    // Actions
    const setIsRunning = useTimerStore((state) => state.setIsRunning);
    const resetTimer = useTimerStore((state) => state.resetTimer);
    const pauseTimer = useTimerStore((state) => state.pauseTimer);
    const resumeTimer = useTimerStore((state) => state.resumeTimer);

    // Logic controls needed for skipping (unfortunately requires some store access, but isolated here)
    const incrementCompletedSessions = useTimerStore((state) => state.incrementCompletedSessions);
    const incrementSessionCount = useTimerStore((state) => state.incrementSessionCount);
    const setMode = useTimerStore((state) => state.setMode);
    const setTimeLeft = useTimerStore((state) => state.setTimeLeft);
    const sessionCount = useTimerStore((state) => state.sessionCount);

    // Local state
    const [skipConfirmOpen, setSkipConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Helper to calculate total time for current mode to determine progress
    const getTotalTimeForMode = () => {
        switch (mode) {
            case 'work': return settings.workDuration * 60;
            case 'shortBreak': return settings.shortBreakDuration * 60;
            case 'longBreak': return settings.longBreakDuration * 60;
        }
    };

    const getCompletionPercent = () => {
        const total = getTotalTimeForMode();
        const completed = total - timeLeft;
        return (completed / total) * 100;
    };

    const playNotificationSound = () => {
        // NOTE: We might want to move this to a shared sound utility or store later
        // For now, simple reimplementation or prop passing is tricky without context
        try {
            const audio = new Audio('/sounds/alarm.mp3');
            // Assuming volume 0.5 default if not accessible, or we can fetch system store
            // Ideally sound logic belongs in the engine or a sound hook, but controls trigger skip sound
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch { }
    };

    const handleSessionComplete = async (skipWithoutRecording: boolean = false) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setIsRunning(false);

        const totalTime = getTotalTimeForMode();
        const completedDuration = totalTime - timeLeft;
        const completionPercent = (completedDuration / totalTime) * 100;
        const isValidSession = !skipWithoutRecording && completionPercent >= MINIMUM_COMPLETION_PERCENT;

        if (mode === 'work') {
            if (isValidSession) {
                incrementCompletedSessions();
                try {
                    const { activeTaskId } = await import('@/stores/task-store').then((m) => m.useTasksStore.getState());
                    await fetch('/api/tasks/session-complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            taskId: activeTaskId || null,
                            durationSec: completedDuration,
                            mode: 'work',
                        }),
                    });
                    queryClient.invalidateQueries({ queryKey: ['stats'] });
                    queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    queryClient.invalidateQueries({ queryKey: ['history'] });
                } catch (error) {
                    console.error('Failed to record session:', error);
                }
                playNotificationSound();
            } else {
                toast.info(t('timer.skipped_not_recorded') || 'Session skipped - not recorded');
            }
        } else {
            // Break session recording logic...
            playNotificationSound();
        }

        // Transition Logic
        if (mode === 'work') {
            const newSessionCount = sessionCount + 1;
            if (isValidSession) incrementSessionCount();

            if (newSessionCount % settings.longBreakInterval === 0) {
                setMode('longBreak');
                setTimeLeft(settings.longBreakDuration * 60);
                if (settings.autoStartBreak && !skipWithoutRecording) setIsRunning(true);
            } else {
                setMode('shortBreak');
                setTimeLeft(settings.shortBreakDuration * 60);
                if (settings.autoStartBreak && !skipWithoutRecording) setIsRunning(true);
            }
        } else {
            setMode('work');
            setTimeLeft(settings.workDuration * 60);
            if (settings.autoStartWork && !skipWithoutRecording) setIsRunning(true);
        }
        setIsProcessing(false);
    };

    const handleSkipClick = () => {
        if (isProcessing) return;

        if (mode === 'work' && getCompletionPercent() < MINIMUM_COMPLETION_PERCENT) {
            setSkipConfirmOpen(true);
            return;
        }
        handleSessionComplete(false);
    };

    const handleConfirmedSkip = () => {
        setSkipConfirmOpen(false);
        handleSessionComplete(true);
    };

    const toggleTimer = () => {
        if (isProcessing) return;
        if (!isRunning) {
            if (timeLeft > 0) resumeTimer();
        } else {
            pauseTimer();
        }
    };

    return (
        <>
            <div className="flex items-center justify-center gap-6">
                <Button
                    onClick={resetTimer}
                    disabled={isProcessing}
                    aria-label={t('timer.controls.aria.reset')}
                    title={t('timer.controls.reset_hint')}
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground shadow-sm transition-all"
                >
                    <RotateCcw size={20} />
                </Button>

                <Button
                    onClick={toggleTimer}
                    disabled={isProcessing}
                    aria-label={isRunning ? t('timer.controls.aria.pause') : t('timer.controls.aria.start')}
                    title={isRunning ? t('timer.controls.pause_hint') : t('timer.controls.start_hint')}
                    className={cn(
                        "h-16 px-8 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95",
                        "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    )}
                >
                    {isRunning ? (
                        <span className="inline-flex items-center gap-2">
                            <Pause size={24} fill="currentColor" /> {t('timer.controls.pause')}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            <Play size={24} fill="currentColor" /> {t('timer.controls.start').toUpperCase()}
                        </span>
                    )}
                </Button>

                <Button
                    onClick={handleSkipClick}
                    disabled={isProcessing}
                    variant="secondary"
                    size="icon"
                    title={t('timer.controls.skip_hint')}
                    className="h-12 w-12 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground shadow-sm transition-all"
                >
                    <SkipForwardIcon size={20} />
                </Button>
            </div>

            <AlertDialog open={skipConfirmOpen} onOpenChange={setSkipConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('timer.skip_confirm.title') || 'Skip without recording?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('timer.skip_confirm.description') ||
                                `You've completed less than ${MINIMUM_COMPLETION_PERCENT}% of this session. This will not count as a completed pomodoro.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t('common.cancel') || 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmedSkip}>
                            {t('timer.skip_confirm.confirm') || 'Skip anyway'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});
