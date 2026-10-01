'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import GATracker from '@/components/trackings/ga';
import { AppProviders } from '@/components/providers/app-providers';
import { AppTopBar } from '@/components/layout/app-top-bar';
import { MobileTabBar } from '@/components/layout/mobile-tab-bar';
import { useI18n } from '@/contexts/i18n-context';

function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:ring-2 focus:ring-brand"
    >
      {t('skipLink.label')}
    </a>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTimer = pathname === '/timer';

  return (
    <AppProviders>
      <SkipLink />
      <div className="flex min-h-dvh flex-col">
        <AppTopBar overlay={isTimer} />
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <Suspense fallback={null}>
            <GATracker />
          </Suspense>
        ) : null}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex flex-1 flex-col pb-[calc(64px+env(safe-area-inset-bottom))] focus:outline-none md:pb-0"
        >
          {children}
        </main>
        <MobileTabBar />
      </div>
    </AppProviders>
  );
}
