/**
 * Server-side translation helper for SSR components
 * Uses English as default for SEO - client-side hydration handles user preference
 */
import en from '@/i18n/locales/en.json';

type TranslationDict = typeof en;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const result = path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
  return typeof result === 'string' ? result : path;
}

export function getServerTranslation(key: string): string {
  return getNestedValue(en as unknown as Record<string, unknown>, key);
}

export function getServerDict(): TranslationDict {
  return en;
}

// Shorthand for use in components
export const t = getServerTranslation;
