'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Where the secondary link points. */
  homeHref: string;
  homeLabelKey: 'errors.boundary.goHome' | 'errors.boundary.goTimer';
}

/** Shared body for route-segment error.tsx files. Needs I18nProvider above it. */
export function RouteError({
  error,
  reset,
  homeHref,
  homeLabelKey,
}: RouteErrorProps) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-2xl font-semibold">{t('errors.boundary.title')}</h1>
      <p className="max-w-md text-sm opacity-80">
        {t('errors.boundary.description')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>{t('errors.boundary.retry')}</Button>
        <Button asChild variant="outline">
          <Link href={homeHref}>{t(homeLabelKey)}</Link>
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs opacity-60">
          {t('errors.boundary.reference', { digest: error.digest })}
        </p>
      )}
    </div>
  );
}
