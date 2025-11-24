import { memo } from 'react';
import { cn } from '@/lib/utils';

export type AnalogClockProps = {
  formattedTime: string;
  totalTimeForMode: number;
  timeLeft: number;
};

export const AnalogClock = memo(
  ({ formattedTime, totalTimeForMode, timeLeft }: AnalogClockProps) => {
    const total = totalTimeForMode || 1;
    const fraction = (total - timeLeft) / total;

    return (
      <div className="text-center">
        <div
          className="relative w-64 h-64 mx-auto mb-4"
          style={{ color: 'hsl(var(--timer-foreground))' }}
        >
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 200 200"
            aria-label="Analog countdown"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="opacity-20"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - fraction)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn('text-6xl font-bold')}>{formattedTime}</div>
          </div>
        </div>
      </div>
    );
  },
);
AnalogClock.displayName = 'AnalogClock';
