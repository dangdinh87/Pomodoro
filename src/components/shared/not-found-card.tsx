/**
 * The 404 page body, shared by `[lang]/not-found.tsx` (translated by the I18nProvider) and
 * `global-not-found.tsx` (English, no providers). It brings its own next-themes provider: both
 * render outside the (main) and (landing) layouts, so the saved Light/Dark/System choice is
 * applied before paint (no flash) and the sticker tokens follow it, like every other page.
 */
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';
import { Tomo } from '@/components/brand/tomo';
import { Button } from '@/components/ui/button';
import { StickerCard } from '@/components/ui/sticker-card';

export function NotFoundCard({
  t,
  homeHref,
  guideHref,
}: {
  t: (key: string) => string;
  homeHref: string;
  guideHref: string;
}) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange>
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 text-ink">
        <StickerCard size="lg" tilt="left" className="flex w-full max-w-md flex-col items-center p-8 text-center sm:p-10">
          <Tomo face="sleepy" size={144} title={t('notFound.tomoAlt')} />
          <p className="mt-4 rounded-full border-2 border-outline bg-candy-butter px-3 py-0.5 font-heading text-sm font-extrabold tabular-nums text-on-accent">
            404
          </p>
          <h1 className="mt-3 text-balance font-heading text-[1.75rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            {t('notFound.title')}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-secondary">{t('notFound.description')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={homeHref}>{t('notFound.backToTimer')}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={guideHref}>{t('site.notFound.guide')}</Link>
            </Button>
          </div>
        </StickerCard>
      </main>
    </ThemeProvider>
  );
}
