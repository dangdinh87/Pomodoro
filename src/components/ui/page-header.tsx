import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const WIDTHS = { narrow: 'max-w-[880px]', wide: 'max-w-[1180px]' } as const;

export function PageContainer({
  size = 'wide',
  className,
  children,
}: {
  size?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('mx-auto w-full px-[clamp(16px,4vw,32px)] pb-16 pt-8 md:pt-10', WIDTHS[size], className)}>
      {children}
    </div>
  );
}

/**
 * Padding for page content rendered inside a sheet or dialog panel. The panel's round close button sits
 * 16px from the top right corner (OverlayClose, 32px wide), so a header placed straight under it gets
 * `pr-10`: its actions (a "..." menu, view chips) stop short of the button instead of overlapping it.
 */
export function PanelBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-5 pb-10 pt-6 sm:px-8 sm:pt-8 [&>header]:pr-10', className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0 space-y-1.5">
        <h1 className="font-heading text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink">{title}</h1>
        {description && <p className="text-[0.9375rem] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Small section heading inside a page (sentence case, no all-caps eyebrow). */
export function SectionHeading({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>
      <h2 className="font-heading text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">{children}</h2>
      {action}
    </div>
  );
}
