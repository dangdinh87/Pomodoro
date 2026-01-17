import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import { useTranslation } from '@/contexts/i18n-context';

export function usePageTitle() {
    const { t } = useTranslation();

    // Subscribe atomicaly
    const timeLeft = useTimerStore((state) => state.timeLeft);
    const mode = useTimerStore((state) => state.mode);
    const isRunning = useTimerStore((state) => state.isRunning);

    const initialTitleRef = useRef<string | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (initialTitleRef.current === null) {
            initialTitleRef.current = document.title;
        }
        return () => {
            if (initialTitleRef.current !== null) {
                document.title = initialTitleRef.current;
            }
        };
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const prefix =
            mode === 'work'
                ? t('timer.title_prefix.work')
                : mode === 'shortBreak'
                    ? t('timer.title_prefix.shortBreak')
                    : t('timer.title_prefix.longBreak');
        const paused = isRunning ? '' : ' ⏸';
        const formattedTime = formatTime(timeLeft);
        document.title = `${formattedTime} • ${prefix}${paused}`;
    }, [timeLeft, mode, isRunning, t]);
}
