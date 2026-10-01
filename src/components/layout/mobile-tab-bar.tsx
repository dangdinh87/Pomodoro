'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getVisibleNav, isNavActive } from '@/config/app-navigation';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

export function MobileTabBar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = getVisibleNav();

  return (
    <nav
      data-chrome
      aria-label={t('nav.navigation')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-safe backdrop-blur-md md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ href, labelKey, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 pb-2 pt-2.5 text-[0.6875rem] leading-none transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand',
                  active ? 'font-semibold text-ink' : 'font-medium text-ink-muted',
                )}
              >
                <Icon size={22} weight={active ? 'fill' : 'regular'} className={active ? 'text-brand' : undefined} />
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
