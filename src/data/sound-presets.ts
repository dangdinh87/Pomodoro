import { SoundPreset } from '@/stores/audio-store'

/**
 * Built-in ambient sound presets
 *
 * Note: Some presets reference sounds with placeholder files (coffee-shop, library,
 * cat-purring, brown-noise). These will be added in Phase 7. The loadPreset action
 * implements graceful skip for missing/failed sounds.
 */
export const builtInPresets: SoundPreset[] = [
  {
    id: 'cafe',
    name: 'Cafe',
    icon: '☕',
    sounds: [
      { id: 'coffee-shop', volume: 50 },
      { id: 'keyboard', volume: 25 },
    ],
    isBuiltIn: true,
  },
  {
    id: 'rain',
    name: 'Rain',
    icon: '🌧️',
    sounds: [
      { id: 'light-rain', volume: 60 },
      { id: 'thunder', volume: 20 },
    ],
    isBuiltIn: true,
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌳',
    sounds: [
      { id: 'wind-in-trees', volume: 45 },
      { id: 'river', volume: 35 },
      { id: 'droplets', volume: 25 },
    ],
    isBuiltIn: true,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: '🌊',
    sounds: [
      { id: 'waves', volume: 55 },
      { id: 'wind', volume: 30 },
    ],
    isBuiltIn: true,
  },
  {
    id: 'train-ride',
    name: 'Train Ride',
    icon: '🚂',
    sounds: [
      { id: 'inside-a-train', volume: 50 },
      { id: 'light-rain', volume: 25 },
    ],
    isBuiltIn: true,
  },
  {
    id: 'night',
    name: 'Night',
    icon: '🌙',
    sounds: [
      { id: 'campfire', volume: 45 },
      { id: 'rain-on-leaves', volume: 30 },
      { id: 'wind', volume: 15 },
    ],
    isBuiltIn: true,
  },
  {
    id: 'library',
    name: 'Library',
    icon: '📚',
    sounds: [
      { id: 'library', volume: 50 },
      { id: 'clock', volume: 15 },
    ],
    isBuiltIn: true,
  },
  {
    id: 'cozy',
    name: 'Cozy',
    icon: '🐱',
    sounds: [
      { id: 'cat-purring', volume: 40 },
      { id: 'campfire', volume: 35 },
      { id: 'vinyl-effect', volume: 20 },
    ],
    isBuiltIn: true,
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    icon: '🧠',
    sounds: [
      { id: 'brown-noise', volume: 60 },
    ],
    isBuiltIn: true,
  },
]
