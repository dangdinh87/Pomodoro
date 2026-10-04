'use client';

import { type ReactNode } from 'react';
import { Tomo, type TomoFace } from '@/components/brand/tomo';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** Extra classes for the mascot. */
  imageClassName?: string;
  /** Tomo's expression. */
  face?: TomoFace;
}

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
        'flex flex-col items-center justify-center py-12 text-center space-y-4 min-h-[320px]',
        className
      )}
    >
      <Tomo face={face} size={128} className={cn('shrink-0', imageClassName)} />
      <div className="space-y-2">
        <h3 className="font-heading text-xl font-semibold text-ink">{title}</h3>
        {description && (
          <p className="text-ink-muted max-w-sm mx-auto text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
