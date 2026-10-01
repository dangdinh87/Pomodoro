import type { ReactNode } from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export type StatItem = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: PhosphorIcon;
};

/** Several numbers in one hairline-divided strip — never N separate cards (design-system §7.7). */
export function StatStrip({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border',
        items.length >= 4 ? 'min-[720px]:grid-cols-4' : items.length === 3 ? 'min-[720px]:grid-cols-3' : '',
        className,
      )}
    >
      {items.map(({ label, value, hint, icon: Icon }) => (
        <div key={label} className="flex min-w-0 flex-col gap-1.5 bg-surface px-5 py-4">
          <dt className="flex items-center gap-1.5 text-[0.8125rem] text-ink-muted">
            {Icon && <Icon size={14} className="shrink-0 text-ink-faint" />}
            <span className="truncate">{label}</span>
          </dt>
          <dd className="font-heading text-[clamp(1.4rem,2.4vw,1.75rem)] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">
            {value}
          </dd>
          {hint && <dd className="text-xs text-ink-muted">{hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
