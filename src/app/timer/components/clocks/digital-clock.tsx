import { cn } from '@/lib/utils';
import type React from 'react';
import { memo } from 'react';

export type DigitalClockProps = {
  timeRef: React.RefObject<HTMLDivElement>;
  formattedTime: string;
  isRunning: boolean;
  progressPercent: number;
  lowWarnEnabled: boolean;
  timeLeft: number;
};

export const DigitalClock = memo(
  ({ timeRef, formattedTime, lowWarnEnabled, timeLeft }: DigitalClockProps) => {
    const isLow = timeLeft <= 10 && lowWarnEnabled;
    return (
      <div className="text-center">
        <div
          ref={timeRef}
          className={cn('text-7xl md:text-8xl font-bold mb-4 relative')}
          aria-live="polite"
          aria-label={`Time remaining: ${formattedTime}`}
        >
          {formattedTime}
        </div>
      </div>
    );
  },
);
DigitalClock.displayName = 'DigitalClock';
