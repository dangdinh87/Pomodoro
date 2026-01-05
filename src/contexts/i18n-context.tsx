'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';

export type Lang = 'en' | 'vi';

type Dict = Record<string, any>;

const dictionaries: Record<Lang, Dict> = { en, vi };

const I18N_STORAGE_KEY = 'app.lang';
const DEFAULT_LANG: Lang = 'en';

function safeGet(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, part: string) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

// Helper to get saved lang from localStorage synchronously during initialization
function getSavedLang(): Lang | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(I18N_STORAGE_KEY) as Lang | null;
    if (saved === 'en' || saved === 'vi') return saved;
  } catch { }
  return null;
}

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG;

  // First priority: saved preference
  const saved = getSavedLang();
  if (saved) return saved;

  // Second priority: browser language
  try {
    const n = navigator?.language?.toLowerCase?.() || '';
    if (n.startsWith('vi')) return 'vi';
  } catch { }

  return DEFAULT_LANG;
}

type TranslateVars = Record<string, string | number | boolean>;

export interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: TranslateVars) => string;
  dict: Dict;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Always start with DEFAULT_LANG for the first render to match Server result
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Apply saved language ONLY after hydration
  useEffect(() => {
    const saved = getSavedLang();
    if (saved && saved !== DEFAULT_LANG) {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(I18N_STORAGE_KEY, lang);
    } catch { }
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', lang);
      }
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

  const setLang = (l: Lang) => setLangState(l);

  const value = useMemo(
    () => ({ lang, setLang, t, dict }),
    [lang, t]
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
];
