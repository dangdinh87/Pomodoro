/**
 * The "this page is also available in ..." banner. We never redirect by cookie or Accept-Language
 * (crawlers must see one URL per language); a visitor whose preference differs from the page they
 * landed on is only offered a link, once. Pure helpers here, the UI is components/layout/language-suggestion.tsx.
 */
import { firstSupportedLang, readLangCookie, type Lang } from './negotiate-locale';

/** localStorage flag set when the banner is dismissed or its action taken. */
export const SUGGESTION_DISMISSED_KEY = 'app.langSuggestion.dismissed';

export interface LangSuggestionCopy {
  message: string;
  action: string;
  dismiss: string;
}

/**
 * Written in the language being offered: the banner is shown to someone who reads that language
 * better than the page's. Kept here, not in the locale files, because the page's provider only
 * holds the messages of its own language.
 */
export const LANG_SUGGESTION_COPY: Record<Lang, LangSuggestionCopy> = {
  en: { message: 'This page is also available in English.', action: 'Switch to English', dismiss: 'Dismiss' },
  vi: { message: 'Trang này cũng có bản Tiếng Việt.', action: 'Xem bằng Tiếng Việt', dismiss: 'Đóng' },
  ja: { message: 'このページは日本語でもご覧いただけます。', action: '日本語で見る', dismiss: '閉じる' },
};

/** The visitor's preferred language: a language picked on purpose (cookie) wins over the browser's list. */
export function preferredLang(cookie: string, languages: readonly string[]): Lang | null {
  return readLangCookie(cookie) ?? firstSupportedLang(languages);
}

/** The language to offer, or null when the page already matches, the preference is unknown, or it was dismissed. */
export function suggestedLang({
  current,
  cookie,
  languages,
  dismissed,
}: {
  current: Lang;
  cookie: string;
  languages: readonly string[];
  dismissed: boolean;
}): Lang | null {
  if (dismissed) return null;
  const preferred = preferredLang(cookie, languages);
  return preferred && preferred !== current ? preferred : null;
}
