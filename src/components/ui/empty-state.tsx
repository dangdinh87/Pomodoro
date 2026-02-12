'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// WebP preferred (optimized); PNG fallback when WebP not yet generated
const MASCOT_WEBP = '/mascot/wolf_cute.webp';
const MASCOT_PNG = '/mascot/wolf_cute.png';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  imageClassName?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
  imageClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center space-y-4 min-h-[320px]',
        className
      )}
    >
      <div className="relative w-32 h-32 shrink-0">
        <picture>
          <source srcSet={MASCOT_WEBP} type="image/webp" />
          <img
            src={MASCOT_PNG}
            alt=""
            width={128}
            height={128}
            className={cn('object-contain w-full h-full', imageClassName)}
          />
        </picture>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
