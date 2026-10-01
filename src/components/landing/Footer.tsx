/**
 * Site footer: server-rendered links (SEO) with the language switcher as the only client island.
 * Used on `/` below the timer and on the standalone content pages.
 */
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getT } from '@/lib/server-translations';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { PanelLink } from './panel-link';

const LINK =
  'rounded text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand';

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </nav>
  );
}

export async function Footer() {
  const t = await getT();
  return (
    <footer className="border-t border-border bg-surface-page px-[clamp(16px,4vw,32px)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand">
              <Image src="/images/logo.png" alt="" width={28} height={28} className="size-7" />
              <span className="font-heading text-lg font-bold tracking-[-0.02em] text-ink">{t('brand.title')}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t('site.footer.tagline')}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            <Column title={t('site.footer.product')}>
              <li><Link href="/" className={LINK}>{t('site.footer.timer')}</Link></li>
              <li><PanelLink panel="tasks" className={LINK}>{t('shell.panels.tasks')}</PanelLink></li>
              <li><PanelLink panel="stats" className={LINK}>{t('shell.panels.stats')}</PanelLink></li>
              <li><PanelLink panel="scene" className={LINK}>{t('shell.panels.scene')}</PanelLink></li>
              <li><PanelLink panel="sound" className={LINK}>{t('shell.panels.sound')}</PanelLink></li>
              <li><PanelLink panel="arcade" className={LINK}>{t('shell.panels.arcade')}</PanelLink></li>
            </Column>
            <Column title={t('site.footer.learn')}>
              <li><Link href="/guide" className={LINK}>{t('site.footer.guide')}</Link></li>
              <li><Link href="/guide#shortcuts" className={LINK}>{t('site.footer.shortcuts')}</Link></li>
              <li><PanelLink panel="feedback" className={LINK}>{t('shell.panels.feedback')}</PanelLink></li>
            </Column>
            <Column title={t('site.footer.legal')}>
              <li><Link href="/privacy" className={LINK}>{t('landing.footer.links.privacy')}</Link></li>
              <li><Link href="/terms" className={LINK}>{t('landing.footer.links.terms')}</Link></li>
            </Column>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-border py-6 sm:flex-row sm:items-center">
          <p className="text-sm text-ink-muted">
            © {new Date().getFullYear()} {t('brand.title')}. {t('landing.footer.rightsReserved')}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
