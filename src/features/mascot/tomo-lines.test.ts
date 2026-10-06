import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';
import { LINE_COUNTS } from './pick-tomo-mood';

const locales = { en, vi, ja } as const;

describe('Tomo lines in every language', () => {
  for (const [lang, dict] of Object.entries(locales)) {
    const lines = dict.tomo.lines as Record<string, Record<string, string>>;

    it(`${lang}: every situation has exactly the variants pickTomoMood can name`, () => {
      expect(Object.keys(lines).sort()).toEqual(Object.keys(LINE_COUNTS).sort());
      for (const [situation, count] of Object.entries(LINE_COUNTS)) {
        const keys = Object.keys(lines[situation]);
        expect(keys.sort()).toEqual(Array.from({ length: count }, (_, i) => String(i + 1)));
      }
    });

    it(`${lang}: lines are short, and none is a copy of another`, () => {
      const all = Object.values(lines).flatMap((variants) => Object.values(variants));
      for (const line of all) {
        expect(line.trim()).toBe(line);
        expect(line.length).toBeGreaterThan(3);
        expect(line.length).toBeLessThanOrEqual(lang === 'ja' ? 40 : 90);
      }
      expect(new Set(all).size).toBe(all.length);
    });
  }

  it('never invents numbers: only Japanese counts "1 session"', () => {
    for (const lang of ['en', 'vi'] as const) {
      const all = Object.values(locales[lang].tomo.lines as Record<string, Record<string, string>>).flatMap((v) => Object.values(v));
      for (const line of all) expect(line).not.toMatch(/\d/);
    }
  });

  it('the celebration pill keeps its {count} slot in every language', () => {
    for (const dict of Object.values(locales)) {
      expect(dict.tomo.celebration.minutes).toContain('{count}');
      expect(dict.tomo.celebration.summary).toContain('{count}');
    }
  });
});
