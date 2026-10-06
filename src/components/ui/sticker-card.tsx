import * as React from 'react';
import { cn } from '@/lib/utils';

export type StickerCardTilt = 'left' | 'right' | 'none';
export type StickerCardSize = 'sm' | 'md' | 'lg';

// size picks the sticker depth: sm = small shadow + 12px radius, md = card, lg = modal-like (6px shadow, 28px radius).
const SIZES: Record<StickerCardSize, string> = {
  sm: 'sticker-sm p-3',
  md: 'sticker p-5',
  lg: 'sticker-lg p-6',
};

const TILTS: Record<StickerCardTilt, string> = {
  left: 'tilt-l',
  right: 'tilt-r',
  none: '',
};

export interface StickerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Playful +/-1deg rotation. Decorative cards only (landing, celebration), never forms, lists or tables. */
  tilt?: StickerCardTilt;
  size?: StickerCardSize;
}

/**
 * A self-contained sticker: outline, hard shadow, padding and an optional tilt. For decorative tiles
 * (landing, celebration). For structured content with header and footer, use `Card`.
 */
export const StickerCard = React.forwardRef<HTMLDivElement, StickerCardProps>(
  ({ tilt = 'none', size = 'md', className, ...props }, ref) => (
    <div ref={ref} data-tilt={tilt} data-size={size} className={cn(SIZES[size], TILTS[tilt], className)} {...props} />
  ),
);
StickerCard.displayName = 'StickerCard';
