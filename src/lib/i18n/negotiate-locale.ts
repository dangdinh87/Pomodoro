/**
 * Pure locale helpers shared by middleware (edge), server components and the
 * client provider. Keep this file free of Next/React imports.
 */
export type Lang = 'en' | 'vi' | 'ja';

export const SUPPORTED_LANGS: readonly Lang[] = ['en', 'vi', 'ja'];
export const DEFAULT_LANG: Lang = 'en';
export const LOCALE_COOKIE = 'app.lang';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'vi' || value === 'ja';
}

/** Coerce an arbitrary cookie/storage value to a supported Lang (default en). */
export function normalizeLang(value: string | null | undefined): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}

/**
 * Pick the best supported language from an Accept-Language header.
 * Honors q-values; matches on primary subtag (vi-VN -> vi). Defaults to en.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Lang {
  if (!acceptLanguage) return DEFAULT_LANG;

  const candidates = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [range, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return {
        tag: range.trim().toLowerCase(),
        q: Number.isNaN(q) ? 0 : q,
        index,
      };
    })
    .filter((c) => c.tag && c.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { tag } of candidates) {
    const primary = tag.split('-')[0];
    if (isLang(primary)) return primary;
  }
  return DEFAULT_LANG;
}
