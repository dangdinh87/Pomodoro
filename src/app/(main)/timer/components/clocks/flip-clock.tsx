import { memo } from 'react';
import { cn } from '@/lib/utils';

export type FlipClockProps = {
  formattedTime: string;
  timeLeft: number;
  clockSize?: 'small' | 'medium' | 'large';
};

export const FlipClock = memo(
  ({ formattedTime, timeLeft, clockSize = 'medium' }: FlipClockProps) => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    // Size mappings
    const sizeClasses = {
      small: { digit: 'text-5xl md:text-6xl', padding: 'p-4 md:p-5', separator: 'text-5xl md:text-6xl' },
      medium: { digit: 'text-7xl md:text-8xl', padding: 'p-6 md:p-8', separator: 'text-7xl md:text-8xl' },
      large: { digit: 'text-8xl md:text-9xl', padding: 'p-8 md:p-10', separator: 'text-8xl md:text-9xl' },
    };

    const size = sizeClasses[clockSize];

    return (
      <div className="text-center">
        <div className="flex justify-center items-center space-x-2">
          <div
            className={cn('bg-white/10 backdrop-blur-sm border-2 rounded-lg timer-state-transition', size.padding)}
            style={{
              borderColor: 'hsl(var(--timer-foreground))',
              transform: 'perspective(1000px) rotateX(0deg)',
            }}
          >
            <div className={cn(size.digit, 'font-bold tabular-nums')}>
              {mins.toString().padStart(2, '0')}
            </div>
          </div>
          <div className={cn(size.separator, 'font-bold tabular-nums')}>:</div>
          <div
            className={cn('bg-white/10 backdrop-blur-sm border-2 rounded-lg timer-state-transition', size.padding)}
            style={{
              borderColor: 'hsl(var(--timer-foreground))',
              transform: 'perspective(1000px) rotateX(0deg)',
            }}
          >
            <div className={cn(size.digit, 'font-bold tabular-nums')}>
              {secs.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
FlipClock.displayName = 'FlipClock';
