'use client';

/**
 * 404 inside a language (`notFound()` from a page, or any unknown path under /vi, /ja or the
 * unprefixed English tree). It renders in the `[lang]` root layout, so the language and its
 * messages come from the I18nProvider.
 */
import { NotFoundCard } from '@/components/shared/not-found-card';
import { useI18n } from '@/contexts/i18n-context';
import { localePath } from '@/lib/i18n/locale-path';

export default function NotFound() {
  const { t, lang } = useI18n();
  return <NotFoundCard t={t} homeHref={localePath(lang, '/')} guideHref={localePath(lang, '/guide')} />;
}
