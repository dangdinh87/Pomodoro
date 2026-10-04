'use client';

import { AppProviders } from '@/components/providers/app-providers';
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
  return (
    <AppProviders>
      <SkipLink />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
    </AppProviders>
  );
}
