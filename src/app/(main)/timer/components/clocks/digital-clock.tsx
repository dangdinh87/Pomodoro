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
  clockSize?: 'small' | 'medium' | 'large';
  ariaLabel?: string;
};

export const DigitalClock = memo(
  ({ timeRef, formattedTime, lowWarnEnabled, timeLeft, clockSize = 'medium', ariaLabel }: DigitalClockProps) => {
    const { t } = useTranslation();
    const isLow = timeLeft <= 10 && lowWarnEnabled;

    // Size mappings
    const sizeClasses = {
      small: 'text-6xl md:text-8xl',
      medium: 'text-8xl md:text-[12rem]',
      large: 'text-9xl md:text-[14rem]',
    };

    return (
      <div className="text-center flex justify-center">
        <div
          ref={timeRef}
          className={cn(sizeClasses[clockSize], 'font-bold mb-4 font-space-grotesk tabular-nums text-timer-foreground')}
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
