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
 * + task picker), and every size that changes with the viewport height comes from the same `.stage-card`
 * variables (globals.css), so the card fits one screen with the dock at any height. If that layout changes,
 * re-measure card and digits at 390x664, 390x844, 1366x657 and 1440x900 (batch 2.4a and 2.7 reports).
 */
export function AppHomeSkeleton() {
  return (
    <section
      aria-hidden="true"
      data-testid="app-home-skeleton"
      data-stage-skeleton
      className="relative flex min-h-dvh w-full flex-col items-center justify-center px-[clamp(16px,4vw,32px)] pb-24 pt-16"
    >
      <div className="absolute inset-x-0 top-0 flex h-16 items-center px-[clamp(16px,4vw,32px)] pt-[env(safe-area-inset-top)]">
        <Logo size={28} />
      </div>

      <div className="stage-card sticker-lg z-10 flex w-full max-w-[560px] flex-col items-center p-(--stage-pad)">
        {/* Tomo + the greeting bubble */}
        <div className="mb-(--stage-mascot-mb) flex min-h-(--stage-tomo) w-full items-center gap-3 max-sm:min-h-[87px]">
          <Tomo face="happy" size={64} tight className="size-(--stage-tomo) shrink-0" />
          <span className="skeleton h-14 flex-1 rounded-[20px]" />
        </div>

        {/* Mode chips: 40px of chips + the gap below */}
        <div className="flex h-[calc(40px+var(--stage-chips-mb))] items-center gap-2">
          <span className="skeleton h-10 w-20 rounded-full" />
          <span className="skeleton h-10 w-28 rounded-full" />
          <span className="skeleton h-10 w-28 rounded-full" />
        </div>

        {/* Clock, progress bar, session tomatoes */}
        <div className="flex w-full flex-col items-center gap-(--stage-gap)">
          <div className="font-heading text-[clamp(76px,min(27vw,var(--stage-digits)),160px)] font-extrabold leading-none tracking-[0.02em] tabular-nums text-ink">
            25:00
          </div>
          <span className="h-[18px] w-full rounded-full border-sticker bg-surface-raised" />
          <span className="h-[30px]" />
        </div>

        {/* Controls, key hint, task picker: same nesting as the live card */}
        <div className="mt-(--stage-controls-mt) flex w-full flex-col items-center gap-(--stage-gap-lg)">
          <div className="flex w-full flex-col items-center gap-(--stage-gap-sm)">
            <div className="flex h-(--stage-btn) w-full items-center gap-3">
              <span className="skeleton size-12 shrink-0 rounded-full" />
              <span className="skeleton h-full flex-1 rounded-[var(--radius)]" />
              <span className="skeleton size-12 shrink-0 rounded-full" />
            </div>
            <span className="h-[21px] [@media(hover:none)]:hidden [@media(max-height:700px)]:hidden" />
          </div>
          <span className="h-12 w-full rounded-[var(--radius)] border-2 border-dashed border-border" />
        </div>
      </div>
    </section>
  );
}
