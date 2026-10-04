// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SUPPORTED_LANGS } from '@/lib/i18n/negotiate-locale';
import { INDEXABLE_PAGES } from './pages';
import { pageUrl } from './urls';

const llms = readFileSync(join(process.cwd(), 'public/llms.txt'), 'utf8');

describe('llms.txt', () => {
  it('lists every indexable page in every language, so AI crawlers can find the Vietnamese and Japanese ones', () => {
    for (const { path } of INDEXABLE_PAGES) {
      for (const lang of SUPPORTED_LANGS) {
        const url = pageUrl(lang, path).replaceAll('.', '\\.');
        // whole URL only: /vi must not be satisfied by /vi/guide; the home may be written with a trailing slash
        expect(llms, pageUrl(lang, path)).toMatch(new RegExp(`(^|\\s)${url}/?\\s`, 'm'));
      }
    }
  });

  it('points at the sitemap', () => {
    expect(llms).toContain(pageUrl('en', '/sitemap.xml'));
  });
});
