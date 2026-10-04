/**
 * Not Found Page - server-translated (locale from the app.lang cookie).
 *
 * It renders in the root layout, outside the (main) and (landing) providers, so it brings its own
 * next-themes provider: the saved Light/Dark/System choice is applied before paint (no flash)
 * and the sticker tokens follow it, like every other page.
 */
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';
import { Tomo } from '@/components/brand/tomo';
import { Button } from '@/components/ui/button';
import { StickerCard } from '@/components/ui/sticker-card';
import { getT } from '@/lib/server-translations';

export default async function NotFound() {
  const t = await getT();
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
              <Link href="/">{t('notFound.backToTimer')}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/guide">{t('site.notFound.guide')}</Link>
            </Button>
          </div>
        </StickerCard>
      </main>
    </ThemeProvider>
  );
}
