/**
 * Test double for the app's I18nProvider: the real one takes `locale` + `messages` from the
 * `[lang]` layout, tests just name a language and get its real dictionary.
 */
import type { ReactNode } from 'react';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';
import { I18nProvider as AppI18nProvider, type Lang, type Messages } from '@/contexts/i18n-context';

export type { Lang };

const MESSAGES: Record<Lang, Messages> = { en, vi, ja };

export function I18nProvider({ initialLang = 'en', children }: { initialLang?: Lang; children: ReactNode }) {
  return (
    <AppI18nProvider locale={initialLang} messages={MESSAGES[initialLang]}>
      {children}
    </AppI18nProvider>
  );
}
