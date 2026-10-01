import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { getT } from '@/lib/server-translations';

/** Header for the standalone content pages (guide, legal); the app itself lives on `/`. */
export async function SiteHeader() {
  const t = await getT();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface-page">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-4 px-[clamp(16px,4vw,32px)]">
        <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand">
          <Image src="/images/logo.png" alt="" width={26} height={26} className="size-[26px]" />
          <span className="font-heading text-[0.9375rem] font-bold tracking-[-0.02em] text-ink">{t('brand.title')}</span>
        </Link>
        <nav aria-label={t('site.header.nav')} className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/guide"
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t('nav.guide')}
          </Link>
          <Button size="sm" asChild>
            <Link href="/">
              {t('shell.openTimer')}
              <ArrowRight size={14} weight="bold" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
