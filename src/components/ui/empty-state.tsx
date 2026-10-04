'use client';

import { type ReactNode } from 'react';
import { Tomo, type TomoFace } from '@/components/brand/tomo';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** One primary action (a Button). */
  action?: ReactNode;
  className?: string;
  /** Extra classes for the mascot. */
  imageClassName?: string;
  /** Tomo's expression. */
  face?: TomoFace;
}

/**
 * Empty or error moment, spoken by Tomo: mascot, a short title, one line of direction, one action.
 * Sits on a sticker card. Nested inside another card, flatten it with `className="border-0 bg-transparent shadow-none"`.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
  imageClassName,
  face = 'happy',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'sticker flex min-h-[320px] flex-col items-center justify-center space-y-4 px-6 py-10 text-center',
        className
      )}
    >
      <Tomo face={face} size={128} className={cn('shrink-0', imageClassName)} />
      <div className="space-y-2">
        <h3 className="font-heading text-xl font-extrabold text-ink">{title}</h3>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
