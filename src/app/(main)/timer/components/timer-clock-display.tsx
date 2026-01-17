'use client';

import { memo, useMemo, useRef } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import {
    AnalogClock,
    DigitalClock,
    FlipClock,
    ProgressBarClock,
} from './clocks';

export const TimerClockDisplay = memo(function TimerClockDisplay() {
    // ATOMIC SUBSCRIPTION: Chỉ lấy những gì cần thiết cho việc hiển thị đồng hồ
    // Việc subscribe ở đây đảm bảo chỉ component này re-render mỗi giây
    const timeLeft = useTimerStore((state) => state.timeLeft);
    const settings = useTimerStore((state) => state.settings);
    const mode = useTimerStore((state) => state.mode);
    const isRunning = useTimerStore((state) => state.isRunning);

    // Refs cho DigitalClock để tránh truyền props thay đổi liên tục nếu không cần thiết
    // Tuy nhiên DigitalClock hiện tại cần timeLeft để tính toán, nên việc re-render là bắt buộc
    const timeRef = useRef<HTMLDivElement | null>(null);

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
});
