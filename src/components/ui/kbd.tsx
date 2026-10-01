import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-border-strong bg-surface-raised px-1.5 font-mono text-[0.6875rem] leading-none text-ink-secondary',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
