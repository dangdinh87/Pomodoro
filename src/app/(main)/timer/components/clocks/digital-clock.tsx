'use client';

import { memo } from 'react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import { useAnalogClockState } from './use-analog-clock-state';

export type DigitalClockProps = {
  formattedTime: string;
  isRunning: boolean;
  timeLeft: number;
  totalTimeForMode: number;
  clockSize?: 'small' | 'medium' | 'large';
};

const sizeClasses = {
  small: 'text-7xl md:text-8xl lg:text-9xl',
  medium: 'text-8xl md:text-[10rem] lg:text-[12rem]',
  large: 'text-9xl md:text-[12rem] lg:text-[14rem]',
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
    const animConfig = useAnalogClockState({ timeLeft, isRunning });

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div className="text-center flex justify-center">
        <div
          className={cn(
            sizeClasses[clockSize],
            'font-space-grotesk font-bold tabular-nums mb-4',
            'clock-color-transition',
            (animConfig.state === 'urgent' || animConfig.state === 'critical') && 'animate-clock-pulse',
          )}
          style={{ color: animConfig.color }}
          aria-live="polite"
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
