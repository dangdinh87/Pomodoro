/**
 * Not Found Page - server-translated (locale from the app.lang cookie)
 */
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getT } from '@/lib/server-translations';

export default async function NotFound() {
  const t = await getT();
  return (
    <main data-theme="dark" className="flex min-h-screen items-center justify-center bg-surface-page px-4 text-ink">
      <div className="flex max-w-md flex-col items-center text-center">
        <picture>
          <source srcSet="/mascot/wolf_cute.webp" type="image/webp" />
          <img src="/mascot/wolf_cute.png" alt="" width={112} height={112} className="mb-6 size-28 object-contain" />
        </picture>
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
