import { useEffect } from 'react';
import { useTimerStore } from '@/stores/timer-store';

export function useTimerHotkeys() {
    const isRunning = useTimerStore((state) => state.isRunning);
    const resumeTimer = useTimerStore((state) => state.resumeTimer);
    const pauseTimer = useTimerStore((state) => state.pauseTimer);
    const resetTimer = useTimerStore((state) => state.resetTimer);
    const timeLeft = useTimerStore((state) => state.timeLeft);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Avoid conflict with input fields or contenteditable elements
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable ||
                target.getAttribute('role') === 'textbox'
            ) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                if (!isRunning && timeLeft > 0) {
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
