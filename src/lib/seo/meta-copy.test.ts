/**
 * Quality gates for the SEO copy in the locale files (`site.meta.*`): length budgets for search
 * results, the brand added exactly once, and no English left in the Vietnamese or Japanese copy.
 * Google truncates by pixel width, so Japanese (full-width) characters count double.
 */
import { SUPPORTED_LANGS, type Lang } from '@/lib/i18n/negotiate-locale';
import { getT } from '@/lib/server-translations';

const BRAND = 'Study Bro';
const PAGES = ['home', 'guide', 'privacy', 'terms'] as const;

const width = (text: string) => [...text].reduce((sum, char) => sum + (char.charCodeAt(0) > 0x2e7f ? 2 : 1), 0);
/** Title budget in "width units": ~60 Latin characters or ~32 full-width ones. */
const TITLE_BUDGET: Record<Lang, number> = { en: 60, vi: 62, ja: 66 };
const DESCRIPTION_BUDGET: Record<Lang, number> = { en: 155, vi: 155, ja: 240 };

const copy = (lang: Lang, page: (typeof PAGES)[number]) => {
  const t = getT(lang);
  const title = t(`site.meta.${page}.title`);
  return {
    title,
    // The root template appends the brand to every page except the home, whose title carries it
    shown: page === 'home' ? title : `${title} | ${BRAND}`,
    description: t(`site.meta.${page}.description`),
  };
};

describe.each(SUPPORTED_LANGS)('SEO copy (%s)', (lang) => {
  it.each(PAGES)('%s: title and description fit a search result', (page) => {
    const { shown, description } = copy(lang, page);
    expect(width(shown)).toBeLessThanOrEqual(TITLE_BUDGET[lang]);
    expect(width(description)).toBeLessThanOrEqual(DESCRIPTION_BUDGET[lang]);
    expect(description.length).toBeGreaterThanOrEqual(40);
  });

  it.each(PAGES)('%s: names the brand exactly once', (page) => {
    const { shown } = copy(lang, page);
    expect(shown.split(BRAND)).toHaveLength(2);
    expect(shown).not.toContain('•');
  });

  it('leads the home title with the keyword people search for', () => {
    const title = copy(lang, 'home').title;
    const lead = { en: /^Pomodoro Timer Online/, vi: /^Đồng hồ Pomodoro online miễn phí/, ja: /^ポモドーロタイマー/ }[lang];
    expect(title).toMatch(lead);
  });

  it('keeps the share image tagline short enough for the pill and the alt text meaningful', () => {
    const t = getT(lang);
    expect(width(t('site.meta.og.tagline'))).toBeLessThanOrEqual(52);
    expect(t('site.meta.og.alt')).toContain(BRAND);
  });
});

describe('SEO copy is written per language, not copied', () => {
  it.each(PAGES)('%s differs between en, vi and ja', (page) => {
    const titles = SUPPORTED_LANGS.map((lang) => copy(lang, page).title);
    const descriptions = SUPPORTED_LANGS.map((lang) => copy(lang, page).description);
    expect(new Set(titles).size).toBe(3);
    expect(new Set(descriptions).size).toBe(3);
  });

  it('uses Japanese script in the Japanese copy and Vietnamese diacritics in the Vietnamese copy', () => {
    for (const page of PAGES) {
      expect(copy('ja', page).description).toMatch(/[぀-ヿ一-鿿]/);
      expect(copy('vi', page).description).toMatch(/[ăâêôơưđàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/i);
    }
  });
});
