'use client';

import { memo, useMemo } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import {
    AnalogClock,
    DigitalClock,
    FlipClock,
} from './clocks';

export const TimerClockDisplay = memo(function TimerClockDisplay() {
    const timeLeft = useTimerStore((state) => state.timeLeft);
    const settings = useTimerStore((state) => state.settings);
    const mode = useTimerStore((state) => state.mode);
    const isRunning = useTimerStore((state) => state.isRunning);

    const totalTimeForMode = useMemo(() => {
        switch (mode) {
            case 'work':
                return settings.workDuration * 60;
            case 'shortBreak':
                return settings.shortBreakDuration * 60;
            case 'longBreak':
                return settings.longBreakDuration * 60;
            default:
                return 25 * 60;
        }
    }, [mode, settings]);

    const progressPercent = useMemo(() => {
        const total = totalTimeForMode || 1;
        return ((total - timeLeft) / total) * 100;
    }, [timeLeft, totalTimeForMode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    const formattedTime = formatTime(timeLeft);
    const clockSize = settings.clockSize || 'medium';

    switch (settings.clockType) {
        case 'analog':
            return (
                <AnalogClock
                    formattedTime={formattedTime}
                    totalTimeForMode={totalTimeForMode}
                    timeLeft={timeLeft}
                    clockSize={clockSize}
                    isRunning={isRunning}
                />
            );
        case 'flip':
            return (
                <FlipClock
                    formattedTime={formattedTime}
                    timeLeft={timeLeft}
                    isRunning={isRunning}
                    clockSize={clockSize}
                />
            );
        case 'progress':
            // Progress clock type removed from UI; fallback to digital
        case 'digital':
        default:
            return (
                <DigitalClock
                    formattedTime={formattedTime}
                    isRunning={isRunning}
                    timeLeft={timeLeft}
                    totalTimeForMode={totalTimeForMode}
                    clockSize={clockSize}
                />
            );
    }
});
