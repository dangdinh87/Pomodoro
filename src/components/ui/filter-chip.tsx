import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Filter / state toggle (docs/design-system.md §7.5). Navigation uses underline tabs instead. */
export function FilterChip({
  active,
  count,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean; count?: number; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[0.8125rem] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:pointer-events-none disabled:opacity-50',
        active
          ? 'border-primary bg-primary font-semibold text-white'
          : 'border-border font-medium text-ink-secondary hover:border-border-strong hover:bg-surface-hover hover:text-ink',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cn('tabular-nums', active ? 'text-white/80' : 'text-ink-faint')}>{count}</span>
      )}
    </button>
  );
}

export function FilterChipGroup({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className={cn('flex items-center gap-2 overflow-x-auto scrollbar-hide', className)}>
      {children}
    </div>
  );
}
