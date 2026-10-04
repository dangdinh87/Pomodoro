/**
 * Copy for app/global-error.tsx. That page replaces the root layout when it crashes, so no
 * provider (and no JSON dictionary) is available, and importing the locale files would drag
 * them into every page's bundle. title, retry, goHome and reference mirror errors.boundary.*
 * (global-error-copy.test.ts keeps them in step).
 */
import { DEFAULT_LANG, LOCALE_COOKIE, isLang, type Lang } from './negotiate-locale';

export interface GlobalErrorCopy {
  title: string;
  description: string;
  retry: string;
  goHome: string;
  reference: (digest: string) => string;
}

const COPY: Record<Lang, GlobalErrorCopy> = {
  en: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. You can try again or head back home.',
    retry: 'Try again',
    goHome: 'Go to home',
    reference: (digest) => `Reference: ${digest}`,
  },
  vi: {
    title: 'Đã xảy ra sự cố',
    description: 'Có lỗi không mong muốn. Bạn có thể thử lại hoặc quay về trang chủ.',
    retry: 'Thử lại',
    goHome: 'Về trang chủ',
    reference: (digest) => `Mã tham chiếu: ${digest}`,
  },
  ja: {
    title: '問題が発生しました',
    description: '予期しないエラーが発生しました。もう一度お試しいただくか、ホームに戻ってください。',
    retry: 'もう一度試す',
    goHome: 'ホームへ',
    reference: (digest) => `参照コード: ${digest}`,
  },
};

export function globalErrorCopy(lang: Lang): GlobalErrorCopy {
  return COPY[lang];
}

/** Saved language cookie first, then the browser language, else English. */
export function detectErrorLang(cookie: string, browserLanguage: string | undefined): Lang {
  const saved = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.slice(LOCALE_COOKIE.length + 1);
  if (isLang(saved)) return saved;

  const primary = browserLanguage?.toLowerCase().split('-')[0];
  return isLang(primary) ? primary : DEFAULT_LANG;
}
