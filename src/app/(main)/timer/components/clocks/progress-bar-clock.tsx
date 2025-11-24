import { useTranslation } from '@/contexts/i18n-context';
import { memo } from 'react';
import { cn } from '@/lib/utils';

export type ProgressBarClockProps = {
  formattedTime: string;
  progressPercent: number;
  clockSize?: 'small' | 'medium' | 'large';
};

export const ProgressBarClock = memo(
  ({ formattedTime, progressPercent, clockSize = 'medium' }: ProgressBarClockProps) => {
    const { t } = useTranslation();

    // Size mappings
    const sizeClasses = {
      small: { time: 'text-5xl md:text-6xl', bar: 'h-2 md:h-3', spacing: 'mb-3' },
      medium: { time: 'text-6xl md:text-8xl', bar: 'h-3 md:h-4', spacing: 'mb-6' },
      large: { time: 'text-7xl md:text-9xl', bar: 'h-4 md:h-5', spacing: 'mb-8' },
    };

    const size = sizeClasses[clockSize];

    return (
      <div className="text-center max-w-2xl mx-auto">
        <div className={size.spacing}>
          <div className={cn(size.time, 'font-bold timer-state-transition tabular-nums')}>
            {formattedTime}
          </div>
        </div>
        <div className={cn('w-full bg-white/15 backdrop-blur-sm rounded-full border border-white/10', size.bar, size.spacing)}>
          <div
            className={cn(size.bar, 'rounded-full transition-all duration-1000')}
            style={{
              width: `${progressPercent}%`,
              backgroundColor: 'hsl(var(--timer-foreground))',
            }}
          />
        </div>
        <div className="text-sm text-white/70">
          {t('timer.progress.complete', { percent: Math.round(progressPercent) })}
        </div>
      </div>
    );
  },
);
ProgressBarClock.displayName = 'ProgressBarClock';
