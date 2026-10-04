'use client';

import { memo, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import { useAnalogClockState } from './use-analog-clock-state';
import { ClockDigits, clockDigitScale } from './clock-digits';

export type AnalogClockProps = {
  formattedTime: string;
  totalTimeForMode: number;
  timeLeft: number;
  clockSize?: 'small' | 'medium' | 'large';
  isRunning: boolean;
  warn?: boolean;
};

// Geometry in viewBox units (200 x 200): a cream face, a groove with the time left drawn as an outlined arc,
// a dark-brown hand that points at how much time has gone, and the digits in the middle.
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_WIDTH = 11;
const ARC_OUTLINE = 1.7;

// Side of the face. Viewport-based like the other 2D clocks; the 76vw cap keeps it inside the timer card
// on a phone. The digits are a fixed share of the face, so they never touch the hand.
const sizeClasses = {
  small: '[--clock-w:min(64vw,clamp(12rem,27vmin,18rem))]',
  medium: '[--clock-w:min(76vw,clamp(15rem,34vmin,22rem))]',
  large: '[--clock-w:min(80vw,clamp(16rem,40vmin,26rem))]',
};

export const AnalogClock = memo(
  ({
    totalTimeForMode,
    timeLeft,
    clockSize = 'medium',
    isRunning,
    warn = true,
  }: AnalogClockProps) => {
    const { t } = useTranslation();
    const animConfig = useAnalogClockState({ timeLeft, isRunning, warn });

    const total = totalTimeForMode || 1;
    const elapsed = Math.min(1, Math.max(0, (total - timeLeft) / total)); // 0→1 as time passes
    const remaining = 1 - elapsed;

    // Countdown arc: gap at start (elapsed), solid at end (remaining). The gap sweeps clockwise from 12 o'clock.
    const gapLength = CIRCUMFERENCE * elapsed;
    const solidLength = CIRCUMFERENCE * remaining;
    const dash = `0 ${gapLength} ${solidLength}`;
    const angleDeg = elapsed * 360;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const warning = animConfig.state === 'urgent' || animConfig.state === 'critical';
    const arcColor = warning ? animConfig.accent : 'var(--accent-solid)';

    const svgClassName = cn('h-full w-full', animConfig.pulse && 'animate-clock-pulse', 'clock-color-transition');

    return (
      <div className="text-center">
        <div
          className={cn('relative mx-auto h-(--clock-w) w-(--clock-w)', sizeClasses[clockSize])}
          role="timer"
          aria-live="off"
          aria-label={t('timer.aria.timeRemaining').replace('{time}', `${minutes}:${String(seconds).padStart(2, '0')}`)}
        >
          {/* Rotation wrapper separated from SVG so animate-clock-pulse scale doesn't override -rotate-90 */}
          <div className="h-full w-full -rotate-90 transform">
            <svg className={svgClassName} viewBox="0 0 200 200" aria-hidden="true">
              {/* Face: cream disc with the sticker outline (always 2.5px on screen, whatever the clock size) */}
              <circle
                cx="100"
                cy="100"
                r="97"
                fill="var(--surface-raised)"
                stroke="var(--outline)"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: 'var(--outline-w)' }}
              />

              {/* Groove the arc runs in */}
              <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="var(--surface)" strokeWidth={ARC_WIDTH + ARC_OUTLINE * 2} />

              {/* Time left: ink underlay, then the colour on top, so the arc has the same outline as every sticker */}
              {remaining > 0 && (
                <>
                  <circle
                    cx="100"
                    cy="100"
                    r={RADIUS}
                    fill="none"
                    stroke="var(--outline)"
                    strokeWidth={ARC_WIDTH + ARC_OUTLINE * 2}
                    strokeLinecap="round"
                    strokeDasharray={dash}
                    className="transition-[stroke-dasharray] duration-1000"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={RADIUS}
                    fill="none"
                    stroke={arcColor}
                    strokeWidth={ARC_WIDTH}
                    strokeLinecap="round"
                    strokeDasharray={dash}
                    className="transition-[stroke-dasharray] duration-1000"
                  />
                </>
              )}

              {/* 12 ticks, one per twelfth of the phase, inside the groove */}
              {Array.from({ length: 12 }, (_, i) => (
                <line
                  key={i}
                  x1="100"
                  y1={i % 3 === 0 ? '30' : '34'}
                  x2="100"
                  y2="40"
                  stroke="var(--outline)"
                  strokeWidth={i % 3 === 0 ? 3 : 2}
                  strokeLinecap="round"
                  opacity={i % 3 === 0 ? 0.7 : 0.4}
                  transform={`rotate(${i * 30} 100 100)`}
                />
              ))}

              {/* Hand: dark brown, from just outside the digits to the groove, ending in a knob that rides the arc */}
              <g
                className="transition-transform duration-1000 ease-linear"
                style={{ transform: `rotate(${angleDeg}deg)`, transformOrigin: '100px 100px' }}
              >
                <line x1="157" y1="100" x2="173" y2="100" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" />
                {isRunning && (
                  <circle cx="180" cy="100" r="11" fill={arcColor} className="animate-clock-dot-pulse" opacity="0" />
                )}
                <circle cx="180" cy="100" r="7.5" fill="var(--surface)" stroke="var(--outline)" strokeWidth="2.6" />
                <circle cx="180" cy="100" r="2.4" fill="var(--outline)" />
              </g>
            </svg>
          </div>

          {/* Center: fixed-width digits */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn('font-heading font-extrabold leading-none', 'clock-color-transition')}
              style={
                {
                  color: animConfig.color,
                  fontSize: 'calc(var(--clock-w) * 0.17 * var(--clock-scale, 1))',
                  '--clock-scale': clockDigitScale(minutes),
                } as CSSProperties
              }
              aria-hidden="true"
            >
              <ClockDigits minutes={minutes} seconds={seconds} dotColor={warning ? animConfig.accent : undefined} />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
AnalogClock.displayName = 'AnalogClock';
