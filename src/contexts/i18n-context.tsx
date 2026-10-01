'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';
import {
  DEFAULT_LANG,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLang,
  type Lang,
} from '@/lib/i18n/negotiate-locale';

export type { Lang };

type Dict = Record<string, any>;

const dictionaries: Record<Lang, Dict> = { en, vi, ja };

const I18N_STORAGE_KEY = 'app.lang';

function safeGet(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, part: string) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

// Saved preference from localStorage (back-compat with pre-cookie versions)
function getSavedLang(): Lang | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(I18N_STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch { }
  return null;
}

function writeLangCookie(lang: Lang) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch { }
}

/**
 * Carries the server-resolved locale (from the `app.lang` cookie) down from the
 * root layout, so I18nProvider's first render matches the SSR HTML without
 * threading a prop through app-providers.
 */
const InitialLangContext = createContext<Lang>(DEFAULT_LANG);

export function InitialLangProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return <InitialLangContext.Provider value={lang}>{children}</InitialLangContext.Provider>;
}

type TranslateVars = Record<string, string | number | boolean>;

export interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: TranslateVars) => string;
  dict: Dict;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const ctxLang = useContext(InitialLangContext);
  const startLang = initialLang ?? ctxLang;
  // Start from the server-resolved locale so SSR and hydration match
  const [lang, setLangState] = useState<Lang>(startLang);

  // One-time sync: an explicit localStorage choice wins over the cookie
  // (the cookie may only come from Accept-Language); mirror it into the cookie.
  useEffect(() => {
    const saved = getSavedLang();
    if (saved && saved !== startLang) {
      setLangState(saved);
      writeLangCookie(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('lang', lang);
    } catch { }
  }, [lang]);

  const dict = useMemo(() => dictionaries[lang], [lang]);

  const t = useMemo(() => {
    return (key: string, vars?: TranslateVars): string => {
      const fromCurrent = safeGet(dict, key);
      const fromEn = safeGet(dictionaries.en, key);
      const template =
        typeof fromCurrent === 'string'
          ? fromCurrent
          : typeof fromEn === 'string'
            ? fromEn
            : key;

      if (!vars) return String(template);

      return String(template).replace(/\{(\w+)\}/g, (_m, k) => {
        const v = vars[k];
        return v === undefined || v === null ? `{${k}}` : String(v);
      });
    };
  }, [dict]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(I18N_STORAGE_KEY, l);
    } catch { }
    writeLangCookie(l);
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, t, dict }),
    [lang, setLang, t, dict]
  );

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
