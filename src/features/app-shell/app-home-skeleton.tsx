import { Logo } from '@/components/brand/logo';
import { Tomo } from '@/components/brand/tomo';

/**
 * What `/` shows in the server HTML while the real app (client-only) downloads: the timer card with a
 * static "25:00". It is the page's LCP, so it paints from HTML without waiting for JS, and it has the
 * same frame as the app (same `min-h-dvh` section, same padding, a card of the same width and height,
 * digits at the same size) so mounting the app moves nothing. Decorative: assistive tech meets the
 * real, labelled timer once it mounts. Server-safe (no hooks), because it renders during SSR.
 *
 * Block heights mirror `EnhancedTimer` (bubble row, mode chips, clock + progress + tomatoes, controls
 * + task picker). If that layout changes, re-measure card and digits at 390 and 1440 (batch 2.4a report).
 */
export function AppHomeSkeleton() {
  return (
    <section
      aria-hidden="true"
      data-testid="app-home-skeleton"
      className="relative flex min-h-dvh w-full flex-col items-center justify-center px-[clamp(16px,4vw,32px)] pb-24 pt-16"
    >
      <div className="absolute inset-x-0 top-0 flex h-16 items-center px-[clamp(16px,4vw,32px)] pt-[env(safe-area-inset-top)]">
        <Logo size={28} />
      </div>

      <div className="sticker-lg z-10 flex w-full max-w-[560px] flex-col items-center p-5 sm:p-8">
        {/* Tomo + the greeting bubble */}
        <div className="mb-4 flex min-h-[72px] w-full items-center gap-3 max-sm:min-h-[87px]">
          <Tomo face="happy" size={64} tight className="shrink-0" />
          <span className="skeleton h-14 flex-1 rounded-[20px]" />
        </div>

        {/* Mode chips */}
        <div className="flex h-[60px] items-center gap-2">
          <span className="skeleton h-10 w-20 rounded-full" />
          <span className="skeleton h-10 w-28 rounded-full" />
          <span className="skeleton h-10 w-28 rounded-full" />
        </div>

        {/* Clock, progress bar, session tomatoes */}
        <div className="flex w-full flex-col items-center gap-4">
          <div className="font-heading text-[clamp(72px,27vw,160px)] font-extrabold leading-none tracking-[0.02em] tabular-nums text-ink">
            25:00
          </div>
          <span className="h-[18px] w-full rounded-full border-sticker bg-surface-raised" />
          <span className="h-7" />
        </div>

        {/* Controls, key hint, task picker */}
        <div className="mt-7 flex w-full flex-col items-center gap-5">
          <div className="flex h-14 w-full items-center gap-3">
            <span className="skeleton size-12 shrink-0 rounded-full" />
            <span className="skeleton h-[50px] flex-1 rounded-[var(--radius)]" />
            <span className="skeleton size-12 shrink-0 rounded-full" />
          </div>
          <span className="h-[13px] [@media(hover:none)]:hidden" />
          <span className="h-12 w-full rounded-[var(--radius)] border-2 border-dashed border-border" />
        </div>
      </div>
    </section>
  );
}
