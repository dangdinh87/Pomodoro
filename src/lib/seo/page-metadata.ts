import type { Metadata } from 'next';
import { SUPPORTED_LANGS, type Lang } from '@/lib/i18n/negotiate-locale';
import { getT } from '@/lib/server-translations';
import { SHARE_IMAGE_SIZE } from './share-image';
import { languageAlternates, OG_LOCALE, ogImageUrl, pageUrl } from './urls';

export const SITE_NAME = 'Study Bro';

interface PageMetadataInput {
  /** Language of the page. Canonical, og:url and og:image all point at THIS language, never at English. */
  locale: Lang;
  /** Page path WITHOUT a language prefix, e.g. '/guide'. */
  path: string;
  title: string;
  description: string;
  /**
   * The title already carries the brand ("... | Study Bro"), so the root `%s | Study Bro`
   * template must not add it again. Used by the home page.
   */
  titleAbsolute?: boolean;
}

/**
 * Metadata for an indexable page: a self-referencing absolute canonical, the hreflang cluster
 * (every language plus x-default) and Open Graph / Twitter fields that describe THIS page in
 * THIS language. Next replaces (not merges) a parent's `openGraph`/`twitter`, so the share image
 * is repeated here.
 */
export function buildPageMetadata({ locale, path, title, description, titleAbsolute = false }: PageMetadataInput): Metadata {
  const url = pageUrl(locale, path);
  // Social cards do not go through the root title template, so they get the full title here
  const cardTitle = titleAbsolute ? title : `${title} | ${SITE_NAME}`;
  const image = { url: ogImageUrl(locale), ...SHARE_IMAGE_SIZE, alt: getT(locale)('site.meta.og.alt') };

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: 'website',
      url,
      title: cardTitle,
      description,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: SUPPORTED_LANGS.filter((lang) => lang !== locale).map((lang) => OG_LOCALE[lang]),
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: cardTitle,
      description,
      images: [image.url],
    },
  };
}
