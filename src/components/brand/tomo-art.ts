/**
 * Tomo artwork as plain data, so one drawing feeds every surface:
 *  - `Tomo` (React, theme tokens through CSS variables)
 *  - `public/favicon.svg`, PWA icons (scripts/generate-brand-icons.mjs, literal colours)
 *  - the Open Graph image (data-URI <img> in next/og, literal colours)
 *
 * Pure TypeScript with no imports so Node can load it through `tsx` as well.
 * Coordinates live in a 120 x 120 box. The tomato spans x 14-106, y 29-111, the stem
 * reaches y 15, and the party / sleepy extras sit in the corners.
 */

export type TomoFace = 'happy' | 'focus' | 'party' | 'sleepy' | 'worried';

export const TOMO_FACES: readonly TomoFace[] = ['happy', 'focus', 'party', 'sleepy', 'worried'];

export interface TomoNode {
  tag: string;
  attrs: Record<string, string | number>;
  children?: TomoNode[];
}

export interface TomoPalette {
  body: string;
  shade: string;
  highlight: string;
  leaf: string;
  leafDark: string;
  /** Sticker outline. */
  outline: string;
  /** Pupils, brows, mouth. Stays dark in both themes because it sits on the tomato. */
  ink: string;
  eyeWhite: string;
  blush: string;
  tongue: string;
  tear: string;
  zzz: string;
  confetti: [string, string, string, string];
}

/** Theme-aware: the same artwork follows light / dark through the design tokens. */
export const TOMO_THEME_PALETTE: TomoPalette = {
  body: 'var(--candy-tomato)',
  shade: '#EE4321',
  highlight: '#FFFFFF',
  leaf: '#4CC38A',
  leafDark: '#2E9E68',
  outline: 'var(--outline)',
  ink: 'var(--on-accent)',
  eyeWhite: '#FFFFFF',
  blush: '#FFB3BA',
  tongue: '#FF8A93',
  tear: 'var(--candy-sky)',
  zzz: '#8E9BB0',
  confetti: ['var(--candy-butter)', 'var(--candy-sky)', 'var(--candy-mint)', 'var(--candy-lilac)'],
};

/** Literal light-mode colours for files that cannot read CSS variables (SVG files, next/og). */
export const TOMO_LIGHT_PALETTE: TomoPalette = {
  ...TOMO_THEME_PALETTE,
  body: '#FF5A36',
  outline: '#2A1A14',
  ink: '#2A1A14',
  tear: '#7CC8FF',
  confetti: ['#FFD45C', '#7CC8FF', '#7BDCB5', '#C9B6FF'],
};

/** Whole 120 box: room for the stem and the corner extras. */
export const TOMO_VIEWBOX = '0 0 120 120';
/** Square crop around the tomato (logo, favicon): extras stay inside, margins go away. */
export const TOMO_TIGHT_VIEWBOX = '8 12 104 104';

const el = (tag: string, attrs: TomoNode['attrs'], children?: TomoNode[]): TomoNode => ({
  tag,
  attrs,
  children,
});

/** Outline + round joins shared by every stroked shape. */
const line = (p: TomoPalette, sw: number) => ({
  stroke: p.outline,
  'stroke-width': sw,
  'stroke-linejoin': 'round',
  'stroke-linecap': 'round',
});

/** Pupils and brows share the dark ink colour. */
const stroke = (p: TomoPalette, w: number) => ({
  fill: 'none',
  stroke: p.ink,
  'stroke-width': w,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
});

function bodyNodes(p: TomoPalette, sw: number): TomoNode[] {
  return [
    // Stem first so the leaf crown overlaps its base. Outline pass, then the green core.
    el('path', { d: 'M60 40 C60 31 62 25 67 19', fill: 'none', ...line(p, 4 + sw * 2) }),
    el('path', { d: 'M60 40 C60 31 62 25 67 19', fill: 'none', stroke: p.leafDark, 'stroke-width': 4, 'stroke-linecap': 'round' }),
    // Tomato: fill, lower shade (an arc on the same ellipse), highlight, then the outline on top.
    el('ellipse', { cx: 60, cy: 70, rx: 46, ry: 41, fill: p.body }),
    el('path', { d: 'M16 82 A46 41 0 0 0 104 82 Q60 108 16 82Z', fill: p.shade }),
    el('ellipse', { cx: 34, cy: 54, rx: 9, ry: 5, fill: p.highlight, opacity: 0.6, transform: 'rotate(-35 34 54)' }),
    el('ellipse', { cx: 60, cy: 70, rx: 46, ry: 41, fill: 'none', ...line(p, sw) }),
    // Green sepal "hair".
    el('path', {
      d: 'M60 41 C52 27 40 28 33 33 C43 34 49 37 52 41 C43 41 36 44 34 49 C43 46 52 45 60 45 C68 45 77 46 86 49 C84 44 77 41 68 41 C71 37 77 34 87 33 C80 28 68 27 60 41Z',
      fill: p.leaf,
      ...line(p, sw),
    }),
  ];
}

function eye(p: TomoPalette, sw: number, x: number, y: number, dx = 1.5, dy = 2): TomoNode[] {
  return [
    el('ellipse', { cx: x, cy: y, rx: 9.5, ry: 11.5, fill: p.eyeWhite, ...line(p, sw * 0.8) }),
    el('circle', { cx: x + dx, cy: y + dy, r: 6, fill: p.ink }),
    el('circle', { cx: x + dx - 2, cy: y + dy - 2.5, r: 2.2, fill: p.eyeWhite }),
  ];
}

function cheeks(p: TomoPalette): TomoNode[] {
  return [
    el('ellipse', { cx: 29, cy: 86, rx: 7, ry: 4.5, fill: p.blush, opacity: 0.85 }),
    el('ellipse', { cx: 91, cy: 86, rx: 7, ry: 4.5, fill: p.blush, opacity: 0.85 }),
  ];
}

/** Open smile: dark mouth, tongue clipped by drawing it as a lower bump. */
function openMouth(p: TomoPalette, x0: number, x1: number, y: number, depth: number, sw: number): TomoNode[] {
  const mid = (x0 + x1) / 2;
  return [
    el('path', { d: `M${x0} ${y} Q${mid} ${y + depth} ${x1} ${y}Z`, fill: p.ink, stroke: p.ink, 'stroke-width': sw * 0.4, 'stroke-linejoin': 'round' }),
    el('ellipse', { cx: mid, cy: y + depth * 0.5 - 0.5, rx: (x1 - x0) * 0.2, ry: depth * 0.13 + 1, fill: p.tongue }),
  ];
}

function faceNodes(face: TomoFace, p: TomoPalette, sw: number): TomoNode[] {
  switch (face) {
    case 'happy':
      return [...eye(p, sw, 46, 72), ...eye(p, sw, 74, 72), ...cheeks(p), ...openMouth(p, 50, 70, 87, 14, sw)];
    case 'focus':
      return [
        ...eye(p, sw, 46, 73, 0, 4),
        ...eye(p, sw, 74, 73, 0, 4),
        ...cheeks(p),
        el('path', { d: 'M38 57 L54 61 M82 57 L66 61', ...stroke(p, 3.8) }),
        el('path', { d: 'M54 92 L66 92', ...stroke(p, 3.8) }),
      ];
    case 'party':
      return [
        // ^ ^ eyes: shut with joy.
        el('path', { d: 'M37 75 Q46 62 55 75 M65 75 Q74 62 83 75', ...stroke(p, 4.2) }),
        ...cheeks(p),
        ...openMouth(p, 46, 74, 84, 24, sw),
        // Confetti around the head.
        el('rect', { x: 8, y: 21, width: 8, height: 8, rx: 1.6, fill: p.confetti[0], transform: 'rotate(20 12 25)', ...line(p, sw * 0.5) }),
        el('rect', { x: 103, y: 28, width: 8, height: 8, rx: 1.6, fill: p.confetti[1], transform: 'rotate(-25 107 32)', ...line(p, sw * 0.5) }),
        el('circle', { cx: 101, cy: 15, r: 4, fill: p.confetti[2], ...line(p, sw * 0.5) }),
        el('circle', { cx: 15, cy: 45, r: 3.6, fill: p.confetti[3], ...line(p, sw * 0.5) }),
      ];
    case 'sleepy':
      return [
        // Closed, drooping eyes.
        el('path', { d: 'M37 73 Q46 82 55 73 M65 73 Q74 82 83 73', ...stroke(p, 4.2) }),
        ...cheeks(p),
        el('ellipse', { cx: 60, cy: 92, rx: 4.2, ry: 3.4, fill: p.ink }),
        // z z: strokes, so no font is involved.
        el('path', { d: 'M90 32 H101 L90 45 H101', fill: 'none', stroke: p.zzz, 'stroke-width': 4.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
        el('path', { d: 'M103 15 H110 L103 24 H110', fill: 'none', stroke: p.zzz, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
      ];
    case 'worried':
      return [
        ...eye(p, sw, 46, 74, 0, 3),
        ...eye(p, sw, 74, 74, 0, 3),
        el('path', { d: 'M38 62 L52 57 M82 62 L68 57', ...stroke(p, 3.8) }),
        el('path', { d: 'M52 96 Q60 88 68 96', ...stroke(p, 3.8) }),
        // Sweat drop.
        el('path', { d: 'M96 62 Q101 70 96 75 Q91 70 96 62Z', fill: p.tear, ...line(p, sw * 0.5) }),
      ];
  }
}

export interface TomoArtOptions {
  /** Outline width in the 120 box. Thicker reads better at favicon / 24px sizes. */
  strokeWidth?: number;
}

/** The drawing as a node tree. */
export function tomoNodes(face: TomoFace, palette: TomoPalette, { strokeWidth = 3.5 }: TomoArtOptions = {}): TomoNode[] {
  return [...bodyNodes(palette, strokeWidth), ...faceNodes(face, palette, strokeWidth)];
}

const esc = (v: string | number) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function serializeNodes(nodes: TomoNode[]): string {
  return nodes
    .map(({ tag, attrs, children }) => {
      const a = Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${esc(v)}"`)
        .join('');
      return children?.length ? `<${tag}${a}>${serializeNodes(children)}</${tag}>` : `<${tag}${a}/>`;
    })
    .join('');
}

export interface TomoSvgOptions extends TomoArtOptions {
  /** Pixel size of the rendered square. */
  size?: number;
  /** Crop to the tomato instead of the full 120 box. */
  tight?: boolean;
}

/** A standalone `<svg>` document string (favicon, PNG source, data-URI image). */
export function tomoSvg(face: TomoFace, palette: TomoPalette = TOMO_LIGHT_PALETTE, opts: TomoSvgOptions = {}): string {
  const { size = 120, tight = false, ...art } = opts;
  const viewBox = tight ? TOMO_TIGHT_VIEWBOX : TOMO_VIEWBOX;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">${serializeNodes(tomoNodes(face, palette, art))}</svg>`;
}
