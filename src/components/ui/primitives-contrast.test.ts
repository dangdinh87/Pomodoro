import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// Batch 2.3b contrast sweep: on-accent text on coloured fills, -ink tokens for tone text.
// A source scan keeps a stray text-white or text-success from coming back.
const FILES = [
  'ui/button',
  'ui/input',
  'ui/textarea',
  'ui/label',
  'ui/checkbox',
  'ui/radio-group',
  'ui/switch',
  'ui/slider',
  'ui/tabs',
  'ui/filter-chip',
  'ui/badge',
  'ui/card',
  'ui/avatar',
  'ui/skeleton',
  'ui/kbd',
  'ui/stat-strip',
  'ui/page-header',
  'ui/separator',
  'ui/table',
  'ui/empty-state',
  'ui/loader',
  'ui/icon-tile',
  'ui/sticker-card',
  'ui/streak-pill',
  'ui/session-tomatoes',
  'brand/tomo-bubble',
];

const source = (name: string) => readFileSync(path.join(import.meta.dirname, '..', `${name}.tsx`), 'utf8');

describe('primitive colour tokens', () => {
  it.each(FILES)('%s has no hard-coded white text', (name) => {
    expect(source(name)).not.toMatch(/text-white/);
  });

  it.each(FILES)('%s never uses a solid tone fill as text colour', (name) => {
    expect(source(name)).not.toMatch(/\btext-(success|warning|danger|info|ai|destructive|gold)(?![-\w])/);
  });
});

// WCAG 1.4.11: the edge of a form control (unchecked box, input, track) needs 3:1 against what it sits on.
describe('control edge', () => {
  const css = readFileSync(path.join(import.meta.dirname, '../../app/globals.css'), 'utf8');
  const value = (block: string, token: string) =>
    new RegExp(`${block}\\s*\\{[^}]*?${token}\\s*:\\s*(#[0-9A-Fa-f]{6})`).exec(css)?.[1] as string;
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  it('dark --control-edge is >= 3:1 on the card and the page', () => {
    const edge = value(":root\\[data-theme='dark'\\]", '--control-edge');
    expect(edge).toBeTruthy();
    expect(contrast(edge, value(":root\\[data-theme='dark'\\]", '--surface'))).toBeGreaterThanOrEqual(3);
    expect(contrast(edge, value(":root\\[data-theme='dark'\\]", '--surface-page'))).toBeGreaterThanOrEqual(3);
  });

  it('light edge (the --outline ink) is >= 3:1 on the card and the page', () => {
    const outline = value(':root', '--outline');
    expect(contrast(outline, value(':root', '--surface'))).toBeGreaterThanOrEqual(3);
    expect(contrast(outline, value(':root', '--surface-page'))).toBeGreaterThanOrEqual(3);
  });
});
