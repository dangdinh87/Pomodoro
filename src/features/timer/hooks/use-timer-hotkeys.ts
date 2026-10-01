import { useEffect } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import { requestNotificationPermission } from '@/lib/timer/notifications';
import { shouldIgnoreShortcut } from '@/features/app-shell/keyboard-guard';

export function useTimerHotkeys() {
    const isRunning = useTimerStore((state) => state.isRunning);
    const resumeTimer = useTimerStore((state) => state.resumeTimer);
    const pauseTimer = useTimerStore((state) => state.pauseTimer);
    const resetTimer = useTimerStore((state) => state.resetTimer);
    const timeLeft = useTimerStore((state) => state.timeLeft);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (shouldIgnoreShortcut(e)) return;

            if (e.code === 'Space') {
                // A focused button already reacts to Space; toggling the timer too would double-fire.
                if ((e.target as HTMLElement).closest('button, a, [role="button"], [role="tab"], [role="switch"], [role="checkbox"]')) return;
                e.preventDefault();
                if (!isRunning && timeLeft > 0) {
                    requestNotificationPermission();
                    resumeTimer();
                } else {
                    pauseTimer();
                }
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                resetTimer();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isRunning, timeLeft, resumeTimer, pauseTimer, resetTimer]);
}
