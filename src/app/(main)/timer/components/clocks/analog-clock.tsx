'use client';

import { memo } from 'react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import { useAnalogClockState } from './use-analog-clock-state';

export type AnalogClockProps = {
  formattedTime: string;
  totalTimeForMode: number;
  timeLeft: number;
  clockSize?: 'small' | 'medium' | 'large';
  isRunning: boolean;
};

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const sizeClasses = {
  small: { container: 'w-64 h-64 md:w-80 md:h-80', text: 'text-4xl md:text-5xl' },
  medium: { container: 'w-80 h-80 md:w-96 md:h-96', text: 'text-5xl md:text-6xl' },
  large: { container: 'w-96 h-96 md:w-[26rem] md:h-[26rem]', text: 'text-6xl md:text-8xl' },
};

const numberFlowTiming = {
  transform: { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' as const },
  spin: { duration: 600, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' as const },
  opacity: { duration: 350, easing: 'ease-out' as const },
};

export const AnalogClock = memo(
  ({
    totalTimeForMode,
    timeLeft,
    clockSize = 'medium',
    isRunning,
  }: AnalogClockProps) => {
    const animConfig = useAnalogClockState({ timeLeft, isRunning });

    const total = totalTimeForMode || 1;
    const elapsed = (total - timeLeft) / total; // 0→1 as time passes
    const remaining = 1 - elapsed;

    // Countdown arc: gap at start (elapsed), solid at end (remaining)
    // Gap sweeps clockwise from 12 o'clock, remaining arc shrinks behind it
    const gapLength = CIRCUMFERENCE * elapsed;
    const solidLength = CIRCUMFERENCE * remaining;

    // Head dot at the boundary between gap and remaining (sweeps clockwise)
    const angle = elapsed * 2 * Math.PI;
    const headX = 100 + RADIUS * Math.cos(angle);
    const headY = 100 + RADIUS * Math.sin(angle);

    // Derive minutes/seconds for NumberFlow
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const size = sizeClasses[clockSize];

    const svgClassName = cn(
      'w-full h-full transform -rotate-90',
      (animConfig.state === 'urgent' || animConfig.state === 'critical') && 'animate-clock-pulse',
      'clock-color-transition',
    );

    return (
      <div className="text-center">
        <div
          className={cn('relative mx-auto mb-4', size.container)}
          style={{ color: animConfig.color }}
        >
          <svg
            className={svgClassName}
            viewBox="0 0 200 200"
            aria-label="Analog countdown"
          >
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              strokeWidth="6"
              stroke="currentColor"
              fill="none"
              opacity="0.15"
            />

            {/* Progress arc: gap (elapsed) then solid (remaining) */}
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              strokeWidth="6"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`0 ${gapLength} ${solidLength}`}
              className="transition-[stroke-dasharray] duration-1000"
            />

            {/* Inner accent ring */}
            <circle
              cx="100"
              cy="100"
              r="82"
              strokeWidth="1"
              stroke="currentColor"
              fill="none"
              opacity="0.2"
            />

            {/* Head dot with pulse aura (visible only when progress > 1%) */}
            {elapsed > 0.01 && (
              <>
                {isRunning && (
                  <circle
                    cx={headX}
                    cy={headY}
                    r="8"
                    fill="currentColor"
                    className="animate-clock-dot-pulse"
                    opacity="0"
                  />
                )}
                <circle
                  cx={headX}
                  cy={headY}
                  r="4"
                  fill="currentColor"
                  className="transition-all duration-300"
                  opacity={0.9}
                />
              </>
            )}
          </svg>

          {/* Center: NumberFlow time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                size.text,
                'font-space-grotesk font-bold tabular-nums',
                'clock-color-transition',
              )}
              style={{ color: animConfig.color }}
            >
              <div className="flex items-center">
                <NumberFlow
                  value={minutes}
                  format={{ minimumIntegerDigits: 2 }}
                  animated
                  willChange
                  transformTiming={numberFlowTiming.transform}
                  spinTiming={numberFlowTiming.spin}
                  opacityTiming={numberFlowTiming.opacity}
                />
                <span className="mx-0.5">:</span>
                <NumberFlow
                  value={seconds}
                  format={{ minimumIntegerDigits: 2 }}
                  animated
                  willChange
                  transformTiming={numberFlowTiming.transform}
                  spinTiming={numberFlowTiming.spin}
                  opacityTiming={numberFlowTiming.opacity}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
AnalogClock.displayName = 'AnalogClock';
