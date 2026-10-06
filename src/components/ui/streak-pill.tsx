'use client';

import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

/** Flame: tomato body, gold core, outlined like every sticker. Drawn by hand rather than a Phosphor icon (spec §3.5). */
function Flame({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" className="shrink-0">
      <path
        d="M12 2.6c.4 3.2-1.4 4.6-2.8 6.4C7.6 11 6.2 12.9 6.2 15.4a5.8 5.8 0 0 0 11.6 0c0-2.2-.9-3.9-2.1-5.3-.2 1.2-.8 2-1.7 2.4.5-3.6-.2-7.5-2-9.9Z"
        fill="var(--candy-tomato)"
        stroke="var(--outline)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12.1 13.2c-1.6 1.2-2.5 2.3-2.5 3.7a2.5 2.5 0 0 0 5 0c0-1.3-.9-2.4-2.5-3.7Z"
        fill="var(--gold)"
        stroke="var(--outline)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface StreakPillProps {
  /** Consecutive days. */
  count: number;
  className?: string;
}

/**
 * Candy-butter pill: flame + day count. Reads "N-day streak" to assistive tech, in the current language.
 * Wrap it in a button or link when it needs to be pressable.
 */
export function StreakPill({ count, className }: StreakPillProps) {
  const { t } = useI18n();
  return (
    <span
      role="img"
      aria-label={t('shell.streak', { count })}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border-2 border-outline bg-candy-butter pl-2 pr-3 font-heading text-base font-extrabold leading-none text-on-accent tabular-nums shadow-sticker-sm',
        className,
      )}
    >
      <Flame size={20} />
      <span aria-hidden="true">{count}</span>
    </span>
  );
}
