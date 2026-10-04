import type { ReactNode } from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { IconTile, type IconTileTone } from '@/components/ui/icon-tile';
import { cn } from '@/lib/utils';

export type StatItem = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: PhosphorIcon;
  /** Candy colour of the icon tile; cycles through the candy set when omitted. */
  tone?: IconTileTone;
};

const TONE_CYCLE: IconTileTone[] = ['butter', 'sky', 'mint', 'lilac', 'peach', 'tomato'];

/** Several numbers as a row of sticker tiles with big Baloo figures (spec §5). */
export function StatStrip({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <dl
      className={cn(
        // gap-3.5 keeps each tile's 2px hard shadow clear of its neighbour
        'grid grid-cols-2 gap-3.5',
        items.length >= 4 ? 'min-[720px]:grid-cols-4' : items.length === 3 ? 'min-[720px]:grid-cols-3' : '',
        className,
      )}
    >
      {items.map(({ label, value, hint, icon: Icon, tone }, index) => (
        <div key={label} className="sticker-sm flex min-w-0 flex-col gap-2 rounded-lg px-4 py-3.5">
          <dt className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-muted">
            {Icon && <IconTile icon={Icon} size="sm" tone={tone ?? TONE_CYCLE[index % TONE_CYCLE.length]} />}
            <span className="truncate">{label}</span>
          </dt>
          <dd className="font-heading text-[clamp(1.75rem,3vw,2.375rem)] font-extrabold leading-none tracking-[-0.02em] text-ink tabular-nums">
            {value}
          </dd>
          {hint && <dd className="text-xs text-ink-muted">{hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
