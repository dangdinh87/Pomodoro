import { findColorPreset, type AccentTokens, type ColorPreset } from '@/config/themes';

const COLOR_KEY_STORAGE = 'ui-theme-key';
const FONT_STORAGE = 'ui-font';
const FONT_SIZE_STORAGE = 'ui-font-size';
const STYLE_TAG_ID = 'app-theme-vars';
const DARK_SELECTOR = ":root[data-theme='dark']";

const toCss = (tokens: AccentTokens) =>
  Object.entries(tokens)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join('\n');

/**
 * A <style> tag (not inline vars on <html>) so it is applied after globals.css and wins over the
 * default PRIMARY block. Selectors mirror globals.css (`:root` / `:root[data-theme='dark']`).
 */
export function applyColorPreset(preset: ColorPreset) {
  const existing = document.getElementById(STYLE_TAG_ID);
  if (preset.key === 'default') {
    existing?.remove();
    return;
  }
  const styleEl = existing ?? Object.assign(document.createElement('style'), { id: STYLE_TAG_ID });
  styleEl.textContent = `:root {\n${toCss(preset.light)}\n}\n${DARK_SELECTOR} {\n${toCss(preset.dark)}\n}`;
  if (!existing) document.head.appendChild(styleEl);
}

export function getSavedColorPreset(): ColorPreset {
  return findColorPreset(localStorage.getItem(COLOR_KEY_STORAGE));
}

export function saveColorPreset(preset: ColorPreset) {
  if (preset.key === 'default') localStorage.removeItem(COLOR_KEY_STORAGE);
  else localStorage.setItem(COLOR_KEY_STORAGE, preset.key);
  applyColorPreset(preset);
}

/** Body font choices. Nunito (the default) is the `--font-body` stack from globals.css, so its css is empty. */
export const UI_FONTS = [
  { name: 'Nunito', css: '' },
  {
    name: 'System UI',
    css: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
] as const;

export type UiFontName = (typeof UI_FONTS)[number]['name'];

/** Saved fonts that are no longer offered (Be Vietnam Pro, Space Grotesk, Inter...) fall back to Nunito. */
export function getSavedUiFont(): UiFontName {
  const saved = localStorage.getItem(FONT_STORAGE);
  return UI_FONTS.find((f) => f.name === saved)?.name ?? UI_FONTS[0].name;
}

export function applyUiFont(name: UiFontName, persist = false) {
  document.body.style.fontFamily = UI_FONTS.find((f) => f.name === name)?.css ?? '';
  if (persist) localStorage.setItem(FONT_STORAGE, name);
}

export const UI_FONT_SIZES = { small: '14px', medium: '16px', large: '18px' } as const;
export type UiFontSize = keyof typeof UI_FONT_SIZES;

export function getSavedUiFontSize(): UiFontSize {
  const saved = localStorage.getItem(FONT_SIZE_STORAGE);
  return saved && saved in UI_FONT_SIZES ? (saved as UiFontSize) : 'medium';
}

export function applyUiFontSize(size: UiFontSize, persist = false) {
  document.documentElement.style.fontSize = UI_FONT_SIZES[size];
  if (persist) localStorage.setItem(FONT_SIZE_STORAGE, size);
}
