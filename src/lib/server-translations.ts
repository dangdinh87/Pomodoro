/**
 * Server-side translation helper for SSR components.
 * Picks the dictionary from the `app.lang` cookie (set by middleware from
 * Accept-Language, or by the client language switcher). Falls back to English
 * per key. Reading cookies() opts the calling route into dynamic rendering.
 */
import { cookies } from 'next/headers';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';
import { LOCALE_COOKIE, normalizeLang, type Lang } from '@/lib/i18n/negotiate-locale';

type TranslationDict = typeof en;

const dictionaries: Record<Lang, Record<string, unknown>> = {
  en: en as unknown as Record<string, unknown>,
  vi: vi as unknown as Record<string, unknown>,
  ja: ja as unknown as Record<string, unknown>,
};

function lookup(obj: Record<string, unknown>, path: string): string | undefined {
  const result = path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
  return typeof result === 'string' ? result : undefined;
}

/** Locale of the current request; 'en' outside a request scope. */
export function getServerLang(): Lang {
  try {
    return normalizeLang(cookies().get(LOCALE_COOKIE)?.value);
  } catch (error) {
    // During static generation Next throws a "dynamic server usage" error to
    // opt the route into dynamic rendering; it must propagate, not be swallowed.
    if ((error as { digest?: unknown })?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    // Outside any request scope (unit tests, scripts): default locale
    return 'en';
  }
}

export function getServerTranslation(key: string, lang: Lang = getServerLang()): string {
  return lookup(dictionaries[lang], key) ?? lookup(dictionaries.en, key) ?? key;
}

export function getServerDict(lang: Lang = getServerLang()): TranslationDict {
  return dictionaries[lang] as unknown as TranslationDict;
}

// Shorthand for use in components
export const t = (key: string): string => getServerTranslation(key);
