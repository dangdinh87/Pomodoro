'use client';

import { memo } from 'react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import { useAnalogClockState } from './use-analog-clock-state';

export type DigitalClockProps = {
  formattedTime: string;
  isRunning: boolean;
  timeLeft: number;
  totalTimeForMode: number;
  clockSize?: 'small' | 'medium' | 'large';
};

const sizeClasses = {
  small: 'text-[clamp(64px,10vw,128px)]',
  medium: 'text-[clamp(88px,15vw,196px)]',
  large: 'text-[clamp(104px,18vw,240px)]',
};

const numberFlowTiming = {
  transform: { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' as const },
  spin: { duration: 600, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' as const },
  opacity: { duration: 350, easing: 'ease-out' as const },
};

export const DigitalClock = memo(
  ({
    isRunning,
    timeLeft,
    clockSize = 'medium',
  }: DigitalClockProps) => {
    const { t } = useTranslation();
    const animConfig = useAnalogClockState({ timeLeft, isRunning });

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div className="text-center flex justify-center">
        <div
          className={cn(
            sizeClasses[clockSize],
            'font-heading font-bold leading-none tabular-nums',
            'clock-color-transition',
            (animConfig.state === 'urgent' || animConfig.state === 'critical') && 'animate-clock-pulse',
          )}
          style={{ color: animConfig.color }}
          role="timer"
          aria-live="off"
          aria-label={t('timer.aria.timeRemaining').replace('{time}', `${minutes}:${String(seconds).padStart(2, '0')}`)}
        >
          <div className="flex items-center">
            <NumberFlow
              value={minutes}
              format={{ minimumIntegerDigits: 2 }}
              animated
              willChange
              transformTiming={numberFlowTiming.transform}
              spinTiming={numberFlowTiming.spin}
              opacityTiming={numberFlowTiming.opacity}
            />
            <span className="mx-0.5">:</span>
            <NumberFlow
              value={seconds}
              format={{ minimumIntegerDigits: 2 }}
              animated
              willChange
              transformTiming={numberFlowTiming.transform}
              spinTiming={numberFlowTiming.spin}
              opacityTiming={numberFlowTiming.opacity}
            />
          </div>
        </div>
      </div>
    );
  },
);
DigitalClock.displayName = 'DigitalClock';
