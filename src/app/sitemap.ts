import type { MetadataRoute } from 'next';
import { SUPPORTED_LANGS } from '@/lib/i18n/negotiate-locale';
import { INDEXABLE_PAGES } from '@/lib/seo/pages';
import { languageAlternates, pageUrl } from '@/lib/seo/urls';

// Static generation at build time. Dates are the fixed per-page ones in `lib/seo/pages`.
export const dynamic = 'force-static';

/**
 * One entry per page per language. Each entry carries the whole hreflang cluster (itself
 * included, plus x-default), so the sitemap says the same thing as the <link rel="alternate">
 * tags in the page head. App panels live on `/` and are not separate pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PAGES.flatMap(({ path, lastModified, changeFrequency, priority }) =>
    SUPPORTED_LANGS.map((lang) => ({
      url: pageUrl(lang, path),
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(path) },
    })),
  );
}
