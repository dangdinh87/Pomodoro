/**
 * Server-only by convention (the layout calls it): a client component importing this file would
 * pull every dictionary into its bundle. `server-only` is not used so unit tests can import it.
 */
import type { Messages } from '@/contexts/i18n-context';
import type { Lang } from './negotiate-locale';

const loaders: Record<Lang, () => Promise<Messages>> = {
  en: () => import('@/i18n/locales/en.json').then((module) => module.default),
  vi: () => import('@/i18n/locales/vi.json').then((module) => module.default),
  ja: () => import('@/i18n/locales/ja.json').then((module) => module.default),
};

/**
 * The messages of ONE language, for the client I18nProvider. Loaded on the server in the
 * `[lang]` layout, so the other two languages never reach the client bundle.
 */
export function loadMessages(lang: Lang): Promise<Messages> {
  return loaders[lang]();
}
