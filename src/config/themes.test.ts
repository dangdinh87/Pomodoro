import { readFileSync } from 'node:fs';
import path from 'node:path';
import { allColorPresets, defaultTheme, findColorPreset, type AccentTokens } from './themes';

/**
 * WCAG contrast guard for the Sticker pop palette (spec §8). Surface, ink and tone values are read
 * from globals.css so this test follows the real tokens instead of a copy that could drift.
 */
const css = readFileSync(path.resolve(import.meta.dirname, '../app/globals.css'), 'utf8');

/** Declarations of the first `selector { ... }` block. Token blocks have no nested braces. */
function readBlock(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`globals.css has no "${selector}" block`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n  }', start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const lightTokens = readBlock(':root');
const darkTokens = { ...lightTokens, ...readBlock(":root[data-theme='dark']") };
const modes = { light: lightTokens, dark: darkTokens } as const;

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;
const tones = ['success', 'warning', 'danger', 'info', 'ai'] as const;
const candies = ['tomato', 'mint', 'butter', 'lilac', 'sky', 'peach'] as const;

describe('tokens in globals.css', () => {
  it('use the values from the spec', () => {
    expect(lightTokens['--surface-page']).toBe('#FFF3E0');
    expect(darkTokens['--surface-page']).toBe('#1A120F');
    expect(lightTokens['--on-accent']).toBe('#2A1A14');
    expect(darkTokens['--on-accent']).toBe('#2A1A14');
  });

  describe.each(Object.entries(modes))('%s mode', (_mode, t) => {
    it('--ink-muted is readable on the page', () => {
      expect(contrast(t['--ink-muted'], t['--surface-page'])).toBeGreaterThanOrEqual(AA);
    });

    it.each(['--ink', '--ink-secondary', '--ink-muted'])('%s is readable on page, card and raised surfaces', (ink) => {
      for (const surface of ['--surface-page', '--surface', '--surface-raised']) {
        expect(contrast(t[ink], t[surface])).toBeGreaterThanOrEqual(AA);
      }
    });

    it.each(candies)('--on-accent is readable on candy %s', (name) => {
      expect(contrast(t['--on-accent'], t[`--candy-${name}`])).toBeGreaterThanOrEqual(AA);
    });

    it.each(tones)('tone %s: --on-accent on the fill and -ink on -bg are readable', (tone) => {
      expect(contrast(t['--on-accent'], t[`--${tone}`])).toBeGreaterThanOrEqual(AA);
      expect(contrast(t[`--${tone}-ink`], t[`--${tone}-bg`])).toBeGreaterThanOrEqual(AA);
    });
  });
});

describe('colour presets', () => {
  const presetModes = (p: (typeof allColorPresets)[number]) =>
    [
      ['light', p.light, lightTokens],
      ['dark', p.dark, darkTokens],
    ] as const;

  it('has 6 presets with Tomato first and unique keys', () => {
    expect(allColorPresets).toHaveLength(6);
    expect(allColorPresets[0]).toBe(defaultTheme);
    expect(new Set(allColorPresets.map((p) => p.key)).size).toBe(6);
  });

  it.each(allColorPresets.map((p) => [p.key, p] as const))('%s: --on-accent on --accent-solid >= 4.5 in both modes', (_key, preset) => {
    for (const [, accent, t] of presetModes(preset)) {
      expect(contrast(t['--on-accent'], accent['accent-solid'])).toBeGreaterThanOrEqual(AA);
      expect(contrast(t['--on-accent'], accent['accent-solid-hover'])).toBeGreaterThanOrEqual(AA);
    }
  });

  it.each(allColorPresets.map((p) => [p.key, p] as const))('%s: --accent text on --surface-page >= 4.5 in light and dark', (_key, preset) => {
    for (const [, accent, t] of presetModes(preset)) {
      expect(contrast(accent.accent, t['--surface-page'])).toBeGreaterThanOrEqual(AA);
      expect(contrast(accent['accent-hover'], t['--surface-page'])).toBeGreaterThanOrEqual(AA);
    }
  });

  it.each(allColorPresets.map((p) => [p.key, p] as const))('%s: --accent-ink on --accent-soft >= 4.5 in both modes', (_key, preset) => {
    for (const [, accent] of presetModes(preset)) {
      expect(contrast(accent['accent-ink'], accent['accent-soft'])).toBeGreaterThanOrEqual(AA);
    }
  });

  it('Tomato matches the PRIMARY block in globals.css, so removing the override changes nothing', () => {
    const pick = (tokens: Record<string, string>, keys: (keyof AccentTokens)[]) =>
      Object.fromEntries(keys.map((k) => [k, tokens[`--${k}`]]));
    const keys = Object.keys(defaultTheme.light) as (keyof AccentTokens)[];
    expect(pick(lightTokens, keys)).toEqual(defaultTheme.light);
    expect(pick(darkTokens, keys)).toEqual(defaultTheme.dark);
  });

  it('falls back to Tomato for missing, empty and retired saved keys', () => {
    for (const key of [undefined, null, '', 'blue', 'emerald', 'mono', 'pink-light', 'nope']) {
      expect(findColorPreset(key)).toBe(defaultTheme);
    }
    expect(findColorPreset('lavender').key).toBe('lavender');
  });
});
