'use client';

import { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, ArrowCounterClockwise, SkipForward } from '@phosphor-icons/react/dist/ssr';
import { Kbd } from '@/components/ui/kbd';
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
import { useSessionRecorder } from '@/lib/timer/use-session-recorder';
import { playAlarm } from '@/lib/timer/alarm';
import { requestNotificationPermission } from '@/lib/timer/notifications';
import { useConfetti } from '@/hooks/use-confetti';
import { useTasksStore } from '@/stores/task-store';
import { mayAutoChain } from '@/lib/timer/auto-chain';
import { requestTimerReset } from '../lib/request-reset';

// Minimum completion percentage to count as a valid pomodoro
const MINIMUM_COMPLETION_PERCENT = 50;

export const TimerControls = memo(function TimerControls() {
    const { t } = useTranslation();
    const { record } = useSessionRecorder();
    const { fireWorkComplete } = useConfetti();

    // ATOMIC SUBSCRIPTION
    const isRunning = useTimerStore((state) => state.isRunning);
    const mode = useTimerStore((state) => state.mode);
    const timeLeft = useTimerStore((state) => state.timeLeft);
    const settings = useTimerStore((state) => state.settings);

    // Actions
    const setIsRunning = useTimerStore((state) => state.setIsRunning);
    const pauseTimer = useTimerStore((state) => state.pauseTimer);
    const resumeTimer = useTimerStore((state) => state.resumeTimer);

    // Logic controls needed for skipping (unfortunately requires some store access, but isolated here)
    const incrementCompletedSessions = useTimerStore((state) => state.incrementCompletedSessions);
    const incrementSessionCount = useTimerStore((state) => state.incrementSessionCount);
    const setMode = useTimerStore((state) => state.setMode);
    const setTimeLeft = useTimerStore((state) => state.setTimeLeft);
    const setDeadlineAt = useTimerStore((state) => state.setDeadlineAt);
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
        // BUG-06 FIX: Clamp to 0-100 range to handle edge cases
        if (total <= 0) return 0;
        const completed = Math.max(0, total - timeLeft);
        return Math.min(100, Math.max(0, (completed / total) * 100));
    };

    // BUG-04 FIX: Close skip dialog when timer completes (timeLeft reaches 0)
    useEffect(() => {
        if (timeLeft <= 0 && skipConfirmOpen) {
            setSkipConfirmOpen(false);
        }
    }, [timeLeft, skipConfirmOpen]);

    const handleSessionComplete = (skipWithoutRecording: boolean = false) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setIsRunning(false);
        // Clear deadline before mode transition to prevent stale deadline reuse
        setDeadlineAt(null);

        const totalTime = getTotalTimeForMode();
        const completedDuration = totalTime - timeLeft;
        const completionPercent = (completedDuration / totalTime) * 100;
        const isValidSession = !skipWithoutRecording && completionPercent >= MINIMUM_COMPLETION_PERCENT;

        if (mode === 'work') {
            if (isValidSession) {
                incrementCompletedSessions();
                // Fire confetti celebration
                fireWorkComplete();
                playAlarm();

                // Record only the focus time since the last recorded segment
                // (partial sessions may already have been posted for this phase)
                const { lastSessionTimeLeft } = useTimerStore.getState();
                const segmentDuration = lastSessionTimeLeft > 0
                    ? Math.max(0, lastSessionTimeLeft - timeLeft)
                    : completedDuration;
                void record({
                    taskId: useTasksStore.getState().activeTaskId || null,
                    durationSec: segmentDuration,
                    mode: 'work',
                    // A skip is a partial segment: time counts, the pomodoro does not
                    completedFullSession: false,
                });
            } else {
                toast.info(t('timer.skipped_not_recorded'));
            }
        } else {
            // Breaks are not recorded on manual skip
            playAlarm();
        }

        // Transition Logic - use requestAnimationFrame to let UI settle first
        requestAnimationFrame(() => {
            if (mode === 'work') {
                // FIX: Only increment sessionCount for valid sessions, then read updated value
                if (isValidSession) {
                    incrementSessionCount();
                }
                // Read updated sessionCount from store for accurate long break check
                const updatedSessionCount = useTimerStore.getState().sessionCount;

                // Only check for long break if we have valid sessions
                if (updatedSessionCount > 0 && updatedSessionCount % settings.longBreakInterval === 0) {
                    setMode('longBreak');
                    const newDuration = settings.longBreakDuration * 60;
                    setTimeLeft(newDuration);
                    useTimerStore.getState().setLastSessionTimeLeft(newDuration);
                    // Defer auto-start to next frame for smooth transition
                    if (settings.autoStartBreak && !skipWithoutRecording) {
                        requestAnimationFrame(() => setIsRunning(true));
                    }
                } else {
                    setMode('shortBreak');
                    const newDuration = settings.shortBreakDuration * 60;
                    setTimeLeft(newDuration);
                    useTimerStore.getState().setLastSessionTimeLeft(newDuration);
                    if (settings.autoStartBreak && !skipWithoutRecording) {
                        requestAnimationFrame(() => setIsRunning(true));
                    }
                }
            } else {
                setMode('work');
                const newDuration = settings.workDuration * 60;
                setTimeLeft(newDuration);
                useTimerStore.getState().setLastSessionTimeLeft(newDuration);
                // Skipping a long break ends the chain: the next focus waits for a click
                if (settings.autoStartWork && mayAutoChain(mode, true) && !skipWithoutRecording) {
                    requestAnimationFrame(() => setIsRunning(true));
                }
            }
            setIsProcessing(false);
        });
    };

    const handleSkipClick = () => {
        if (isProcessing) return;

        // Always show confirmation when timer is running
        if (isRunning) {
            setSkipConfirmOpen(true);
            return;
        }
        handleSessionComplete(false);
    };

    const handleConfirmedSkip = () => {
        setSkipConfirmOpen(false);
        const skipWithoutRecording = mode === 'work' && getCompletionPercent() < MINIMUM_COMPLETION_PERCENT;
        handleSessionComplete(skipWithoutRecording);
    };

    const toggleTimer = () => {
        if (isProcessing) return;
        if (!isRunning) {
            if (timeLeft > 0) {
                // First user gesture: the only place we may ask for permission
                requestNotificationPermission();
                resumeTimer();
            }
        } else {
            pauseTimer();
        }
    };

    const hasProgress = timeLeft < (getTotalTimeForMode() ?? 0);
    const primaryLabel = isRunning
        ? t('timer.controls.pause')
        : hasProgress
          ? t('timerUi.resume')
          : mode === 'work'
            ? t('timerUi.startFocus')
            : t('timerUi.startBreak');
    const hintKey = isRunning ? 'timerUi.hintPause' : hasProgress ? 'timerUi.hintResume' : 'timerUi.hintStart';
    const [hintBefore, hintAfter = ''] = t(hintKey).split('{key}');

    return (
        <>
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center gap-3">
                    <Button
                        onClick={requestTimerReset}
                        disabled={isProcessing}
                        aria-label={t('timer.controls.aria.reset')}
                        title={t('timer.controls.reset_hint')}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-ink-secondary hover:text-ink"
                    >
                        <ArrowCounterClockwise size={16} aria-hidden="true" />
                    </Button>

                    <Button
                        onClick={toggleTimer}
                        disabled={isProcessing}
                        title={isRunning ? t('timer.controls.pause_hint') : t('timer.controls.start_hint')}
                        size="lg"
                        className="min-w-[168px]"
                    >
                        <span className="inline-flex items-center gap-2">
                            {isRunning ? (
                                <Pause size={16} weight="fill" aria-hidden="true" />
                            ) : (
                                <Play size={16} weight="fill" aria-hidden="true" />
                            )}
                            {primaryLabel}
                        </span>
                    </Button>

                    <Button
                        onClick={handleSkipClick}
                        disabled={isProcessing}
                        variant="ghost"
                        size="icon"
                        aria-label={t('timer.controls.skip_hint')}
                        title={t('timer.controls.skip_hint')}
                        className="h-10 w-10 rounded-full text-ink-secondary hover:text-ink"
                    >
                        <SkipForward size={16} aria-hidden="true" />
                    </Button>
                </div>
                <p data-chrome className="flex items-center gap-1.5 text-xs text-ink-faint [@media(hover:none)]:hidden">
                    {hintBefore}
                    <Kbd>{t('timerUi.spaceKey')}</Kbd>
                    {hintAfter}
                </p>
            </div>

            <AlertDialog open={skipConfirmOpen} onOpenChange={setSkipConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('timer.skip_confirm.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('timer.skip_confirm.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmedSkip}>
                            {t('timer.skip_confirm.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});
