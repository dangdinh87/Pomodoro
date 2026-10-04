'use client';

import { memo, useMemo } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import { useReducedMotion } from 'motion/react';
import { SessionCycle } from './session-cycle';
import { TimerProgress } from './timer-progress';
import {
    AnalogClock,
    DigitalClock,
    FlipClock,
    ThreeClock,
    resolveClockType,
} from './clocks';

export const TimerClockDisplay = memo(function TimerClockDisplay() {
    const reduceMotion = useReducedMotion();
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
    const warn = settings.lowTimeWarningEnabled ?? true;
    const clockType = resolveClockType(settings.clockType);

    let clockContent = null;
    switch (clockType) {
        case 'analog':
            clockContent = (
                <AnalogClock
                    formattedTime={formattedTime}
                    totalTimeForMode={totalTimeForMode}
                    timeLeft={timeLeft}
                    clockSize={clockSize}
                    isRunning={isRunning}
                    warn={warn}
                />
            );
            break;
        case 'flip':
            clockContent = (
                <FlipClock
                    formattedTime={formattedTime}
                    timeLeft={timeLeft}
                    isRunning={isRunning}
                    clockSize={clockSize}
                    warn={warn}
                />
            );
            break;
        case 'flip3d':
        case 'tomato':
        case 'orbit':
        case 'solid':
            clockContent = (
                <ThreeClock
                    scene={clockType}
                    timeLeft={timeLeft}
                    totalTimeForMode={totalTimeForMode}
                    isRunning={isRunning}
                    clockSize={clockSize}
                    warn={warn}
                />
            );
            break;
        case 'digital':
        default:
            clockContent = (
                <DigitalClock
                    formattedTime={formattedTime}
                    isRunning={isRunning}
                    timeLeft={timeLeft}
                    totalTimeForMode={totalTimeForMode}
                    clockSize={clockSize}
                    warn={warn}
                />
            );
            break;
    }

    // Analog, tomato and orbit already draw the progress themselves.
    const showProgressLine = clockType !== 'analog' && clockType !== 'tomato' && clockType !== 'orbit';

    return (
        <div className="flex w-full flex-col items-center gap-4">
            <div className="flex w-full flex-col items-center gap-3.5">
                {/* 3D stages are sized by the viewport; never let one spill out of the card */}
                <div className="flex w-full justify-center [&>*]:max-w-full">{clockContent}</div>
                {showProgressLine && <TimerProgress percent={progressPercent} reduceMotion={Boolean(reduceMotion)} />}
            </div>
            <SessionCycle />
        </div>
    );
});
