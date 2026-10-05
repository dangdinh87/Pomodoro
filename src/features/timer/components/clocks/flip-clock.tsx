'use client';

import { memo, useState, useEffect, type CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import { useAnalogClockState } from './use-analog-clock-state';
import { clockDigitScale } from './clock-digits';

export type FlipClockProps = {
  formattedTime: string;
  timeLeft: number;
  isRunning: boolean;
  clockSize?: 'small' | 'medium' | 'large';
  warn?: boolean;
};

// Viewport-based on purpose (the settings gallery scales this component by measuring it). The maxima keep
// four tiles (0.82em each) and the colon inside the 560px timer card.
const sizeClasses = {
  small: { digit: 'text-[length:calc(clamp(2.5rem,14vw,5rem)*var(--clock-scale,1))]', gap: 'space-x-1.5' },
  medium: { digit: 'text-[length:calc(clamp(3rem,18vw,6.75rem)*var(--clock-scale,1))]', gap: 'space-x-2' },
  large: { digit: 'text-[length:calc(clamp(3.5rem,19vw,7.5rem)*var(--clock-scale,1))]', gap: 'space-x-3' },
};

// Tile edge: the sticker outline. The top half carries the top and sides, the bottom half the bottom and sides,
// and the hinge line between them closes the seam.
const EDGE_TOP = 'border-t-[length:var(--outline-w)] border-x-[length:var(--outline-w)] border-outline';
const SEPARATOR_DOT = 'block size-[0.13em] rounded-full border-[length:max(1.5px,0.025em)] border-outline';
const EDGE_BOTTOM = 'border-b-[length:var(--outline-w)] border-x-[length:var(--outline-w)] border-outline';

// Exported: the real-time clock view (`real-time-clock.tsx`) reuses this exact tile — same look, same
// flip mechanics — for an HH:MM:SS display that isn't a countdown, without touching this file's timer logic.
export const FlipDigit = memo(({ value, color }: { value: string; color: string }) => {
  const reduceMotion = useReducedMotion();
  const [currentVal, setCurrentVal] = useState(value);
  const [prevVal, setPrevVal] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipId, setFlipId] = useState(0);

  if (value !== currentVal) {
    setPrevVal(currentVal);
    setCurrentVal(value);
    setIsFlipping(!reduceMotion);
    setFlipId((id) => id + 1);
  }

  useEffect(() => {
    if (isFlipping) {
      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFlipping, flipId]);

  return (
    <div 
      className="relative inline-flex flex-col w-[0.82em] h-[1.3em] font-heading font-extrabold tabular-nums select-none text-center rounded-[0.14em] shadow-[0.05em_0.05em_0_var(--outline)]" 
      style={{ perspective: '400px', transformStyle: 'preserve-3d' }}
    >
      {/* STATIC TOP HALF (displays current new value) */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1/2 overflow-hidden bg-surface-raised rounded-t-[0.14em] ${EDGE_TOP}`}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <span 
          className="absolute left-1/2 -translate-x-1/2"
          style={{ 
            color,
            fontSize: 'inherit',
            lineHeight: '1.3em',
            top: '0'
          }}
        >
          {currentVal}
        </span>
      </div>

      {/* STATIC BOTTOM HALF (displays new value normally, old value only during active flip) */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden bg-surface-raised rounded-b-[0.14em] ${EDGE_BOTTOM}`}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <span 
          className="absolute left-1/2 -translate-x-1/2"
          style={{ 
            color,
            fontSize: 'inherit',
            lineHeight: '1.3em',
            bottom: '0'
          }}
        >
          {isFlipping ? prevVal : currentVal}
        </span>
      </div>

      {/* FLIPPING TOP PANEL (rotates 0deg to -90deg, displays previous old value) */}
      {isFlipping && (
        <div 
          key={`top-${flipId}`}
          className={`absolute top-0 left-0 right-0 h-1/2 overflow-hidden bg-surface-raised rounded-t-[0.14em] ${EDGE_TOP} flip-panel-top-anim`}
          style={{ 
            transformOrigin: 'bottom',
            backfaceVisibility: 'hidden',
          }}
        >
          <span 
            className="absolute left-1/2 -translate-x-1/2"
            style={{ 
              color,
              fontSize: 'inherit',
              lineHeight: '1.3em',
              top: '0'
            }}
          >
            {prevVal}
          </span>
          {/* Shadow Overlay */}
          <div className="absolute inset-0 bg-outline/25 flip-shadow-top-anim pointer-events-none" />
        </div>
      )}

      {/* FLIPPING BOTTOM PANEL (rotates 90deg to 0deg, displays current new value) */}
      {isFlipping && (
        <div 
          key={`bottom-${flipId}`}
          className={`absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden bg-surface-raised rounded-b-[0.14em] ${EDGE_BOTTOM} flip-panel-bottom-anim`}
          style={{ 
            transformOrigin: 'top',
            backfaceVisibility: 'hidden',
            transform: 'rotateX(90deg)',
          }}
        >
          <span 
            className="absolute left-1/2 -translate-x-1/2"
            style={{ 
              color,
              fontSize: 'inherit',
              lineHeight: '1.3em',
              bottom: '0'
            }}
          >
            {currentVal}
          </span>
          {/* Shadow Overlay */}
          <div className="absolute inset-0 bg-outline/25 flip-shadow-bottom-anim pointer-events-none" />
        </div>
      )}

      {/* Center divide line */}
      <div 
        className="absolute top-1/2 left-0 right-0 z-10 h-[var(--outline-w)] -translate-y-1/2 bg-outline"
      />
    </div>
  );
});
FlipDigit.displayName = 'FlipDigit';

export const FlipClock = memo(
  ({ timeLeft, isRunning, clockSize = 'medium', warn = true }: FlipClockProps) => {
    const { t } = useTranslation();
    const animConfig = useAnalogClockState({ timeLeft, isRunning, warn });
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const size = sizeClasses[clockSize];
    const warning = animConfig.state === 'urgent' || animConfig.state === 'critical';
    const dotColor = warning ? animConfig.accent : 'var(--accent-solid)';

    const minsDigits = String(mins).padStart(2, '0').split('');
    const secsDigits = String(secs).padStart(2, '0').split('');

    return (
      <div
        className="text-center"
        role="timer"
        aria-live="off"
        aria-label={t('timer.aria.timeRemaining').replace('{time}', `${mins}:${String(secs).padStart(2, '0')}`)}
      >
        {/* Flip keyframes live in globals.css (shared by every FlipDigit mount: the Pomodoro clock, the
            clock-style gallery previews, and the real-time clock), so they're declared once, not re-injected
            per instance. */}
        <div
          aria-hidden="true"
          className={cn(
            'flex justify-center items-center clock-color-transition',
            size.gap,
            size.digit,
            animConfig.pulse && 'animate-clock-pulse',
          )}
          style={{ '--clock-scale': clockDigitScale(mins) } as CSSProperties}
        >
          {/* Minutes Digits */}
          <div className="flex space-x-2">
            {minsDigits.map((digit, idx) => (
              <FlipDigit key={`min-${idx}`} value={digit} color={animConfig.color} />
            ))}
          </div>

          {/* Separator: two dots, stacked on the hinge line */}
          <div className="flex h-[1.3em] flex-col items-center justify-center gap-[0.2em] px-[0.03em]" aria-hidden="true">
            <span className={SEPARATOR_DOT} style={{ backgroundColor: dotColor }} />
            <span className={SEPARATOR_DOT} style={{ backgroundColor: dotColor }} />
          </div>

          {/* Seconds Digits */}
          <div className="flex space-x-2">
            {secsDigits.map((digit, idx) => (
              <FlipDigit key={`sec-${idx}`} value={digit} color={animConfig.color} />
            ))}
          </div>
        </div>
      </div>
    );
  },
);
FlipClock.displayName = 'FlipClock';
