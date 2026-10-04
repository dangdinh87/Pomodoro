import { renderToString } from 'react-dom/server';
import enDict from '@/i18n/locales/en.json';
import viDict from '@/i18n/locales/vi.json';
import jaDict from '@/i18n/locales/ja.json';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { FAQ } from './FAQ';
import { FeaturesSSR } from './FeaturesSSR';
import { HowItWorks } from './HowItWorks';
import { getFaqItems } from './faq-items';

// The sections are server components: the language arrives as a prop (from the [lang] route).
// PanelLink, a client island inside them, reads it from the provider the [lang] layout supplies.
const ssr = (node: React.ReactNode, lang: Lang = 'en') =>
  renderToString(<I18nProvider initialLang={lang}>{node}</I18nProvider>);
const dictionaries = { en: enDict, vi: viDict, ja: jaDict } as const;
const count = (html: string, pattern: RegExp) => (html.match(pattern) ?? []).length;
const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;');

describe.each(['en', 'vi', 'ja'] as const)('landing sections rendered on the server (%s)', (lang) => {
  it('FAQ puts every question and answer in the HTML, with no client JS needed to read them', () => {
    const html = ssr(<FAQ lang={lang} />, lang);
    const dict = dictionaries[lang].site.faq;

    for (let i = 1; i <= 8; i++) {
      const item = dict[`q${i}` as 'q1'];
      expect(html).toContain(escapeHtml(item.q));
      expect(html).toContain(escapeHtml(item.a));
    }
    expect(count(html, /<details/g)).toBe(8);
    expect(html).toContain(escapeHtml(dict.title));
  });

  it('FAQ shows the same questions the FAQPage JSON-LD is built from', () => {
    const html = ssr(<FAQ lang={lang} />, lang);
    const items = getFaqItems((key) => key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)[part], dictionaries[lang]) as string);
    expect(items).toHaveLength(8);
    for (const { question } of items) expect(html).toContain(escapeHtml(question));
  });

  it('uses h2 for the section titles and no h1 (the page owns its single h1)', () => {
    for (const Section of [FAQ, FeaturesSSR, HowItWorks]) {
      const html = ssr(<Section lang={lang} />, lang);
      expect(count(html, /<h1/g)).toBe(0);
      expect(count(html, /<h2/g)).toBe(1);
    }
  });

  it('links panels inside the same language', () => {
    const html = ssr(<FeaturesSSR lang={lang} />, lang);
    const prefix = lang === 'en' ? '' : `/${lang}`;
    expect(html).toContain(`href="${prefix || '/'}?panel=tasks"`);
  });
});

describe('landing sections: Sticker pop look', () => {
  it('features are sticker cards that alternate their tilt, each with a candy icon tile', () => {
    const html = ssr(<FeaturesSSR lang="en" />);

    expect(count(html, /data-tilt="left"/g)).toBe(4);
    expect(count(html, /data-tilt="right"/g)).toBe(3);
    expect(count(html, /data-tone="/g)).toBe(7);
    expect(count(html, /<h3/g)).toBe(7);
    expect(html).toContain('data-face="happy"');
  });

  it('FAQ has Tomo, and how-it-works never puts white text on a colour', () => {
    expect(ssr(<FAQ lang="en" />)).toContain('data-face="happy"');
    expect(ssr(<HowItWorks lang="en" />)).not.toMatch(/text-white|bg-\[#/);
  });

  it('copy no longer mentions features that were removed', () => {
    const html = ssr(<FeaturesSSR lang="en" />) + ssr(<FAQ lang="en" />) + ssr(<HowItWorks lang="en" />);
    expect(html).not.toMatch(/leaderboard|spotify|AI coach|Chat AI/i);
  });
});
