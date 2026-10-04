import type { Icon, IconWeight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export type IconTileTone = 'tomato' | 'mint' | 'butter' | 'lilac' | 'sky' | 'peach' | 'surface';
export type IconTileSize = 'sm' | 'md' | 'lg';

// Candy fills carry on-accent icons (dark brown, AA on every candy). The neutral tile sits on a
// raised surface instead, where on-accent would vanish in dark mode, so it uses the ink colour.
const TONES: Record<IconTileTone, string> = {
  tomato: 'bg-candy-tomato text-on-accent',
  mint: 'bg-candy-mint text-on-accent',
  butter: 'bg-candy-butter text-on-accent',
  lilac: 'bg-candy-lilac text-on-accent',
  sky: 'bg-candy-sky text-on-accent',
  peach: 'bg-candy-peach text-on-accent',
  surface: 'bg-surface-raised text-ink',
};

const SIZES: Record<IconTileSize, { box: string; icon: number }> = {
  sm: { box: 'size-7 rounded-[10px] border-2', icon: 16 },
  md: { box: 'size-9 rounded-[11px] border-2', icon: 20 },
  lg: { box: 'size-12 rounded-[12px] border-[length:var(--outline-w)]', icon: 26 },
};

interface IconTileProps {
  /** A Phosphor icon component, e.g. `Timer` from `@phosphor-icons/react/dist/ssr`. */
  icon: Icon;
  tone?: IconTileTone;
  size?: IconTileSize;
  /** Phosphor weight; `fill` suits solid candy tiles. */
  weight?: IconWeight;
  className?: string;
}

/**
 * Candy-coloured square with an outlined, rounded corner and an on-accent icon (spec §3.5).
 * Decorative (aria-hidden): the label sits next to it. Server-safe.
 */
export function IconTile({ icon: IconComponent, tone = 'surface', size = 'md', weight = 'fill', className }: IconTileProps) {
  const { box, icon } = SIZES[size];
  return (
    <span
      aria-hidden="true"
      data-tone={tone}
      data-size={size}
      className={cn('inline-flex shrink-0 items-center justify-center border-outline', box, TONES[tone], className)}
    >
      <IconComponent size={icon} weight={weight} />
    </span>
  );
}
