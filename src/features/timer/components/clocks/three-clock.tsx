'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import NumberFlow from '@number-flow/react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import { DigitalClock } from './digital-clock';
import { threeDStageAspect } from './clock-registry';
import { getClockVisualState, splitTime, stageWidth, type ClockSizeKey } from './clock-math';
import { useAnalogClockState } from './use-analog-clock-state';
import { isWebGLAvailable, readHeadingFont, useClockPalette } from './three/use-clock-palette';
import type { SceneId } from './three/scene-types';

// three.js + react-three-fiber only load once a 3D style is actually shown.
const ThreeClockHost = dynamic(() => import('./three/three-clock-host'), { ssr: false, loading: () => null });

export interface ThreeClockProps {
  scene: SceneId;
  timeLeft: number;
  totalTimeForMode: number;
  isRunning: boolean;
  clockSize?: ClockSizeKey;
  warn?: boolean;
  /** Settings gallery: size to this height (CSS length) inside the parent instead of to the viewport */
  fitHeight?: string;
}

const timing = {
  transform: { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' as const },
  spin: { duration: 600, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' as const },
  opacity: { duration: 350, easing: 'ease-out' as const },
};

function OverlayTime({ timeLeft, color, fontSize }: { timeLeft: number; color: string; fontSize: string }) {
  const { minutes, seconds } = splitTime(timeLeft);
  return (
    <div
      aria-hidden="true"
      className="clock-color-transition flex items-center font-heading font-bold leading-none tabular-nums tracking-[-0.02em]"
      style={{ color, fontSize }}
    >
      <NumberFlow value={minutes} format={{ minimumIntegerDigits: 2 }} animated willChange transformTiming={timing.transform} spinTiming={timing.spin} opacityTiming={timing.opacity} />
      <span className="mx-[0.03em] inline-block -translate-y-[0.06em] opacity-60">:</span>
      <NumberFlow value={seconds} format={{ minimumIntegerDigits: 2 }} animated willChange transformTiming={timing.transform} spinTiming={timing.spin} opacityTiming={timing.opacity} />
    </div>
  );
}

export const ThreeClock = memo(function ThreeClock({
  scene,
  timeLeft,
  totalTimeForMode,
  isRunning,
  clockSize = 'medium',
  warn = true,
  fitHeight,
}: ThreeClockProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [failed, setFailed] = useState(false);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const onFail = useCallback(() => setFailed(true), []);

  const visual = getClockVisualState(timeLeft, isRunning, warn);
  const palette = useClockPalette(rootRef, timeLeft, visual === 'urgent' ? 'amber' : visual === 'critical' ? 'rose' : 'none');
  const anim = useAnalogClockState({ timeLeft, isRunning, warn });

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setFailed(true);
      return;
    }
    let live = true;
    const family = readHeadingFont(rootRef.current);
    const ready = document.fonts?.load(`700 64px ${family}`) ?? Promise.resolve();
    ready.finally(() => {
      if (live) setFontFamily(family);
    });
    return () => {
      live = false;
    };
  }, []);

  if (failed) {
    return (
      <DigitalClock
        formattedTime=""
        isRunning={isRunning}
        timeLeft={timeLeft}
        totalTimeForMode={totalTimeForMode}
        clockSize={clockSize}
        warn={warn}
      />
    );
  }

  const aspect = threeDStageAspect(scene);
  const { minutes, seconds } = splitTime(timeLeft);
  const clock = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      ref={rootRef}
      role="timer"
      aria-live="off"
      aria-label={t('timer.aria.timeRemaining').replace('{time}', clock)}
      className="relative mx-auto select-none"
      style={{
        width: fitHeight ? `min(100%, calc(${fitHeight} * ${aspect}))` : stageWidth(clockSize, aspect),
        aspectRatio: String(aspect),
        containerType: 'inline-size',
      }}
    >
      <div className={cn('absolute', scene === 'tomato' ? 'inset-x-0 top-0 h-[78%]' : 'inset-0')}>
        {fontFamily && (
          <ThreeClockHost
            scene={scene}
            onFail={onFail}
            timeLeft={timeLeft}
            total={totalTimeForMode}
            running={isRunning}
            palette={palette}
            fontFamily={fontFamily}
            pointer={pointer}
            reduceMotion={reduceMotion}
          />
        )}
      </div>
      {scene === 'orbit' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <OverlayTime timeLeft={timeLeft} color={anim.color} fontSize="15.5cqw" />
        </div>
      )}
      {scene === 'tomato' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[22%] items-center justify-center">
          <OverlayTime timeLeft={timeLeft} color={anim.color} fontSize="17cqw" />
        </div>
      )}
      <span className="sr-only">{clock}</span>
    </div>
  );
});
