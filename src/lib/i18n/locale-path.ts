/**
 * Locale-aware URLs. English is the default and has no prefix (`/`, `/guide`); Vietnamese and
 * Japanese live under `/vi` and `/ja`. "Page path" below always means the path WITHOUT a locale
 * prefix (`/`, `/guide`, `/privacy`), the same in every language. Pure: usable in the proxy,
 * server components and client code alike.
 */
import { DEFAULT_LANG, isLang, type Lang } from './negotiate-locale';

/** The URL of a page in a language. `path` is a page path, optionally with `?query` and `#hash`. */
export function localePath(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG) return path;
  const tail = path.search(/[?#]/);
  const base = tail === -1 ? path : path.slice(0, tail);
  const rest = tail === -1 ? '' : path.slice(tail);
  return `/${lang}${base === '/' ? '' : base}${rest}`;
}

/**
 * Splits `/vi/guide` into the explicit locale prefix and the page path. `lang` is null when the
 * first segment is not a supported locale (English URLs carry none); an `/en` prefix is reported
 * as `en` because the proxy redirects it away.
 */
export function splitLocalePath(pathname: string): { lang: Lang | null; path: string } {
  const [, first = '', ...rest] = pathname.split('/');
  if (!isLang(first)) return { lang: null, path: pathname || '/' };
  const path = `/${rest.filter(Boolean).join('/')}`;
  return { lang: first, path };
}

export function pathWithoutLocale(pathname: string): string {
  return splitLocalePath(pathname).path;
}

const withPrefix = (value: string, prefix: '?' | '#') =>
  value && value !== prefix ? (value.startsWith(prefix) ? value : `${prefix}${value}`) : '';

/**
 * The equivalent URL in another language, keeping the path, the query (`?panel=tasks`) and the hash.
 * `currentPath` is what the browser shows (`/vi/guide`, `/guide`).
 */
export function switchLocalePath(currentPath: string, search: string, target: Lang, hash = ''): string {
  const page = `${pathWithoutLocale(currentPath)}${withPrefix(search, '?')}${withPrefix(hash, '#')}`;
  return localePath(target, page);
}
