import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Key cap: outlined with a 1px hard shadow, so shortcuts read as little keys. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-[6px] border-2 border-outline bg-surface-raised px-1.5 font-mono text-[0.6875rem] font-bold leading-none text-ink-secondary shadow-[1px_1px_0_var(--outline)]',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
