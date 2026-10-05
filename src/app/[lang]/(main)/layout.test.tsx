import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { getT } from '@/lib/server-translations';
import MainLayout from './layout';

const render = async (lang: string) =>
  renderToStaticMarkup(await MainLayout({ children: <p>page</p>, params: Promise.resolve({ lang }) }));

describe('(main) layout', () => {
  it.each(['en', 'vi', 'ja'] as const)('puts the skip link (in %s) and the main landmark in the server HTML', async (lang) => {
    const html = await render(lang);
    expect(html).toContain(`>${getT(lang)('skipLink.label')}</a>`);
    expect(html).toMatch(/<main id="main-content" tabindex="-1"[^>]*><p>page<\/p><\/main>/);
  });

  it("leaves the app's providers to the app chunk, so the page's first-load JS never carries them", () => {
    const source = readFileSync(join(process.cwd(), 'src/app/[lang]/(main)/layout.tsx'), 'utf8');
    expect(source).not.toMatch(/^'use client'/m);
    expect(source).not.toContain('app-providers');
    expect(readFileSync(join(process.cwd(), 'src/features/app-shell/app-runtime.tsx'), 'utf8')).toContain('<AppProviders>');
  });
});
