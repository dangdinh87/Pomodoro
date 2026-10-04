'use client';

import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

function MiniTomato({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" data-filled={filled} className="shrink-0">
      <ellipse
        cx="12"
        cy="14"
        rx="9"
        ry="8"
        fill={filled ? 'var(--candy-tomato)' : 'var(--surface-raised)'}
        stroke={filled ? 'var(--outline)' : 'var(--ink-faint)'}
        strokeWidth="2"
        strokeDasharray={filled ? undefined : '3.5 2.6'}
      />
      {filled && <path d="M6.8 12.4c.6-1.6 1.8-2.4 3.2-2.7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />}
      <path
        d="M12 7.2 8.4 5.4l2.2 1.5L9.4 3.4 12 5.6l2.6-2.2-1.2 3.5 2.2-1.5Z"
        fill={filled ? '#4CC38A' : 'var(--ink-faint)'}
        stroke={filled ? 'var(--outline)' : 'none'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SessionTomatoesProps {
  /** Focus sessions finished in the current cycle. */
  completed: number;
  /** Sessions per cycle. */
  total?: number;
  /** Tomato size in px. */
  size?: number;
  className?: string;
}

/**
 * Row of mini tomatoes counting the sessions of a cycle: solid when done, dashed outline when still to come.
 * The accessible name says which session the cycle is on ("Session 2 of 4"), matching the visible label next to it.
 */
export function SessionTomatoes({ completed, total = 4, size = 22, className }: SessionTomatoesProps) {
  const { t } = useI18n();
  const done = Math.max(0, Math.min(Math.floor(completed), total));
  const current = Math.min(done + 1, total);
  return (
    <span
      role="img"
      aria-label={t('timerUi.sessionOf', { current, total })}
      data-completed={done}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <MiniTomato key={i} filled={i < done} size={size} />
      ))}
    </span>
  );
}
