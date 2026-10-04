/**
 * Copy for app/global-error.tsx. That page replaces the root layout when it crashes, so no
 * provider (and no JSON dictionary) is available, and importing the locale files would drag
 * them into every page's bundle. title, retry, goHome and reference mirror errors.boundary.*
 * (global-error-copy.test.ts keeps them in step).
 */
import { splitLocalePath } from './locale-path';
import { DEFAULT_LANG, type Lang } from './negotiate-locale';

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

/** The language of the URL being viewed (`/vi/...`, `/ja/...`); every unprefixed URL is English. */
export function detectErrorLang(pathname: string): Lang {
  return splitLocalePath(pathname).lang ?? DEFAULT_LANG;
}
