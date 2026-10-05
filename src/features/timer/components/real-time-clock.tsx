'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { FlipDigit } from './clocks/flip-clock';

const TILE_GAP = 'space-x-1';
// Smaller than the Pomodoro flip clock (sizeClasses.medium in flip-clock.tsx): six tiles + two colons need
// to fit the same 560px card without the per-tile width the 4-tile countdown uses.
const DIGIT_SIZE = 'text-[length:clamp(2rem,10vw,3.75rem)]';
const SEPARATOR_DOT = 'block size-[0.13em] rounded-full border-[length:max(1.5px,0.025em)] border-outline';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Hour, minute, second of the real wall-clock time, ticking every second. */
function useWallClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() };
}

function Group({ value }: { value: number }) {
  return (
    <div className="flex space-x-1">
      {[...pad(value)].map((digit, i) => (
        <FlipDigit key={i} value={digit} color="var(--ink)" />
      ))}
    </div>
  );
}

function Separator() {
  return (
    <div className="flex h-[1.3em] flex-col items-center justify-center gap-[0.2em] px-[0.03em]" aria-hidden="true">
      <span className={SEPARATOR_DOT} style={{ backgroundColor: 'var(--accent-solid)' }} />
      <span className={SEPARATOR_DOT} style={{ backgroundColor: 'var(--accent-solid)' }} />
    </div>
  );
}

/**
 * The real-time view's clock face: current hour:minute:second, not a Pomodoro countdown.
 * Reuses FlipDigit (same tile, same flip mechanics, same reduced-motion handling) so it looks
 * and behaves like the rest of the sticker-pop clocks, without touching the countdown components.
 */
export function RealTimeClock() {
  const { t } = useTranslation();
  const { hours, minutes, seconds } = useWallClock();
  const label = t('timerUi.realClock.aria').replace(
    '{time}',
    `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  );

  return (
    <div className="text-center" role="timer" aria-live="off" aria-label={label}>
      <div className={`flex items-center justify-center ${TILE_GAP} ${DIGIT_SIZE}`} aria-hidden="true">
        <Group value={hours} />
        <Separator />
        <Group value={minutes} />
        <Separator />
        <Group value={seconds} />
      </div>
    </div>
  );
}
