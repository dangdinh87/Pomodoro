/**
 * Absolute URLs for SEO: canonical, hreflang, sitemap, JSON-LD and the share image all spell a
 * page's URL through here, so the five can never disagree. Pure (no Next imports), usable in the
 * sitemap and in tests.
 */
import { SITE_URL } from '@/config/site';
import { localePath } from '@/lib/i18n/locale-path';
import { DEFAULT_LANG, SUPPORTED_LANGS, type Lang } from '@/lib/i18n/negotiate-locale';

/** Open Graph wants language_TERRITORY, unlike hreflang which takes a bare language. */
export const OG_LOCALE: Record<Lang, string> = { en: 'en_US', vi: 'vi_VN', ja: 'ja_JP' };

export type HreflangMap = Record<Lang | 'x-default', string>;

/** The URL of a page in a language, e.g. `pageUrl('vi', '/guide')`. The home has no trailing slash. */
export function pageUrl(locale: Lang, path: string): string {
  const local = localePath(locale, path);
  return local === '/' ? SITE_URL : `${SITE_URL}${local}`;
}

/** hreflang cluster of one page: every language (itself included) and x-default = the English page. */
export function languageAlternates(path: string): HreflangMap {
  const entries = SUPPORTED_LANGS.map((lang) => [lang, pageUrl(lang, path)] as const);
  return { ...(Object.fromEntries(entries) as Record<Lang, string>), 'x-default': pageUrl(DEFAULT_LANG, path) };
}

/** Where the generated share image of a language is served (src/app/[lang]/opengraph-image.tsx). */
export function ogImageUrl(locale: Lang): string {
  return pageUrl(locale, '/opengraph-image');
}
