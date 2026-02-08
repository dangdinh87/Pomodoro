'use client';

import { memo } from 'react';
import {
    AnalogClock,
    DigitalClock,
    FlipClock,
} from './clocks';
import { TimerSettings } from '@/stores/timer-store';

interface ClockDisplayProps {
    settings: TimerSettings;
    formattedTime: string;
    totalTimeForMode: number;
    timeLeft: number;
    progressPercent: number;
    isRunning: boolean;
}

export const ClockDisplay = memo(
    ({
        settings,
        formattedTime,
        totalTimeForMode,
        timeLeft,
        progressPercent,
        isRunning,
    }: ClockDisplayProps) => {
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
    }
);

ClockDisplay.displayName = 'ClockDisplay';
