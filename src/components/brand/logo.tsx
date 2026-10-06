import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Wordmark text. The brand name is the same in every language, so it is not translated. */
const BRAND_NAME = 'Study Bro';

interface LogoProps {
  /** `full` = mark + wordmark, `mark` = icon only. */
  variant?: 'full' | 'mark';
  /** Height of the mark in px. The wordmark scales with it. */
  size?: number;
  className?: string;
  /** Extra classes for the wordmark text (e.g. `max-[379px]:sr-only` to keep only the mark on a very narrow bar). */
  wordmarkClassName?: string;
}

/**
 * Study Bro logo: the original tomato-clock mark (`public/images/logo.png`, flat icon, no face — the
 * owner asked to bring this back over the Tomo-mascot header mark) and the wordmark (Baloo 2 800, `--ink`).
 * Tomo itself stays everywhere else (bubble greetings, empty states, celebration) — only the brand mark
 * reverted. Server-safe. The caller decides whether it is a link.
 */
export function Logo({ variant = 'full', size = 28, className, wordmarkClassName }: LogoProps) {
  const mark = (
    <Image
      src="/images/logo.png"
      alt={variant === 'mark' ? BRAND_NAME : ''}
      width={size}
      height={size}
      className="shrink-0"
      style={{ width: size, height: size }}
      priority
    />
  );
  if (variant === 'mark') {
    return <span className={cn('inline-flex shrink-0', className)}>{mark}</span>;
  }
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {mark}
      <span
        className={cn('whitespace-nowrap font-heading font-extrabold leading-none tracking-[-0.02em] text-ink', wordmarkClassName)}
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        {BRAND_NAME}
      </span>
    </span>
  );
}
