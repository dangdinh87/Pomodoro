import { memo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type FlipClockProps = {
  formattedTime: string;
  progressPercent: number;
  timeLeft: number;
};

export const FlipClock = memo(
  ({ formattedTime, progressPercent, timeLeft }: FlipClockProps) => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
      <div className="text-center">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div
            className="bg-white/10 backdrop-blur-sm border-2 p-4 rounded-lg timer-state-transition"
            style={{
              borderColor: 'hsl(var(--timer-foreground))',
              transform: 'perspective(1000px) rotateX(0deg)',
            }}
          >
            <div className={cn('text-6xl   font-bold')}>
              {mins.toString().padStart(2, '0')}
            </div>
          </div>
          <div className={cn('text-6xl   font-bold')}>:</div>
          <div
            className="bg-white/10 backdrop-blur-sm border-2 p-4 rounded-lg timer-state-transition"
            style={{
              borderColor: 'hsl(var(--timer-foreground))',
              transform: 'perspective(1000px) rotateX(0deg)',
            }}
          >
            <div className={cn('text-6xl   font-bold')}>
              {secs.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
        <div className="relative">
          <Progress
            value={progressPercent}
            className="w-full h-3 bg-white/20"
          />
        </div>
      </div>
    );
  },
);
FlipClock.displayName = 'FlipClock';
