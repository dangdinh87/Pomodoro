/**
 * Pack-based background data model.
 * 7 packs, 31 items total. Images reference build-generated assets.
 */

export interface BackgroundImage {
  id: string;
  nameKey: string;
  kind: 'system' | 'auto' | 'video' | 'image';
  /** Thumbnail WebP path for picker (400w) */
  thumb?: string;
  /** Full-size sources (1920w) */
  sources?: { avif: string; webp: string };
  /** Sentinel value for system/auto, or video path */
  value?: string;
}

export interface BackgroundPack {
  id: string;
  nameKey: string;
  /** Optional i18n key for pack description (shown under tab) */
  descriptionKey?: string;
  icon: string;
  items: BackgroundImage[];
}

// Helper to build image entry with standard paths
function img(id: string, nameKey: string): BackgroundImage {
  return {
    id,
    nameKey,
    kind: 'image',
    thumb: `/backgrounds/thumb/${id}.webp`,
    sources: {
      avif: `/backgrounds/full/${id}.avif`,
      webp: `/backgrounds/full/${id}.webp`,
    },
  };
}

export const backgroundPacks: BackgroundPack[] = [
  {
    id: 'system',
    nameKey: 'settings.background.packs.system',
    descriptionKey: 'settings.background.packDescriptions.system',
    icon: '⚙️',
    items: [
      {
        id: 'system-auto-color',
        nameKey: 'settings.background.presets.systemSolidColor',
        kind: 'system',
        value: 'system:auto-color',
      },
      img('night-light', 'settings.background.presets.nightLight'),
    ],
  },
  {
    id: 'fantasy',
    nameKey: 'settings.background.packs.fantasy',
    descriptionKey: 'settings.background.packDescriptions.fantasy',
    icon: '⚔️',
    items: [
      img('cyberpunk-scene-2', 'settings.background.presets.enchantedForest'),
      img('fantasy-adventurers-1', 'settings.background.presets.fantasyAdventurers'),
      img('fantasy-adventurers-2', 'settings.background.presets.fantasyAdventurers1'),
      img('fantasy-adventurers-3', 'settings.background.presets.fantasyAdventurers2'),
      img('fantasy-adventurers-4', 'settings.background.presets.fantasyAdventurers3'),
      img('fantasy-adventurers-5', 'settings.background.presets.fantasyAdventurers4'),
    ],
  },
  {
    id: 'lofi-video',
    nameKey: 'settings.background.packs.lofiVideo',
    descriptionKey: 'settings.background.packDescriptions.lofiVideo',
    icon: '🎬',
    items: [
      {
        id: 'day-chill',
        nameKey: 'settings.background.presets.lofiDay',
        kind: 'video',
        value: '/backgrounds/day.mp4',
      },
      {
        id: 'night-chill',
        nameKey: 'settings.background.presets.lofiNight',
        kind: 'video',
        value: '/backgrounds/night.mp4',
      },
    ],
  },
  {
    id: 'classic',
    nameKey: 'settings.background.packs.classic',
    descriptionKey: 'settings.background.packDescriptions.classic',
    icon: '🖼️',
    items: [
      img('landscape-cartoon', 'settings.background.presets.background1'),
      img('chill-shiba', 'settings.background.presets.chillShiba'),
      img('study-desk', 'settings.background.presets.studyDesk1'),
    ],
  },
  {
    id: 'cyberpunk',
    nameKey: 'settings.background.packs.cyberpunk',
    descriptionKey: 'settings.background.packDescriptions.cyberpunk',
    icon: '🌃',
    items: [
      img('futuristic-city-abstract', 'settings.background.presets.abstractFuturisticCity'),
      img('cyber-city', 'settings.background.presets.cyberCity'),
      img('futuristic-city-night', 'settings.background.presets.futuristicCityNight'),
    ],
  },
  {
    id: 'anime-cozy',
    nameKey: 'settings.background.packs.animeCozy',
    descriptionKey: 'settings.background.packDescriptions.animeCozy',
    icon: '🏠',
    items: [
      img('cyberpunk-scene-1', 'settings.background.presets.cozyAnimeStudy'),
      img('anime-cozy-home-1', 'settings.background.presets.animeCozyHome'),
      img('anime-cozy-home-2', 'settings.background.presets.animeCozyHome1'),
      img('cozy-anime-interior', 'settings.background.presets.cozyAnimeInterior'),
      img('cozy-room-sunset', 'settings.background.presets.cozyRoomSunset'),
    ],
  },
  {
    id: 'travelling',
    nameKey: 'settings.background.packs.travelling',
    descriptionKey: 'settings.background.packDescriptions.travelling',
    icon: '✈️',
    items: [
      img('travelling-1', 'settings.background.presets.travelling1'),
      img('travelling-2', 'settings.background.presets.travelling2'),
      img('travelling-3', 'settings.background.presets.travelling3'),
      img('travelling-4', 'settings.background.presets.travelling4'),
      img('travelling-5', 'settings.background.presets.travelling5'),
      img('travelling-6', 'settings.background.presets.travelling6'),
      img('travelling-7', 'settings.background.presets.travelling7'),
      img('travelling-8', 'settings.background.presets.travelling8'),
      img('travelling-9', 'settings.background.presets.travelling9'),
    ],
  },
];

// Flat lookup cache (built lazily)
let _imageMap: Map<string, BackgroundImage> | null = null;

function getImageMap(): Map<string, BackgroundImage> {
  if (!_imageMap) {
    _imageMap = new Map();
    for (const pack of backgroundPacks) {
      for (const item of pack.items) {
        _imageMap.set(item.id, item);
      }
    }
  }
  return _imageMap;
}

export function findImageById(id: string): BackgroundImage | undefined {
  return getImageMap().get(id);
}

export function getAllImages(): BackgroundImage[] {
  return backgroundPacks.flatMap((p) => p.items);
}

export function getPackById(id: string): BackgroundPack | undefined {
  return backgroundPacks.find((p) => p.id === id);
}
