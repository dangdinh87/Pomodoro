'use client';

import NumberFlow from '@number-flow/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';

interface AnimatedCountdownProps {
  timeLeft: number; // in seconds
  totalTime: number; // in seconds
  mode: 'work' | 'shortBreak' | 'longBreak';
  isRunning: boolean;
}

/**
 * Animated Countdown Component
 * Inspired by Skiper UI - https://skiper-ui.com/v1/skiper37
 * Uses Number Flow for smooth digit transitions with minimalist design
 *
 * @author Adapted for Pomodoro Timer
 */
export function AnimatedCountdown({
  timeLeft,
  totalTime,
  mode,
  isRunning,
}: AnimatedCountdownProps) {
  const { t } = useI18n();

  // Validate inputs to prevent NaN display
  const validTimeLeft = Number.isFinite(timeLeft) && timeLeft >= 0 ? timeLeft : 0;

  const minutes = Math.floor(validTimeLeft / 60);
  const seconds = validTimeLeft % 60;

  // Simple color scheme based on mode - minimal like original
  const modeColors = {
    work: 'text-foreground',
    shortBreak: 'text-foreground',
    longBreak: 'text-foreground',
  };

  const textColor = modeColors[mode];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full select-none">
      {/* Main countdown display - simple and large like Skiper UI */}
      <div className="relative flex items-center justify-center">
        <div className={cn(
          'font-mono text-[20vw] sm:text-[18vw] md:text-[16vw] lg:text-[14vw] xl:text-[12vw]',
          'font-bold tracking-tight leading-none',
          textColor
        )}>
          {/* Display minutes:seconds separately for proper NumberFlow animation */}
          <div className="flex items-center">
            <NumberFlow
              value={minutes}
              format={{ minimumIntegerDigits: 2 }}
              animated
              willChange
              transformTiming={{
                duration: 600,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              spinTiming={{
                duration: 600,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
              }}
              opacityTiming={{
                duration: 350,
                easing: 'ease-out',
              }}
            />
            <span className="mx-1">:</span>
            <NumberFlow
              value={seconds}
              format={{ minimumIntegerDigits: 2 }}
              animated
              willChange
              transformTiming={{
                duration: 600,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              spinTiming={{
                duration: 600,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
              }}
              opacityTiming={{
                duration: 350,
                easing: 'ease-out',
              }}
            />
          </div>
        </div>
      </div>

      {/* Subtle mode indicator below timer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="mt-8 text-sm uppercase tracking-wider text-muted-foreground"
      >
        {mode === 'work' ? t('timerComponents.animatedCountdown.modes.focus') : mode === 'shortBreak' ? t('timerComponents.animatedCountdown.modes.shortBreak') : t('timerComponents.animatedCountdown.modes.longBreak')}
      </motion.div>
    </div>
  );
}
