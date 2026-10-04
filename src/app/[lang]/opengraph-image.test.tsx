// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getT } from '@/lib/server-translations';
import Image, { alt, contentType, size } from './opengraph-image';

const font = (name: string) => readFileSync(join(process.cwd(), 'assets/fonts', name));

/** Code points a TrueType font can draw (cmap format 4, enough for the BMP subsets we ship). */
function codePoints(ttf: Buffer): Set<number> {
  const tables = ttf.readUInt16BE(4);
  let cmapAt = -1;
  for (let i = 0; i < tables; i++) {
    const record = 12 + i * 16;
    if (ttf.toString('ascii', record, record + 4) === 'cmap') cmapAt = ttf.readUInt32BE(record + 8);
  }
  const found = new Set<number>();
  const subtables = ttf.readUInt16BE(cmapAt + 2);
  for (let i = 0; i < subtables; i++) {
    const at = cmapAt + ttf.readUInt32BE(cmapAt + 4 + i * 8 + 4);
    if (ttf.readUInt16BE(at) !== 4) continue;
    const segs = ttf.readUInt16BE(at + 6) / 2;
    const end = at + 14;
    const start = end + segs * 2 + 2;
    const delta = start + segs * 2;
    const range = delta + segs * 2;
    for (let s = 0; s < segs; s++) {
      for (let c = ttf.readUInt16BE(start + s * 2); c <= ttf.readUInt16BE(end + s * 2) && c < 0xffff; c++) {
        const offset = ttf.readUInt16BE(range + s * 2);
        let glyph = c + ttf.readInt16BE(delta + s * 2);
        if (offset !== 0) {
          glyph = ttf.readUInt16BE(range + s * 2 + offset + (c - ttf.readUInt16BE(start + s * 2)) * 2);
          if (glyph !== 0) glyph += ttf.readInt16BE(delta + s * 2);
        }
        if ((glyph & 0xffff) !== 0) found.add(c);
      }
    }
  }
  return found;
}

const missing = (text: string, fonts: Buffer[]) => {
  const covered = fonts.map(codePoints);
  return [...text].filter((char) => char.trim() && !covered.some((set) => set.has(char.codePointAt(0)!)));
};

const render = (lang: string) => Image({ params: Promise.resolve({ lang }) });
const png = async (response: Response) => Buffer.from(await response.arrayBuffer());

describe('share image', () => {
  it('is a 1200x630 PNG with English alt text for the file convention', () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe('image/png');
    expect(alt).toBe(getT('en')('site.meta.og.alt'));
  });

  it.each(['en', 'vi', 'ja'])('renders a PNG of the right size for %s', async (lang) => {
    const response = await render(lang);
    expect(response.headers.get('content-type')).toBe('image/png');
    const bytes = await png(response);
    expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(bytes.readUInt32BE(16)).toBe(1200);
    expect(bytes.readUInt32BE(20)).toBe(630);
  }, 30_000);

  it('draws a different tagline per language (the three images are not the same bytes)', async () => {
    const [en, vi, ja] = await Promise.all(['en', 'vi', 'ja'].map(async (lang) => (await png(await render(lang))).toString('base64')));
    expect(new Set([en, vi, ja]).size).toBe(3);
  }, 30_000);

  it('falls back to English for an unknown language instead of failing', async () => {
    const [fallback, english] = await Promise.all([render('fr'), render('en')].map(async (r) => png(await r)));
    expect(fallback.equals(english)).toBe(true);
  }, 30_000);
});

describe('share image fonts cover the taglines (no empty boxes)', () => {
  const baloo = [font('Baloo2-Bold.ttf'), font('Baloo2-ExtraBold.ttf')];
  const zen = font('ZenMaruGothic-Bold-ja-subset.ttf');

  it('English and Vietnamese, with their diacritics, are in Baloo 2', () => {
    for (const lang of ['en', 'vi'] as const) {
      expect(missing(getT(lang)('site.meta.og.tagline'), baloo)).toEqual([]);
    }
    expect(missing('Study Bro', baloo)).toEqual([]);
  });

  it('Japanese is in the Zen Maru Gothic subset; edit the tagline and the subset must be rebuilt (assets/fonts/README.md)', () => {
    expect(missing(getT('ja')('site.meta.og.tagline'), [zen, ...baloo])).toEqual([]);
  });

  it('the checker itself does notice a missing glyph', () => {
    expect(missing('犬', baloo)).toEqual(['犬']);
  });
});
