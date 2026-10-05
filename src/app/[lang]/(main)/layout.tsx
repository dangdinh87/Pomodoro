'use client';

import { SKIP_LINK_CLASS } from '@/components/layout/skip-link';
import { AppProviders } from '@/components/providers/app-providers';
import { useI18n } from '@/contexts/i18n-context';

function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main-content"
      className={SKIP_LINK_CLASS}
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
