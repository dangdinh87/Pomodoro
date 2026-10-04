'use client';

export type SoundCategory =
  | 'nature'
  | 'rain'
  | 'noise'
  | 'study'
  | 'cozy'
  | 'transport'
  | 'city'
  | 'machine';

export interface SoundItem {
  id: string;
  category: SoundCategory;
  label: string;
  vn?: string;
  icon: string; // emoji
  url: string;
  /**
   * The mp3 is a silent placeholder (a copy of silence.mp3), so the sound is kept out of
   * every listing and out of the lookup. Drop the flag once a real recording replaces the file.
   */
  hidden?: boolean;
}

export interface AlarmItem {
  id: string;
  label: string;
  vn?: string;
  url: string;
}

// All ambient sound categories
const nature: SoundItem[] = [
  {
    id: 'campfire',
    category: 'nature',
    label: 'Campfire',
    vn: 'Lửa trại',
    icon: '🔥',
    url: '/sounds/nature/campfire.mp3',
  },
  {
    id: 'droplets',
    category: 'nature',
    label: 'Droplets',
    vn: 'Giọt nước',
    icon: '💧',
    url: '/sounds/nature/droplets.mp3',
  },
  {
    id: 'river',
    category: 'nature',
    label: 'River',
    vn: 'Dòng sông',
    icon: '🌊',
    url: '/sounds/nature/river.mp3',
  },
  {
    id: 'waves',
    category: 'nature',
    label: 'Waves',
    vn: 'Sóng biển',
    icon: '🏖️',
    url: '/sounds/nature/waves.mp3',
  },
  {
    id: 'wind-in-trees',
    category: 'nature',
    label: 'Wind in Trees',
    vn: 'Gió rừng',
    icon: '🍃',
    url: '/sounds/nature/wind-in-trees.mp3',
  },
  {
    id: 'wind',
    category: 'nature',
    label: 'Wind',
    vn: 'Tiếng gió',
    icon: '🌬️',
    url: '/sounds/nature/wind.mp3',
  },
  {
    id: 'birds',
    category: 'nature',
    label: 'Birds',
    vn: 'Chim hót',
    icon: '🐦',
    url: '/sounds/nature/birds.mp3',
    hidden: true,
  },
  {
    id: 'night-crickets',
    category: 'nature',
    label: 'Night Crickets',
    vn: 'Dế đêm',
    icon: '🦗',
    url: '/sounds/nature/night-crickets.mp3',
    hidden: true,
  },
  {
    id: 'fireplace',
    category: 'nature',
    label: 'Fireplace',
    vn: 'Lò sưởi',
    icon: '🪵',
    url: '/sounds/nature/fireplace.mp3',
    hidden: true,
  },
];

const rain: SoundItem[] = [
  {
    id: 'heavy-rain',
    category: 'rain',
    label: 'Heavy Rain',
    vn: 'Mưa rào',
    icon: '⛈️',
    url: '/sounds/rain/heavy-rain.mp3',
  },
  {
    id: 'light-rain',
    category: 'rain',
    label: 'Light Rain',
    vn: 'Mưa nhỏ',
    icon: '🌧️',
    url: '/sounds/rain/light-rain.mp3',
  },
  {
    id: 'rain-on-leaves',
    category: 'rain',
    label: 'Rain on Leaves',
    vn: 'Mưa trên lá',
    icon: '🌿',
    url: '/sounds/rain/rain-on-leaves.mp3',
  },
  {
    id: 'rain-on-window',
    category: 'rain',
    label: 'Rain on Window',
    vn: 'Mưa bên cửa sổ',
    icon: '🪟',
    url: '/sounds/rain/rain-on-window.mp3',
  },
  {
    id: 'thunder',
    category: 'rain',
    label: 'Thunder',
    vn: 'Sấm sét',
    icon: '⚡',
    url: '/sounds/rain/thunder.mp3',
  },
];

const noise: SoundItem[] = [
  {
    id: 'white-noise',
    category: 'noise',
    label: 'White Noise',
    vn: 'Tiếng ồn trắng',
    icon: '⚪',
    url: '/sounds/noise/white-noise.mp3',
  },
  {
    id: 'brown-noise',
    category: 'noise',
    label: 'Brown Noise',
    vn: 'Tiếng ồn nâu',
    icon: '🟤',
    url: '/sounds/noise/brown-noise.mp3',
  },
  {
    id: 'pink-noise',
    category: 'noise',
    label: 'Pink Noise',
    vn: 'Tiếng ồn hồng',
    icon: '🧠',
    url: '/sounds/noise/pink-noise.mp3',
  },
];

const study: SoundItem[] = [
  {
    id: 'library',
    category: 'study',
    label: 'Library',
    vn: 'Thư viện',
    icon: '📚',
    url: '/sounds/study/library.mp3',
    hidden: true,
  },
  {
    id: 'coffee-shop',
    category: 'study',
    label: 'Coffee Shop',
    vn: 'Quán cà phê',
    icon: '☕',
    url: '/sounds/study/coffee-shop.mp3',
    hidden: true,
  },
  {
    id: 'coworking',
    category: 'study',
    label: 'Coworking',
    vn: 'Văn phòng',
    icon: '🏢',
    url: '/sounds/study/coworking.mp3',
    hidden: true,
  },
];

const cozy: SoundItem[] = [
  {
    id: 'clock',
    category: 'cozy',
    label: 'Clock',
    vn: 'Đồng hồ',
    icon: '🕰️',
    url: '/sounds/cozy/clock.mp3',
  },
  {
    id: 'singing-bowl',
    category: 'cozy',
    label: 'Singing Bowl',
    vn: 'Chuông xoay',
    icon: '🥣',
    url: '/sounds/cozy/singing-bowl.mp3',
  },
  {
    id: 'vinyl-effect',
    category: 'cozy',
    label: 'Vinyl',
    vn: 'Đĩa than',
    icon: '📻',
    url: '/sounds/cozy/vinyl-effect.mp3',
  },
  {
    id: 'wind-chimes',
    category: 'cozy',
    label: 'Wind Chimes',
    vn: 'Chuông gió',
    icon: '🎐',
    url: '/sounds/cozy/wind-chimes.mp3',
  },
  {
    id: 'cat-purring',
    category: 'cozy',
    label: 'Cat Purring',
    vn: 'Mèo kêu',
    icon: '🐱',
    url: '/sounds/cozy/cat-purring.mp3',
    hidden: true,
  },
];

const transport: SoundItem[] = [
  {
    id: 'airplane',
    category: 'transport',
    label: 'Airplane',
    vn: 'Máy bay',
    icon: '🛫',
    url: '/sounds/transport/airplane.mp3',
  },
  {
    id: 'inside-a-train',
    category: 'transport',
    label: 'Inside Train',
    vn: 'Trong tàu hỏa',
    icon: '🚄',
    url: '/sounds/transport/inside-a-train.mp3',
  },
  {
    id: 'submarine',
    category: 'transport',
    label: 'Submarine',
    vn: 'Tàu ngầm',
    icon: '⚓',
    url: '/sounds/transport/submarine.mp3',
  },
  {
    id: 'train',
    category: 'transport',
    label: 'Train',
    vn: 'Đường sắt',
    icon: '🛤️',
    url: '/sounds/transport/train.mp3',
  },
];

const city: SoundItem[] = [
  {
    id: 'busy-street',
    category: 'city',
    label: 'Busy Street',
    vn: 'Phố xá',
    icon: '🏙️',
    url: '/sounds/city/busy-street.mp3',
  },
  {
    id: 'crowd',
    category: 'city',
    label: 'Crowd',
    vn: 'Đám đông',
    icon: '🗣️',
    url: '/sounds/city/crowd.mp3',
  },
  {
    id: 'traffic',
    category: 'city',
    label: 'Traffic',
    vn: 'Xe cộ',
    icon: '🚦',
    url: '/sounds/city/traffic.mp3',
  },
];

const machine: SoundItem[] = [
  {
    id: 'ceiling-fan',
    category: 'machine',
    label: 'Ceiling Fan',
    vn: 'Quạt trần',
    icon: '☢️',
    url: '/sounds/machine/ceiling-fan.mp3',
  },
  {
    id: 'keyboard',
    category: 'machine',
    label: 'Keyboard',
    vn: 'Gõ phím',
    icon: '⌨️',
    url: '/sounds/machine/keyboard.mp3',
  },
  {
    id: 'typewriter',
    category: 'machine',
    label: 'Typewriter',
    vn: 'Máy đánh chữ',
    icon: '📠',
    url: '/sounds/machine/typewriter.mp3',
  },
];

// Category definitions with display order (hidden sounds included; filtered below)
const allCategories: {
  key: SoundCategory;
  label: string;
  vn: string;
  sounds: SoundItem[];
}[] = [
  { key: 'nature', label: 'Nature', vn: 'Thiên nhiên', sounds: nature },
  { key: 'rain', label: 'Rain', vn: 'Mưa', sounds: rain },
  { key: 'noise', label: 'Noise', vn: 'Tiếng ồn', sounds: noise },
  { key: 'study', label: 'Study', vn: 'Học tập', sounds: study },
  { key: 'cozy', label: 'Cozy', vn: 'Ấm cúng', sounds: cozy },
  {
    key: 'transport',
    label: 'Transport',
    vn: 'Phương tiện',
    sounds: transport,
  },
  { key: 'city', label: 'City', vn: 'Thành phố', sounds: city },
  { key: 'machine', label: 'Machine', vn: 'Máy móc', sounds: machine },
];

// What the mixer lists: playable sounds only, and no empty categories
export const soundCategories = allCategories
  .map((c) => ({ ...c, sounds: c.sounds.filter((s) => !s.hidden) }))
  .filter((c) => c.sounds.length > 0);

// Placeholders waiting for a real recording (see SoundItem.hidden)
export const hiddenAmbientSounds: ReadonlyArray<SoundItem> = allCategories.flatMap((c) =>
  c.sounds.filter((s) => s.hidden),
);

// Alarm sounds. Each file is synthesized by scripts/generate-alarm-sounds.sh and must stay
// different from the others (guarded by sound-assets.test.ts).
export const alarmSounds: AlarmItem[] = [
  { id: 'bell', label: 'Bell', vn: 'Chuông', url: '/sounds/alarms/bell.mp3' },
  {
    id: 'chime',
    label: 'Chime',
    vn: 'Chuông nhẹ',
    url: '/sounds/alarms/chime.mp3',
  },
  {
    id: 'digital',
    label: 'Digital',
    vn: 'Kỹ thuật số',
    url: '/sounds/alarms/digital.mp3',
  },
  {
    id: 'wood',
    label: 'Wood',
    vn: 'Mõ gỗ',
    url: '/sounds/alarms/wood.mp3',
  },
  {
    id: 'kitchen',
    label: 'Kitchen timer',
    vn: 'Đồng hồ bếp',
    url: '/sounds/alarms/kitchen.mp3',
  },
];

/** `alarmType` value that turns the bell off. */
export const ALARM_NONE = 'none';

const DEFAULT_ALARM = 'bell';

// Ids saved by earlier versions, mapped to the closest sound that replaced them
const legacyAlarmIds: Readonly<Record<string, string>> = {
  gong: 'bell',
  soft: 'chime',
};

/**
 * The stored `alarmType` as an id the picker and the player know: ids from earlier versions
 * (gong, soft) map to their replacement, anything unknown becomes the bell.
 */
export function resolveAlarmType(alarmType: string): string {
  if (alarmType === ALARM_NONE) return ALARM_NONE;
  const id = legacyAlarmIds[alarmType] ?? alarmType;
  return alarmSounds.some((a) => a.id === id) ? id : DEFAULT_ALARM;
}

// Backward-compatible: flat catalog object for existing code
// soundCatalog.ambient returns all ambient sounds as flat array
export const soundCatalog = {
  get ambient(): ReadonlyArray<SoundItem> {
    return soundCategories.flatMap((c) => c.sounds);
  },
  alarms: alarmSounds,
} as const;

// Helper functions
export function allAmbientSounds(): ReadonlyArray<SoundItem> {
  return soundCategories.flatMap((c) => c.sounds);
}

export function getCategory(category: SoundCategory): ReadonlyArray<SoundItem> {
  return soundCategories.find((c) => c.key === category)?.sounds ?? [];
}

export function findSound(id: string): SoundItem | undefined {
  return allAmbientSounds().find((s) => s.id === id);
}
