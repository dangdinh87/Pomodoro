'use client';

import { memo } from 'react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import { useAnalogClockState } from './use-analog-clock-state';

export type FlipClockProps = {
  formattedTime: string;
  timeLeft: number;
  isRunning: boolean;
  clockSize?: 'small' | 'medium' | 'large';
};

const sizeClasses = {
  small: { digit: 'text-[clamp(2.5rem,7vmin,4.5rem)]', padding: 'p-[clamp(0.75rem,2vmin,1.5rem)]', separator: 'text-[clamp(2.5rem,7vmin,4.5rem)]' },
  medium: { digit: 'text-[clamp(3.5rem,10vmin,6rem)]', padding: 'p-[clamp(1rem,3vmin,2.5rem)]', separator: 'text-[clamp(3.5rem,10vmin,6rem)]' },
  large: { digit: 'text-[clamp(4.5rem,13vmin,8rem)]', padding: 'p-[clamp(1.5rem,4vmin,3rem)]', separator: 'text-[clamp(4.5rem,13vmin,8rem)]' },
};

const numberFlowTiming = {
  transform: { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' as const },
  spin: { duration: 600, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' as const },
  opacity: { duration: 350, easing: 'ease-out' as const },
};

export const FlipClock = memo(
  ({ timeLeft, isRunning, clockSize = 'medium' }: FlipClockProps) => {
    const animConfig = useAnalogClockState({ timeLeft, isRunning });
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const size = sizeClasses[clockSize];
    const isUrgentOrCritical = animConfig.state === 'urgent' || animConfig.state === 'critical';

    return (
      <div className="text-center">
        <div
          className={cn(
            'flex justify-center items-center space-x-2 clock-color-transition',
            isUrgentOrCritical && 'animate-clock-pulse',
          )}
          style={{ color: animConfig.color }}
        >
          <div
            className={cn('bg-white/10 backdrop-blur-sm border-2 rounded-lg clock-color-transition', size.padding)}
            style={{
              borderColor: animConfig.color,
              transform: 'perspective(1000px) rotateX(0deg)',
            }}
          >
            <div className={cn(size.digit, 'font-bold tabular-nums')}>
              <NumberFlow
                value={mins}
                format={{ minimumIntegerDigits: 2 }}
                animated
                willChange
                transformTiming={numberFlowTiming.transform}
                spinTiming={numberFlowTiming.spin}
                opacityTiming={numberFlowTiming.opacity}
              />
            </div>
          </div>
          <div className={cn(size.separator, 'font-bold tabular-nums')}>:</div>
          <div
            className={cn('bg-white/10 backdrop-blur-sm border-2 rounded-lg clock-color-transition', size.padding)}
            style={{
              borderColor: animConfig.color,
              transform: 'perspective(1000px) rotateX(0deg)',
            }}
          >
            <div className={cn(size.digit, 'font-bold tabular-nums')}>
              <NumberFlow
                value={secs}
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
      </div>
    );
  },
);
FlipClock.displayName = 'FlipClock';
