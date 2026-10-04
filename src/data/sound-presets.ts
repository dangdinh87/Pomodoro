import { SoundPreset } from '@/stores/audio-store'

/**
 * Built-in ambient sound presets
 *
 * Every preset is built only from sounds that exist in the catalog and have a real
 * recording (sound-assets.test.ts enforces both). Cafe, Library and Cozy were once built
 * on silent placeholders and are recomposed from audible sounds. loadPreset still skips
 * any id it cannot resolve, so old saved mixes never break.
 */
export const builtInPresets: SoundPreset[] = [
  {
    id: 'cafe',
    name: 'Cafe',
    icon: '☕',
    sounds: [
      { id: 'crowd', volume: 60 },
      { id: 'keyboard', volume: 20 },
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
      { id: 'ceiling-fan', volume: 60 },
      { id: 'clock', volume: 25 },
    ],
    isBuiltIn: true,
  },
  {
    id: 'cozy',
    name: 'Cozy',
    icon: '🛋️',
    sounds: [
      { id: 'campfire', volume: 35 },
      { id: 'rain-on-window', volume: 30 },
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
