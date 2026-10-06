'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { switchLocalePath } from '@/lib/i18n/locale-path';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Lang } from '@/lib/i18n/negotiate-locale';

export type { Lang };

/** One language's dictionary: nested objects with string leaves. */
export type Messages = { [key: string]: string | Messages };

type TranslateVars = Record<string, string | number | boolean>;

export interface I18nContextValue {
  lang: Lang;
  /** Opens the same page in another language and remembers the choice. */
  setLang: (l: Lang) => void;
  t: (key: string, vars?: TranslateVars) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function lookup(messages: Messages, path: string): string | undefined {
  let node: string | Messages | undefined = messages;
  for (const part of path.split('.')) {
    if (typeof node !== 'object' || !Object.prototype.hasOwnProperty.call(node, part)) return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/** Only an explicit pick writes the cookie; the suggestion banner is its sole reader. */
function writeLangCookie(lang: Lang) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {}
}

/**
 * The language is the URL's (`/vi/...`), not state: the `[lang]` layout passes the locale and
 * ONLY that locale's messages, so the other dictionaries never reach the client bundle.
 * Switching language is a navigation to the same page under the other prefix; the layout
 * re-renders with the new messages and the persisted app state (timer, tasks) carries over.
 * A key missing from the messages renders as the key itself (`pnpm i18n:check` keeps the
 * three locale files in step).
 */
export function I18nProvider({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: Lang;
  messages: Messages;
}) {
  const router = useRouter();

  const t = useMemo(() => {
    return (key: string, vars?: TranslateVars): string => {
      const template = lookup(messages, key) ?? key;
      if (!vars) return template;

      return template.replace(/\{(\w+)\}/g, (_m, k) => {
        const v = vars[k];
        return v === undefined || v === null ? `{${k}}` : String(v);
      });
    };
  }, [messages]);

  const setLang = useCallback(
    (next: Lang) => {
      writeLangCookie(next);
      if (next === locale) return;
      const { pathname, search, hash } = window.location;
      router.push(switchLocalePath(pathname, search, next, hash));
    },
    [locale, router],
  );

  const value = useMemo(() => ({ lang: locale, setLang, t }), [locale, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}

// Alias to match common naming
export function useTranslation() {
  const { t, lang, setLang } = useI18n();
  return { t, lang, setLang };
}

export const LANGS: Array<{ code: Lang; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ja', label: '日本語' },
];
