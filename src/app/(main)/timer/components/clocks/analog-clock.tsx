import { memo } from 'react';
import { cn } from '@/lib/utils';

export type AnalogClockProps = {
  formattedTime: string;
  totalTimeForMode: number;
  timeLeft: number;
  clockSize?: 'small' | 'medium' | 'large';
};

export const AnalogClock = memo(
  ({ formattedTime, totalTimeForMode, timeLeft, clockSize = 'medium' }: AnalogClockProps) => {
    const total = totalTimeForMode || 1;
    const fraction = (total - timeLeft) / total;

    // Size mappings
    const sizeClasses = {
      small: { container: 'w-56 h-56 md:w-64 md:h-64', text: 'text-4xl md:text-5xl' },
      medium: { container: 'w-72 h-72 md:w-80 md:h-80', text: 'text-6xl md:text-7xl' },
      large: { container: 'w-80 h-80 md:w-96 md:h-96', text: 'text-7xl md:text-8xl' },
    };

    const size = sizeClasses[clockSize];

    return (
      <div className="text-center">
        <div
          className={cn('relative mx-auto mb-4', size.container)}
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
              strokeWidth="8"
              fill="none"
              className="opacity-20"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - fraction)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(size.text, 'font-bold tabular-nums')}>{formattedTime}</div>
          </div>
        </div>
      </div>
    );
  },
);
AnalogClock.displayName = 'AnalogClock';
