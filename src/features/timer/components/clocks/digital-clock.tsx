'use client';

import { memo, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import { useAnalogClockState } from './use-analog-clock-state';
import { ClockDigits, clockDigitScale } from './clock-digits';

export type DigitalClockProps = {
  formattedTime: string;
  isRunning: boolean;
  timeLeft: number;
  totalTimeForMode: number;
  clockSize?: 'small' | 'medium' | 'large';
  warn?: boolean;
};

// Viewport-based on purpose (the settings gallery scales this component by measuring it). The maxima keep
// "00:00" inside the 560px timer card: 4 digits and the colon are about 2.6em wide.
const sizeClasses = {
  small: 'text-[length:calc(clamp(60px,19vw,112px)*var(--clock-scale,1))]',
  medium: 'text-[length:calc(clamp(76px,27vw,160px)*var(--clock-scale,1))]',
  large: 'text-[length:calc(clamp(88px,29vw,176px)*var(--clock-scale,1))]',
};

export const DigitalClock = memo(
  ({
    isRunning,
    timeLeft,
    clockSize = 'medium',
    warn = true,
  }: DigitalClockProps) => {
    const { t } = useTranslation();
    const animConfig = useAnalogClockState({ timeLeft, isRunning, warn });

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const warning = animConfig.state === 'urgent' || animConfig.state === 'critical';

    return (
      <div className="flex justify-center text-center">
        <div
          className={cn(
            sizeClasses[clockSize],
            'font-heading font-extrabold leading-none tracking-[-0.01em]',
            'clock-color-transition',
            animConfig.pulse && 'animate-clock-pulse',
          )}
          style={{ color: animConfig.color, '--clock-scale': clockDigitScale(minutes) } as CSSProperties}
          // role="timer" is not announced on every tick; TimerLiveAnnouncer
          // speaks the meaningful changes (start/pause/phase end/milestones).
          role="timer"
          aria-live="off"
          aria-label={t('timer.aria.timeRemaining').replace('{time}', `${minutes}:${String(seconds).padStart(2, '0')}`)}
        >
          <ClockDigits minutes={minutes} seconds={seconds} dotColor={warning ? animConfig.accent : undefined} />
        </div>
      </div>
    );
  },
);
DigitalClock.displayName = 'DigitalClock';
