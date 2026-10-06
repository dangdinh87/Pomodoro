/**
 * Colour presets — Sticker pop (docs/superpowers/specs/2026-10-05-sticker-pop-rebrand-design.md §8).
 * Each preset only swaps the PRIMARY block (accent*, applied through <style id="app-theme-vars">
 * by src/lib/ui-preferences.ts). Neutrals, surfaces, candy colours and tones stay shared.
 *
 * Text on every solid fill is `--on-accent` (#2A1A14), so a preset must satisfy two rules,
 * enforced by themes.test.ts for light and dark:
 *  - --on-accent on --accent-solid >= 4.5:1
 *  - --accent (text, links, focus ring) on --surface-page >= 4.5:1
 * Dark mode keeps the solid fill of light mode; only the text/soft steps change.
 */

export type AccentTokens = {
  /** Text, links, focus ring. */
  accent: string;
  'accent-hover': string;
  /** Pale panel carrying the primary colour. */
  'accent-soft': string;
  /** Text on `accent-soft`. */
  'accent-ink': string;
  /** Solid fill (primary button, selected chip). Text on it is --on-accent. */
  'accent-solid': string;
  'accent-solid-hover': string;
};

export type ColorPreset = {
  key: string;
  name: string;
  description: string;
  /** Swatch shown in pickers. */
  swatch: string;
  light: AccentTokens;
  dark: AccentTokens;
};

/** Matches the PRIMARY block in globals.css — applying it means removing any override. */
export const defaultTheme: ColorPreset = {
  key: 'default',
  name: 'Tomato',
  description: 'Classic tomato',
  swatch: '#FF5A36',
  light: {
    accent: '#C2330F',
    'accent-hover': '#9E290B',
    'accent-soft': '#FFD9CC',
    'accent-ink': '#8F2711',
    'accent-solid': '#FF5A36',
    'accent-solid-hover': '#FF7050',
  },
  dark: {
    accent: '#FF8A6B',
    'accent-hover': '#FFA38A',
    'accent-soft': '#5C2E22',
    'accent-ink': '#FFB09C',
    'accent-solid': '#FF5A36',
    'accent-solid-hover': '#FF7050',
  },
};

export const themePresets: ColorPreset[] = [
  {
    key: 'mint',
    name: 'Mint',
    description: 'Fresh and calm',
    swatch: '#7BDCB5',
    light: {
      accent: '#1E7A57',
      'accent-hover': '#17634A',
      'accent-soft': '#D2F3E4',
      'accent-ink': '#13603F',
      'accent-solid': '#7BDCB5',
      'accent-solid-hover': '#8FE3C1',
    },
    dark: {
      accent: '#7BDCB5',
      'accent-hover': '#9BE8C8',
      'accent-soft': '#1F3A2D',
      'accent-ink': '#A6EBCF',
      'accent-solid': '#7BDCB5',
      'accent-solid-hover': '#8FE3C1',
    },
  },
  {
    key: 'butter',
    name: 'Butter',
    description: 'Warm and sunny',
    swatch: '#FFD45C',
    light: {
      accent: '#8A5C00',
      'accent-hover': '#6E4900',
      'accent-soft': '#FFF0BF',
      'accent-ink': '#7A5200',
      'accent-solid': '#FFD45C',
      'accent-solid-hover': '#FFDE80',
    },
    dark: {
      accent: '#FFD45C',
      'accent-hover': '#FFE08A',
      'accent-soft': '#40330F',
      'accent-ink': '#FFE58F',
      'accent-solid': '#FFD45C',
      'accent-solid-hover': '#FFDE80',
    },
  },
  {
    key: 'lavender',
    name: 'Lavender',
    description: 'Dreamy and soft',
    swatch: '#C9B6FF',
    light: {
      accent: '#5E3DBE',
      'accent-hover': '#4B2C9E',
      'accent-soft': '#E9E0FF',
      'accent-ink': '#4B2C9E',
      'accent-solid': '#C9B6FF',
      'accent-solid-hover': '#D6C8FF',
    },
    dark: {
      accent: '#C9B6FF',
      'accent-hover': '#DDD0FF',
      'accent-soft': '#33284F',
      'accent-ink': '#DDD0FF',
      'accent-solid': '#C9B6FF',
      'accent-solid-hover': '#D6C8FF',
    },
  },
  {
    key: 'sky',
    name: 'Sky',
    description: 'Open and clear',
    swatch: '#7CC8FF',
    light: {
      accent: '#1A5F99',
      'accent-hover': '#144D7D',
      'accent-soft': '#D6ECFF',
      'accent-ink': '#0F4C81',
      'accent-solid': '#7CC8FF',
      'accent-solid-hover': '#94D3FF',
    },
    dark: {
      accent: '#7CC8FF',
      'accent-hover': '#9DD7FF',
      'accent-soft': '#1B3347',
      'accent-ink': '#A9DCFF',
      'accent-solid': '#7CC8FF',
      'accent-solid-hover': '#94D3FF',
    },
  },
  {
    key: 'peach',
    name: 'Peach',
    description: 'Gentle and cosy',
    swatch: '#FFB38A',
    light: {
      accent: '#A8481A',
      'accent-hover': '#8A3C12',
      'accent-soft': '#FFE3D3',
      'accent-ink': '#8A3C12',
      'accent-solid': '#FFB38A',
      'accent-solid-hover': '#FFC3A1',
    },
    dark: {
      accent: '#FFB38A',
      'accent-hover': '#FFC3A1',
      'accent-soft': '#4A2A1A',
      'accent-ink': '#FFCFB4',
      'accent-solid': '#FFB38A',
      'accent-solid-hover': '#FFC3A1',
    },
  },
];

export const allColorPresets: ColorPreset[] = [defaultTheme, ...themePresets];

/** Unknown or retired saved keys (the old 10 presets) fall back to Tomato. */
export function findColorPreset(key: string | null | undefined): ColorPreset {
  return allColorPresets.find((p) => p.key === key) ?? defaultTheme;
}
