'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollArrows } from '@/hooks/use-scroll-arrows';

/** Filter / state toggle. Outlined pill; selected = accent-solid with on-accent text and a small hard shadow. Navigation uses TabsList instead. */
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
      data-active={active}
      className={cn(
        // outline-offset-1 keeps the 3px focus ring within FilterChipGroup's 4px scroll padding
        'focus-ring inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-outline px-3.5 font-heading text-[0.875rem] font-bold leading-none transition-[background-color,color,box-shadow,transform] duration-100 focus-visible:outline-offset-1 active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
        active
          ? 'bg-primary text-on-accent shadow-sticker-sm hover:bg-(--accent-solid-hover)'
          : 'bg-surface text-ink-secondary hover:bg-surface-hover hover:text-ink',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cn('font-body font-semibold tabular-nums', active ? 'text-on-accent' : 'text-ink-muted')}>{count}</span>
      )}
    </button>
  );
}

export function FilterChipGroup({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  // Same element, same classes as before either way (zero layout risk for the many call sites that pass
  // their own sizing classes here) — only a data attribute toggles, which globals.css reads to fade the
  // edge where there's more to scroll to. Rows that wrap (className="flex-wrap") never overflow
  // horizontally, so canScroll* stay false there and this is a no-op for them.
  const { scrollRef, canScrollLeft, canScrollRight } = useScrollArrows<HTMLDivElement>();
  return (
    // p-1/-m-1: overflow-x-auto also clips on Y, which cut the chips' focus ring; pad it back, offset the layout.
    <div
      ref={scrollRef}
      role="group"
      aria-label={label}
      data-scroll-left={canScrollLeft || undefined}
      data-scroll-right={canScrollRight || undefined}
      className={cn('-m-1 flex items-center gap-2 overflow-x-auto p-1 scrollbar-hide chip-scroll-fade', className)}
    >
      {children}
    </div>
  );
}
