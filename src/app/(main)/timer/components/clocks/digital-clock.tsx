import { useTranslation } from '@/contexts/i18n-context';
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
  ariaLabel?: string;
};

export const DigitalClock = memo(
  ({ timeRef, formattedTime, lowWarnEnabled, timeLeft, ariaLabel }: DigitalClockProps) => {
    const { t } = useTranslation();
    const isLow = timeLeft <= 10 && lowWarnEnabled;
    console.log(formattedTime);

    return (
      <div className="text-center flex justify-center">
        <div
          ref={timeRef}
          className={cn('text-7xl md:text-9xl font-bold mb-4 font-space-grotesk tabular-nums text-white')}
          aria-live="polite"
          aria-label={ariaLabel ?? t('timer.aria.timeRemaining', { time: formattedTime })}
        >
          {formattedTime}
        </div>
      </div>
    );
  },
);
DigitalClock.displayName = 'DigitalClock';
