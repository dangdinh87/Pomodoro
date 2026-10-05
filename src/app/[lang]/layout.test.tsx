import { renderToStaticMarkup } from 'react-dom/server';
import { SITE_URL } from '@/config/site';
import { jsonLdOf, typesOf } from '@/test-utils/json-ld';

// next/font and the analytics scripts only exist inside a Next build
vi.mock('../fonts', () => ({ fontVariables: 'fonts' }));
vi.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));
vi.mock('@/components/trackings/ga', () => ({ GoogleAnalytics: () => null }));
vi.mock('@/components/layout/language-suggestion', () => ({ LanguageSuggestion: () => null }));
vi.mock('@/features/timer/components/deadline-watcher', () => ({
  DeadlineWatcher: () => <i data-testid="deadline-watcher" />,
}));

import RootLayout, * as layoutModule from './layout';

const { generateStaticParams } = layoutModule;

const params = (lang: string) => ({ params: Promise.resolve({ lang }) });
const render = async (lang: string) => renderToStaticMarkup(await RootLayout({ children: <p>page</p>, ...params(lang) }));

describe('[lang] layout', () => {
  it('generates the three languages and nothing else', () => {
    expect(generateStaticParams()).toEqual([{ lang: 'en' }, { lang: 'vi' }, { lang: 'ja' }]);
  });

  it.each(['en', 'vi', 'ja'])('declares <html lang> for %s', async (lang) => {
    expect(await render(lang)).toContain(`<html lang="${lang}"`);
  });

  it('adds the site-wide WebSite and Organization once per page, and never a WebApplication', async () => {
    for (const lang of ['en', 'vi', 'ja']) {
      const html = await render(lang);
      expect(typesOf(html)).toEqual(['WebSite', 'Organization']);
    }
    const [site, org] = jsonLdOf(await render('ja')) as [{ inLanguage: string[]; url: string }, { logo: { url: string } }];
    expect(site.inLanguage).toEqual(['en', 'vi', 'ja']);
    expect(site.url).toBe(SITE_URL);
    expect(org.logo.url).toBe(`${SITE_URL}/icons/icon-512x512.png`);
  });

  it('mounts the deadline watcher on every page (it rings where the timer engine is not mounted)', async () => {
    const html = await render('vi');
    expect(html).toContain('data-testid="deadline-watcher"');
  });

  it('sets no title or metadata of its own, so the root "%s | Study Bro" template reaches every page', () => {
    // A title object returned here would reset the template inherited from app/layout.tsx
    expect(layoutModule).not.toHaveProperty('generateMetadata');
    expect(layoutModule).not.toHaveProperty('metadata');
  });
});
