/**
 * Saved-background migration. Pure, so it is unit-tested (background-migration.test.ts).
 * Old path-based values map to pack ids; removed art maps to a kept sibling or the default scene.
 */

import { findImageById } from '@/data/background-packs';
import { findSceneById } from '@/features/scenes/lib/scene-registry';

export type BGType = 'none' | 'solid' | 'image' | 'gradient' | 'random' | 'scene';

export interface BackgroundSettings {
  type: BGType;
  value: string;
  opacity: number;
  blur: number;
  brightness: number;
  /** Scenes only. Undefined = on. */
  motion?: boolean;
  /** Scenes only: recolour with the timer mode. Undefined = on. */
  followMode?: boolean;
}

/** The "Pomodoro" scene: a solid tint of the current timer mode (see --stage-tint). */
export const DEFAULT_BACKGROUND: BackgroundSettings = {
  type: 'solid',
  value: 'var(--surface-page)',
  opacity: 1,
  blur: 0,
  brightness: 100,
};

/** Near-duplicate photos retired in the scene overhaul: the old id keeps working via its kept sibling. */
export const ALIASED_BACKGROUND_IDS: Record<string, string> = {
  'fantasy-adventurers-2': 'fantasy-adventurers-1',
  'fantasy-adventurers-3': 'fantasy-adventurers-1',
  'fantasy-adventurers-4': 'fantasy-adventurers-1',
  'fantasy-adventurers-5': 'fantasy-adventurers-1',
  'fantasy-house-moon-illustration-1': 'fantasy-house-moon-illustration',
  'fantasy-house-moon-illustration-2': 'fantasy-house-moon-illustration',
  'fantasy-house-moon-illustration-3': 'fantasy-house-moon-illustration',
  'cityscape-anime-inspired-urban-area-1': 'cityscape-anime-inspired-urban-area',
};

/** IDs no longer in any pack (Classic + Travel removed). Stored value is migrated to the default scene. */
export const REMOVED_BACKGROUND_IDS = new Set([
  'landscape-cartoon',
  'chill-shiba',
  'study-desk',
  'travelling-1',
  'travelling-2',
  'travelling-3',
  'travelling-4',
  'travelling-5',
  'travelling-6',
  'travelling-7',
  'travelling-8',
  'travelling-9',
]);

export const PATH_TO_ID_MAP: Record<string, string> = {
  // Legacy auto lofi → pick day video
  'lofi:auto': 'day-chill',
  'lofi-auto': 'day-chill',

  // Lofi Video (paths → IDs)
  '/backgrounds/day.mp4': 'day-chill',
  '/backgrounds/night.mp4': 'night-chill',

  // Travelling
  '/backgrounds/travelling.jpg': 'travelling-1',
  '/backgrounds/travelling2.jpg': 'travelling-2',
  '/backgrounds/travelling3.jpg': 'travelling-3',
  '/backgrounds/travelling4.jpg': 'travelling-4',
  '/backgrounds/travelling5.jpg': 'travelling-5',
  '/backgrounds/travelling6.jpg': 'travelling-6',
  '/backgrounds/travelling7.jpg': 'travelling-7',
  '/backgrounds/travelling8.jpg': 'travelling-8',
  '/backgrounds/travelling9.jpg': 'travelling-9',

  // Classic
  '/backgrounds/landscape-cartoon.jpg': 'landscape-cartoon',
  '/backgrounds/xmas/chill-shiba-sleeping-christmas-room.jpg': 'chill-shiba',
  '/backgrounds/study_1.jpg': 'study-desk',

  // Cyberpunk
  '/backgrounds/new/night_light.jpg': 'night-light',
  '/backgrounds/new/2151176471.jpg': 'cyberpunk-scene-1',
  '/backgrounds/new/2151470662.jpg': 'cyberpunk-scene-2',
  '/backgrounds/new/abstract-futuristic-city-with-green-grass-bushes-foreground-neural-network-generated-art.jpg':
    'futuristic-city-abstract',
  '/backgrounds/new/building-house-hi-tech-technology-modern-city-cyber-3d-city-cyber.jpg':
    'cyber-city',
  '/backgrounds/new/futuristic-city-skyline-illuminated-by-night-lights-generated-by-ai.jpg':
    'futuristic-city-night',

  // Anime & Cozy
  '/backgrounds/new/anime-style-cozy-home-interior-with-furnishings.jpg':
    'anime-cozy-home-1',
  '/backgrounds/new/anime-style-cozy-home-interior-with-furnishings (1).jpg':
    'anime-cozy-home-2',
  '/backgrounds/new/cozy-home-interior-anime-style.jpg': 'cozy-anime-interior',
  '/backgrounds/new/cozy-room-with-sunset-student.jpg': 'cozy-room-sunset',

  // Fantasy
  '/backgrounds/new/fantasy-group-adventurers.jpg': 'fantasy-adventurers-1',
  '/backgrounds/new/fantasy-group-adventurers (1).jpg':
    'fantasy-adventurers-2',
  '/backgrounds/new/fantasy-group-adventurers (2).jpg':
    'fantasy-adventurers-3',
  '/backgrounds/new/fantasy-group-adventurers (3).jpg':
    'fantasy-adventurers-4',
  '/backgrounds/new/fantasy-group-adventurers (4).jpg':
    'fantasy-adventurers-5',
};

const clamp = (n: unknown, min: number, max: number, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;

/** Migrate old or broken configs to safe values. Returns the same object when nothing changed. */
export function migrateBackground(bg: BackgroundSettings): BackgroundSettings {
  if (!bg?.value || bg.type === 'none' || bg.type === 'random') {
    return { ...DEFAULT_BACKGROUND };
  }

  if (bg.type === 'scene') {
    if (!findSceneById(bg.value)) return { ...DEFAULT_BACKGROUND };
    const brightness = clamp(bg.brightness, 0, 200, 100);
    return brightness === bg.brightness ? bg : { ...bg, brightness };
  }

  if (bg.type === 'image') {
    if (REMOVED_BACKGROUND_IDS.has(bg.value) || bg.value.startsWith('system:') || bg.value === 'system-auto-color') {
      return { ...DEFAULT_BACKGROUND };
    }
    if (!findImageById(bg.value)) {
      const newId = PATH_TO_ID_MAP[bg.value] ?? ALIASED_BACKGROUND_IDS[bg.value];
      if (newId) return migrateBackground({ ...bg, value: newId });
    }
  }

  return bg;
}
