import { cn } from '@/lib/utils';
import { Tomo } from './tomo';

/** Wordmark text. The brand name is the same in every language, so it is not translated. */
const BRAND_NAME = 'Study Bro';

interface LogoProps {
  /** `full` = Tomo + wordmark, `mark` = Tomo only. */
  variant?: 'full' | 'mark';
  /** Height of the Tomo mark in px. The wordmark scales with it. */
  size?: number;
  className?: string;
  /** Extra classes for the wordmark text (e.g. `max-[379px]:sr-only` to keep only Tomo on a very narrow bar). */
  wordmarkClassName?: string;
}

/**
 * Study Bro logo: Tomo's head and the wordmark (Baloo 2 800, `--ink`).
 * Server-safe. The caller decides whether it is a link.
 */
export function Logo({ variant = 'full', size = 28, className, wordmarkClassName }: LogoProps) {
  if (variant === 'mark') {
    return <Tomo face="happy" size={size} tight title={BRAND_NAME} className={cn('shrink-0', className)} />;
  }
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Tomo face="happy" size={size} tight className="shrink-0" />
      <span
        className={cn('whitespace-nowrap font-heading font-extrabold leading-none tracking-[-0.02em] text-ink', wordmarkClassName)}
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        {BRAND_NAME}
      </span>
    </span>
  );
}
