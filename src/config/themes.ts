/**
 * Colour presets — each one only swaps the PRIMARY block of the design system
 * (docs/design-system.md §0). Neutrals, surfaces and semantic tones stay shared.
 *
 * Step choice follows the AA rule: white text on `--accent-solid` must reach 4.5:1,
 * so emerald/amber/cyan/teal/mono use step 700; indigo/violet use 400 as dark-mode text.
 */

type Step = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type Ramp = Partial<Record<Step, string>>;

export type AccentTokens = {
  accent: string;
  'accent-hover': string;
  'accent-soft': string;
  'accent-ink': string;
  'accent-solid': string;
  'accent-solid-hover': string;
  'accent-edge': string;
};

export type ColorPreset = {
  key: string;
  name: string;
  emoji: string;
  description: string;
  /** Swatch shown in pickers (light-mode solid). */
  swatch: string;
  light: AccentTokens;
  dark: AccentTokens;
};

const DARK_SURFACE = '#18181b';

function fromRamp(
  ramp: Ramp,
  { solid, darkAccent = 500 }: { solid: 600 | 700; darkAccent?: 300 | 400 | 500 },
): Pick<ColorPreset, 'swatch' | 'light' | 'dark'> {
  const step = (s: number) => ramp[s as Step] as string;
  return {
    swatch: step(solid),
    light: {
      accent: step(solid),
      'accent-hover': step(solid + 100),
      'accent-soft': step(100),
      'accent-ink': step(800),
      'accent-solid': step(solid),
      'accent-solid-hover': step(solid + 100),
      'accent-edge': step(solid + 100),
    },
    dark: {
      accent: step(darkAccent),
      'accent-hover': step(darkAccent - 100),
      'accent-soft': `color-mix(in srgb, ${step(500)} 30%, ${DARK_SURFACE})`,
      'accent-ink': step(300),
      'accent-solid': step(solid),
      'accent-solid-hover': step(solid + 100),
      'accent-edge': step(solid + 200),
    },
  };
}

const RAMPS = {
  tomato: { 100: '#FFE2D8', 300: '#FF9C7D', 400: '#FB7350', 500: '#F0532D', 600: '#D93A16', 700: '#B42E10', 800: '#8F2711', 900: '#742413' },
  blue: { 100: '#DBEAFE', 300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A' },
  rose: { 100: '#FFE4E6', 300: '#FDA4AF', 400: '#FB7185', 500: '#F43F5E', 600: '#E11D48', 700: '#BE123C', 800: '#9F1239', 900: '#881337' },
  emerald: { 100: '#D1FAE5', 300: '#6EE7B7', 400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B' },
  indigo: { 100: '#E0E7FF', 300: '#A5B4FC', 400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA', 800: '#3730A3', 900: '#312E81' },
  violet: { 100: '#EDE9FE', 300: '#C4B5FD', 400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9', 800: '#5B21B6', 900: '#4C1D95' },
  amber: { 100: '#FEF3C7', 300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F' },
  cyan: { 100: '#CFFAFE', 300: '#67E8F9', 400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2', 700: '#0E7490', 800: '#155E75', 900: '#164E63' },
  teal: { 100: '#CCFBF1', 300: '#5EEAD4', 400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 800: '#115E59', 900: '#134E4A' },
  pink: { 100: '#FCE7F3', 300: '#F9A8D4', 400: '#F472B6', 500: '#EC4899', 600: '#DB2777', 700: '#BE185D', 800: '#9D174D', 900: '#831843' },
  zinc: { 100: '#F4F4F5', 200: '#E4E4E7', 300: '#D4D4D8', 400: '#A1A1AA', 500: '#71717A', 600: '#52525B', 700: '#3F3F46', 800: '#27272A', 900: '#18181B' },
} satisfies Record<string, Ramp>;

/** Matches the PRIMARY block in globals.css — applying it means removing any override. */
export const defaultTheme: ColorPreset = {
  key: 'default',
  name: 'Tomato',
  emoji: '🍅',
  description: 'Classic tomato',
  ...fromRamp(RAMPS.tomato, { solid: 600 }),
};

export const themePresets: ColorPreset[] = [
  { key: 'mono', name: 'Monochrome', emoji: '🖤', description: 'Minimal & pro', ...fromRamp(RAMPS.zinc, { solid: 700, darkAccent: 300 }) },
  { key: 'blue', name: 'Blue', emoji: '💙', description: 'Calm & focused', ...fromRamp(RAMPS.blue, { solid: 600 }) },
  { key: 'rose', name: 'Rose', emoji: '🌹', description: 'Romantic & love vibe', ...fromRamp(RAMPS.rose, { solid: 600 }) },
  { key: 'emerald', name: 'Forest', emoji: '🌲', description: 'Nature & chill', ...fromRamp(RAMPS.emerald, { solid: 700 }) },
  { key: 'indigo', name: 'Midnight', emoji: '🌌', description: 'Deep focus mode', ...fromRamp(RAMPS.indigo, { solid: 600, darkAccent: 400 }) },
  { key: 'violet', name: 'Lavender', emoji: '💜', description: 'Dreamy & calm', ...fromRamp(RAMPS.violet, { solid: 600, darkAccent: 400 }) },
  { key: 'amber', name: 'Autumn', emoji: '🍂', description: 'Warm vintage mood', ...fromRamp(RAMPS.amber, { solid: 700 }) },
  { key: 'cyan', name: 'Mint', emoji: '🌿', description: 'Fresh & clean', ...fromRamp(RAMPS.cyan, { solid: 700 }) },
  { key: 'teal', name: 'Ocean', emoji: '🌊', description: 'Deep blue energy', ...fromRamp(RAMPS.teal, { solid: 700 }) },
  { key: 'pink', name: 'Sakura', emoji: '🌸', description: 'Soft spring vibe', ...fromRamp(RAMPS.pink, { solid: 600 }) },
];

export const allColorPresets: ColorPreset[] = [defaultTheme, ...themePresets];

// Older builds had two pink presets that only differed in background tint.
const LEGACY_KEYS: Record<string, string> = { 'pink-light': 'pink', 'pink-mild': 'pink' };

export function findColorPreset(key: string | null | undefined): ColorPreset {
  const resolved = key ? LEGACY_KEYS[key] ?? key : 'default';
  return allColorPresets.find((p) => p.key === resolved) ?? defaultTheme;
}
