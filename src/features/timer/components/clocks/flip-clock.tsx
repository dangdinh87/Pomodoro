'use client';

import { memo, useState, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import { useAnalogClockState } from './use-analog-clock-state';

export type FlipClockProps = {
  formattedTime: string;
  timeLeft: number;
  isRunning: boolean;
  clockSize?: 'small' | 'medium' | 'large';
  warn?: boolean;
};

const sizeClasses = {
  small: { digit: 'text-[clamp(2.5rem,7vmin,4.5rem)]', gap: 'space-x-1', separator: 'text-[clamp(2.5rem,7vmin,4.5rem)]' },
  medium: { digit: 'text-[clamp(3.5rem,10vmin,6rem)]', gap: 'space-x-2', separator: 'text-[clamp(3.5rem,10vmin,6rem)]' },
  large: { digit: 'text-[clamp(4.5rem,13vmin,8rem)]', gap: 'space-x-3', separator: 'text-[clamp(4.5rem,13vmin,8rem)]' },
};

const FlipDigit = memo(({ value, color }: { value: string; color: string }) => {
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
      className="relative inline-flex flex-col w-[0.82em] h-[1.3em] font-heading font-bold tabular-nums select-none text-center rounded-lg shadow-[0_0.06em_0.12em_rgb(0_0_0/0.35)]" 
      style={{ perspective: '400px', transformStyle: 'preserve-3d' }}
    >
      {/* STATIC TOP HALF (displays current new value) */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden bg-surface rounded-t-lg border-t border-x border-border"
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
        className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden bg-surface rounded-b-lg border-b border-x border-border"
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
          className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden bg-surface rounded-t-lg border-t border-x border-border flip-panel-top-anim"
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
          <div className="absolute inset-0 bg-black/25 flip-shadow-top-anim pointer-events-none" />
        </div>
      )}

      {/* FLIPPING BOTTOM PANEL (rotates 90deg to 0deg, displays current new value) */}
      {isFlipping && (
        <div 
          key={`bottom-${flipId}`}
          className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden bg-surface rounded-b-lg border-b border-x border-border flip-panel-bottom-anim"
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
          <div className="absolute inset-0 bg-black/25 flip-shadow-bottom-anim pointer-events-none" />
        </div>
      )}

      {/* Center divide line */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-[1.5px] z-10 bg-border-strong"
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

    const minsDigits = String(mins).padStart(2, '0').split('');
    const secsDigits = String(secs).padStart(2, '0').split('');

    return (
      <div
        className="text-center"
        role="timer"
        aria-live="off"
        aria-label={t('timer.aria.timeRemaining').replace('{time}', `${mins}:${String(secs).padStart(2, '0')}`)}
      >
        {/* Style block for animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flip-top {
            0% { transform: rotateX(0deg); }
            100% { transform: rotateX(-90deg); }
          }
          @keyframes flip-bottom {
            0% { transform: rotateX(90deg); }
            100% { transform: rotateX(0deg); }
          }
          @keyframes flip-shadow-top {
            0% { opacity: 0; }
            100% { opacity: 0.55; }
          }
          @keyframes flip-shadow-bottom {
            0% { opacity: 0.55; }
            100% { opacity: 0; }
          }
          .flip-panel-top-anim {
            animation: flip-top 250ms ease-in forwards;
          }
          .flip-panel-bottom-anim {
            animation: flip-bottom 250ms ease-out 250ms both;
          }
          .flip-shadow-top-anim {
            animation: flip-shadow-top 250ms ease-in forwards;
          }
          .flip-shadow-bottom-anim {
            animation: flip-shadow-bottom 250ms ease-out 250ms both;
          }
        ` }} />

        <div
          aria-hidden="true"
          className={cn(
            'flex justify-center items-center clock-color-transition',
            size.gap,
            size.digit,
            animConfig.pulse && 'animate-clock-pulse',
          )}
        >
          {/* Minutes Digits */}
          <div className="flex space-x-1 md:space-x-1.5">
            {minsDigits.map((digit, idx) => (
              <FlipDigit key={`min-${idx}`} value={digit} color={animConfig.color} />
            ))}
          </div>

          {/* Separator: two dots, stacked on the hinge line */}
          <div className={cn(size.separator, 'flex h-[1.3em] flex-col items-center justify-center gap-[0.16em] px-[0.04em]')} aria-hidden="true">
            <span className="block size-[0.1em] rounded-full opacity-70" style={{ backgroundColor: animConfig.color }} />
            <span className="block size-[0.1em] rounded-full opacity-70" style={{ backgroundColor: animConfig.color }} />
          </div>

          {/* Seconds Digits */}
          <div className="flex space-x-1 md:space-x-1.5">
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
