/**
 * Not Found Page - server-translated (locale from the app.lang cookie)
 */
import { Tomo } from '@/components/brand/tomo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getT } from '@/lib/server-translations';

export default async function NotFound() {
  const t = await getT();
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page px-4 text-ink">
      <div className="flex max-w-md flex-col items-center text-center">
        <Tomo face="sleepy" size={144} title={t('notFound.tomoAlt')} className="mb-4" />
        <p className="font-heading text-sm font-bold tabular-nums text-ink-muted">404</p>
        <h1 className="mt-1 font-heading text-[1.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
          {t('notFound.title')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t('notFound.description')}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">{t('notFound.backToTimer')}</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/guide">{t('site.notFound.guide')}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
