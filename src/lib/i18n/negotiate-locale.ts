/**
 * Pure locale helpers shared by the proxy, server components and the client provider.
 * Keep this file free of Next/React imports.
 */
export type Lang = 'en' | 'vi' | 'ja';

export const SUPPORTED_LANGS: readonly Lang[] = ['en', 'vi', 'ja'];
export const DEFAULT_LANG: Lang = 'en';
/** Remembers a language the visitor picked on purpose. Only the suggestion banner reads it. */
export const LOCALE_COOKIE = 'app.lang';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'vi' || value === 'ja';
}

/** The language saved in the `app.lang` cookie, from a `document.cookie`-style string; null when absent or unsupported. */
export function readLangCookie(cookie: string): Lang | null {
  const saved = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.slice(LOCALE_COOKIE.length + 1);
  return isLang(saved) ? saved : null;
}

/**
 * First supported language in an ordered preference list such as `navigator.languages`
 * (`['vi-VN', 'en']` -> 'vi'); matches on the primary subtag. Null when none is supported.
 */
export function firstSupportedLang(languages: readonly string[]): Lang | null {
  for (const tag of languages) {
    const primary = tag.trim().toLowerCase().split('-')[0];
    if (isLang(primary)) return primary;
  }
  return null;
}
