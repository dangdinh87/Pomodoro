import { memo } from 'react';
import { cn } from '@/lib/utils';

export type ProgressBarClockProps = {
  formattedTime: string;
  progressPercent: number;
};

export const ProgressBarClock = memo(
  ({ formattedTime, progressPercent }: ProgressBarClockProps) => (
    <div className="text-center">
      <div className="mb-4">
        <div className={cn('text-3xl font-bold timer-state-transition')}>
          {formattedTime}
        </div>
      </div>
      <div className="w-full bg-white/15 backdrop-blur-sm rounded-full h-8 mb-4 border border-white/10">
        <div
          className="h-8 rounded-full transition-all duration-1000"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: 'hsl(var(--timer-foreground))',
          }}
        />
      </div>
      <div className="text-sm text-white/70">
        {Math.round(progressPercent)}% Complete
      </div>
    </div>
  ),
);
ProgressBarClock.displayName = 'ProgressBarClock';
