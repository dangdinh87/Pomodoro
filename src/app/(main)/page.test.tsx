import { renderToStaticMarkup } from 'react-dom/server';
import en from '@/i18n/locales/en.json';
import viDict from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';

const dictionaries: Record<string, Record<string, unknown>> = { en, vi: viDict, ja };
const state = vi.hoisted(() => ({ lang: 'en' }));

vi.mock('@/lib/server-translations', () => ({
  getT: async () => (key: string) =>
    key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown> | undefined)?.[part], dictionaries[state.lang]) as string,
}));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: async () => null }));
vi.mock('@/lib/auth/providers', () => ({ getGoogleCredentials: () => null }));
vi.mock('@/features/app-shell/app-home-client-only', async () => {
  const { AppHomeSkeleton } = await import('@/features/app-shell/app-home-skeleton');
  return { AppHomeClientOnly: () => <AppHomeSkeleton /> };
});
vi.mock('@/components/landing/FeaturesSSR', () => ({ FeaturesSSR: () => null }));
vi.mock('@/components/landing/HowItWorks', () => ({ HowItWorks: () => null }));
vi.mock('@/components/landing/FAQ', () => ({ FAQ: () => null }));
vi.mock('@/components/landing/Footer', () => ({ Footer: () => null }));

import HomePage from './page';

const render = async (lang: string) => {
  state.lang = lang;
  return renderToStaticMarkup(await HomePage());
};

describe('home page server HTML', () => {
  it.each([
    ['en', 'Free Pomodoro timer online'],
    ['vi', 'Đồng hồ Pomodoro online miễn phí'],
    ['ja', '無料ポモドーロタイマー'],
  ])('has exactly one H1 in %s, and the 25:00 card for LCP', async (lang, heading) => {
    const html = await render(lang);
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain('25:00');
  });

  it('renders the H1 before the app, visually hidden so it never shifts the layout', async () => {
    const html = await render('en');
    expect(html.indexOf('<h1')).toBeLessThan(html.indexOf('app-home-skeleton'));
    expect(html).toMatch(/<h1 class="sr-only">/);
  });
});
