/**
 * Decides what the proxy does with a page request. Pure, so the whole URL matrix is unit-tested
 * without a server (see locale-routing.test.ts).
 *
 *   /guide            -> rewrite to /en/guide   (English has no prefix in the browser)
 *   /vi, /ja/guide    -> untouched               (the [lang] route serves them)
 *   /en, /en/guide    -> 308 to /, /guide        (one URL per page: no duplicate content)
 *   /vi/tasks         -> 308 to /vi?panel=tasks  (former pages are panels now)
 *   /fr, /fr/guide    -> untouched               (unsupported locale: the route answers 404)
 *   /api, /_next, files with an extension, metadata routes, /dev -> untouched
 */
import { localePath, splitLocalePath } from './locale-path';
import { DEFAULT_LANG, type Lang } from './negotiate-locale';

export type LocaleRoute =
  | { action: 'next' }
  | { action: 'rewrite'; pathname: string }
  | { action: 'redirect'; pathname: string; search: string };

/** Former pages: the panel that replaced them (null = just the app). Mirrors redirects() in next.config.ts. */
const LEGACY_PAGES: Record<string, string | null> = {
  timer: 'timer',
  tasks: 'tasks',
  history: 'stats',
  progress: 'stats',
  focus: 'stats',
  settings: 'settings',
  entertainment: 'arcade',
  feedback: 'feedback',
  login: 'login',
  signup: 'login',
  'reset-password': 'login',
  leaderboard: null,
  chat: null,
};

/** First segments that are never pages: API, build output, dev tools and generated metadata routes. */
const NON_PAGE_SEGMENTS = new Set([
  'api',
  '_next',
  'dev',
  'sitemap.xml',
  'robots.txt',
  'opengraph-image',
  'twitter-image',
  'icon',
  'apple-icon',
]);

/** `fr`, `pt-br`: looks like a locale but is not one we serve. */
const LOCALE_LIKE = /^[a-z]{2}(?:-[a-z]{2,4})?$/i;

const NEXT: LocaleRoute = { action: 'next' };

function withPanel(search: string, panel: string | null): string {
  const params = new URLSearchParams(search);
  if (panel) params.set('panel', panel);
  const query = params.toString();
  return query ? `?${query}` : '';
}

function legacyRedirect(lang: Lang, page: string, search: string): LocaleRoute | null {
  const slug = page.slice(1);
  if (!Object.hasOwn(LEGACY_PAGES, slug)) return null;
  return { action: 'redirect', pathname: localePath(lang, '/'), search: withPanel(search, LEGACY_PAGES[slug]) };
}

export function resolveLocaleRoute(pathname: string, search: string): LocaleRoute {
  const first = pathname.split('/')[1] ?? '';
  const lastSegment = pathname.split('/').pop() ?? '';
  if (NON_PAGE_SEGMENTS.has(first) || lastSegment.includes('.') || first.includes('.')) return NEXT;

  const { lang, path } = splitLocalePath(pathname);

  if (lang === DEFAULT_LANG) {
    return legacyRedirect(DEFAULT_LANG, path, search) ?? { action: 'redirect', pathname: path, search };
  }
  if (lang) return legacyRedirect(lang, path, search) ?? NEXT;

  if (LOCALE_LIKE.test(first)) return NEXT;
  return { action: 'rewrite', pathname: pathname === '/' ? `/${DEFAULT_LANG}` : `/${DEFAULT_LANG}${pathname}` };
}
