/**
 * Photo / video packs (the "Photos" group of the scene picker). Images reference build-generated assets.
 * Animated procedural scenes live in features/scenes; the default "Pomodoro" scene is a solid tint.
 */

export interface BackgroundImage {
  id: string;
  nameKey: string;
  kind: 'video' | 'image';
  /** Thumbnail WebP path for picker (400w) */
  thumb?: string;
  /** Full-size sources (1920w) */
  sources?: { avif: string; webp: string };
  /** Video path */
  value?: string;
}

export interface BackgroundPack {
  id: string;
  nameKey: string;
  /** i18n key for the pack description shown above the grid */
  descriptionKey?: string;
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
    id: 'room',
    nameKey: 'settings.background.packs.room',
    descriptionKey: 'settings.background.packDescriptions.room',
    items: [
      img('cyberpunk-scene-1', 'settings.background.presets.sunlitStudyRoom'),
      img('anime-cozy-home-1', 'settings.background.presets.goldenHourHome'),
      img('anime-cozy-home-2', 'settings.background.presets.cozyLivingSpace'),
      img('cozy-anime-interior', 'settings.background.presets.quietNightBedroom'),
      img('cozy-room-sunset', 'settings.background.presets.sunsetWorkspace'),
      img('beautiful-office-space-cartoon-style', 'settings.background.presets.beautifulOfficeSpace'),
      img('international-day-education-scene-with-fantasy-style', 'settings.background.presets.studyTogether'),
      img('work-team-digital-art', 'settings.background.presets.teamWorkspace'),
      img('night-light', 'settings.background.presets.nightLight'),
    ],
  },
  {
    id: 'fantasy',
    nameKey: 'settings.background.packs.fantasy',
    descriptionKey: 'settings.background.packDescriptions.fantasy',
    items: [
      img('cyberpunk-scene-2', 'settings.background.presets.enchantedForest'),
      img('fantasy-adventurers-1', 'settings.background.presets.fantasyAdventurers'),
      img('fantasy-house-moon-illustration', 'settings.background.presets.fantasyHouseMoon'),
      img('cityscape-anime-inspired-urban-area', 'settings.background.presets.cityscapeAnimeUrban'),
    ],
  },
  {
    id: 'cyberpunk',
    nameKey: 'settings.background.packs.cyberpunk',
    descriptionKey: 'settings.background.packDescriptions.cyberpunk',
    items: [
      img('futuristic-city-abstract', 'settings.background.presets.abstractFuturisticCity'),
      img('cyber-city', 'settings.background.presets.cyberCity'),
      img('futuristic-city-night', 'settings.background.presets.futuristicCityNight'),
    ],
  },
  {
    id: 'lofi-video',
    nameKey: 'settings.background.packs.lofiVideo',
    descriptionKey: 'settings.background.packDescriptions.lofiVideo',
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
