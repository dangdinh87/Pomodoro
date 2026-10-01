'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gear } from '@phosphor-icons/react/dist/ssr';
import { getVisibleNav, isNavActive } from '@/config/app-navigation';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';

/** `overlay` sits transparently on top of the timer's background scene. */
export function AppTopBar({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <header
      data-chrome
      className={cn(
        'sticky top-0 z-40 h-14 shrink-0',
        overlay ? 'bg-transparent' : 'border-b border-border bg-surface-page/85 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-full max-w-[1180px] items-center gap-8 px-[clamp(16px,4vw,32px)]">
        <Link
          href="/timer"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Image src="/images/logo.png" alt="" width={26} height={26} className="size-[26px]" priority />
          <span className="font-heading text-[0.9375rem] font-bold tracking-[-0.02em] text-ink">
            {t('brand.title')}
          </span>
        </Link>

        <nav aria-label={t('nav.navigation')} className="hidden h-full items-stretch gap-1 md:flex">
          {getVisibleNav().map(({ href, labelKey, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-2 px-3 text-sm transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand',
                  active ? 'font-semibold text-ink' : 'font-medium text-ink-muted hover:text-ink',
                )}
              >
                <Icon size={16} weight={active ? 'fill' : 'regular'} />
                {t(labelKey)}
                {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-t-sm bg-brand" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/settings"
            aria-label={t('nav.settings')}
            aria-current={isNavActive(pathname, '/settings') ? 'page' : undefined}
            className="flex size-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand aria-[current=page]:text-ink"
          >
            <Gear size={19} />
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
