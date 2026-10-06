import { cn } from '@/lib/utils';

/**
 * Time spent in the phase: an 18px outlined bar, filled with the mode colour, with a soft highlight inside.
 * Decorative (the clock itself is the timer); the width glides by a second per tick unless motion is reduced.
 */
export function TimerProgress({ percent, reduceMotion }: { percent: number; reduceMotion: boolean }) {
  const width = Math.min(100, Math.max(0, percent));
  return (
    <div aria-hidden="true" data-timer-progress className="h-[18px] w-full overflow-hidden rounded-full border-sticker bg-surface-raised">
      <div
        className={cn(
          'relative h-full rounded-full bg-primary',
          width > 0 && width < 99 && 'border-r-[length:var(--outline-w)] border-outline',
          width === 0 && 'invisible',
          !reduceMotion && 'transition-[width] duration-1000 ease-linear',
        )}
        style={{ width: `${width}%` }}
      >
        <span className="absolute inset-x-2.5 top-[3px] h-1 rounded-full bg-white/45" />
      </div>
    </div>
  );
}
