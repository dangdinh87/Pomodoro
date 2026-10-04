import type { Metadata } from 'next';
import { localePath } from '@/lib/i18n/locale-path';
import type { Lang } from '@/lib/i18n/negotiate-locale';
import { SHARE_IMAGE_ALT, SHARE_IMAGE_PATH, SHARE_IMAGE_SIZE } from './share-image';

const SITE_NAME = 'Study Bro';
const SHARE_IMAGE = { url: SHARE_IMAGE_PATH, ...SHARE_IMAGE_SIZE, alt: SHARE_IMAGE_ALT };

interface PageMetadataInput {
  /** Language of the page: the canonical and og:url point at its own URL (`/vi/guide`), not at the English one. */
  lang: Lang;
  /** Page path WITHOUT a language prefix, e.g. '/guide'. Resolved against the root metadataBase. */
  path: string;
  title: string;
  description: string;
}

/**
 * Metadata for an indexable page: a self-referencing canonical plus Open Graph
 * and Twitter fields that describe THIS page. Next replaces (not merges) the
 * parent's `openGraph`/`twitter` objects, so the share image is repeated here.
 */
export function buildPageMetadata({ lang, path, title, description }: PageMetadataInput): Metadata {
  const url = localePath(lang, path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
