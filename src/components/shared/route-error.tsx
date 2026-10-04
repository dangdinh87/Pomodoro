'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Tomo } from '@/components/brand/tomo';
import { Button } from '@/components/ui/button';
import { StickerCard } from '@/components/ui/sticker-card';
import { useI18n } from '@/contexts/i18n-context';
import { localePath } from '@/lib/i18n/locale-path';
import { reportClientError } from '@/lib/observability/report-client-error';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Page path of the secondary link, without a language prefix. */
  homeHref: string;
  homeLabelKey: 'errors.boundary.goHome' | 'errors.boundary.goTimer';
}

/**
 * Shared body for route-segment error.tsx files. Needs I18nProvider above it.
 * Tomo is worried, the one primary action is "Try again", going home is secondary.
 * The card stays straight: an error message is not the place for a playful tilt.
 */
export function RouteError({
  error,
  reset,
  homeHref,
  homeLabelKey,
}: RouteErrorProps) {
  const { t, lang } = useI18n();

  useEffect(() => {
    console.error(error);
    reportClientError(error, 'route-error');
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4 py-10">
      <StickerCard
        role="alert"
        size="lg"
        className="flex w-full max-w-md flex-col items-center p-8 text-center sm:p-10"
      >
        <Tomo face="worried" size={128} />
        <h1 className="mt-4 text-balance font-heading text-[1.625rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
          {t('errors.boundary.title')}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-secondary">
          {t('errors.boundary.description')}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => reset()}>
            {t('errors.boundary.retry')}
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={localePath(lang, homeHref)}>{t(homeLabelKey)}</Link>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-6 break-all text-xs text-ink-muted">
            {t('errors.boundary.reference', { digest: error.digest })}
          </p>
        )}
      </StickerCard>
    </div>
  );
}
