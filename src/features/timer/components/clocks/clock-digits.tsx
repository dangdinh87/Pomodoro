import { cn } from '@/lib/utils';

/**
 * Digits of a countdown. Every digit sits in a fixed-width cell (1ch of the heading font, Baloo 2), so the
 * row keeps the same width whatever the digits are and nothing jitters when a second ticks over. The colon is
 * two CSS dots. Sized by the font-size of the parent.
 */
export function ClockDigits({
  minutes,
  seconds,
  dotColor = 'var(--accent-solid)',
  className,
}: {
  minutes: number;
  seconds: number;
  /** Fill of the colon dots: the mode accent, or the warning colour in the last minute. */
  dotColor?: string;
  className?: string;
}) {
  const mm = String(Math.max(0, minutes)).padStart(2, '0');
  const ss = String(Math.max(0, seconds)).padStart(2, '0');
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap leading-none', className)} data-clock-digits aria-hidden="true">
      {[...mm].map((digit, i) => (
        <Digit key={`m${i}`} digit={digit} />
      ))}
      <Colon color={dotColor} />
      {[...ss].map((digit, i) => (
        <Digit key={`s${i}`} digit={digit} />
      ))}
    </span>
  );
}

function Digit({ digit }: { digit: string }) {
  return (
    <span data-clock-cell className="inline-block w-[0.9ch] text-center [font-feature-settings:'tnum'] tabular-nums">
      {digit}
    </span>
  );
}

function Colon({ color }: { color: string }) {
  const dot = 'block size-[0.15em] rounded-full border-[length:max(1.5px,0.028em)] border-outline motion-safe:transition-colors motion-safe:duration-1000';
  return (
    <span data-clock-colon className="mx-[0.03em] flex w-[0.3em] flex-col items-center justify-center gap-[0.2em]">
      <i className={dot} style={{ backgroundColor: color }} />
      <i className={dot} style={{ backgroundColor: color }} />
    </span>
  );
}

/**
 * Shrinks the font when the minutes need a third digit ("120:00"), so the row still fits the card.
 * 1 for the usual mm:ss, below 1 for longer rows.
 */
export function clockDigitScale(minutes: number): number {
  const digits = Math.max(2, String(Math.max(0, minutes)).length) + 2;
  return Math.min(1, 4 / digits);
}
