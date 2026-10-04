import type { Metadata } from 'next';
import { SHARE_IMAGE_ALT, SHARE_IMAGE_PATH, SHARE_IMAGE_SIZE } from './share-image';

const SITE_NAME = 'Study Bro';
const SHARE_IMAGE = { url: SHARE_IMAGE_PATH, ...SHARE_IMAGE_SIZE, alt: SHARE_IMAGE_ALT };

interface PageMetadataInput {
  /** Path of the page, e.g. '/timer'. Resolved against the root metadataBase. */
  path: string;
  title: string;
  description: string;
}

/**
 * Metadata for an indexable page: a self-referencing canonical plus Open Graph
 * and Twitter fields that describe THIS page. Next replaces (not merges) the
 * parent's `openGraph`/`twitter` objects, so the share image is repeated here.
 */
export function buildPageMetadata({ path, title, description }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      url: path,
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
