/**
 * Server-side translation helper for SSR components. The language is always passed in (it comes
 * from the `[lang]` route param), never read from a cookie or header, so the pages stay static.
 * Falls back to English per key, then to the key itself.
 */
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';
import type { Lang } from '@/lib/i18n/negotiate-locale';

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

/** A lookup bound to one language. */
export function getT(lang: Lang): (key: string) => string {
  const dict = dictionaries[lang];
  return (key) => lookup(dict, key) ?? lookup(dictionaries.en, key) ?? key;
}
