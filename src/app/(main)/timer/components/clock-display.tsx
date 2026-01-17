'use client';

import { memo } from 'react';
import {
    AnalogClock,
    DigitalClock,
    FlipClock,
    ProgressBarClock,
} from './clocks';
import { TimerSettings } from '@/stores/timer-store';

interface ClockDisplayProps {
    settings: TimerSettings;
    formattedTime: string;
    totalTimeForMode: number;
    timeLeft: number;
    progressPercent: number;
    isRunning: boolean;
    timeRef: React.RefObject<HTMLDivElement>;
}

export const ClockDisplay = memo(
    ({
        settings,
        formattedTime,
        totalTimeForMode,
        timeLeft,
        progressPercent,
        isRunning,
        timeRef,
    }: ClockDisplayProps) => {
        const lowWarnEnabled = settings.lowTimeWarningEnabled ?? true;
        const clockSize = settings.clockSize || 'medium';

        switch (settings.clockType) {
            case 'analog':
                return (
                    <AnalogClock
                        formattedTime={formattedTime}
                        totalTimeForMode={totalTimeForMode}
                        timeLeft={timeLeft}
                        clockSize={clockSize}
                    />
                );
            case 'progress':
                return (
                    <ProgressBarClock
                        formattedTime={formattedTime}
                        progressPercent={progressPercent}
                        clockSize={clockSize}
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
            case 'digital':
            default:
                return (
                    <DigitalClock
                        timeRef={timeRef}
                        formattedTime={formattedTime}
                        isRunning={isRunning}
                        progressPercent={progressPercent}
                        lowWarnEnabled={lowWarnEnabled}
                        timeLeft={timeLeft}
                        clockSize={clockSize}
                    />
                );
        }
    }
);

ClockDisplay.displayName = 'ClockDisplay';
