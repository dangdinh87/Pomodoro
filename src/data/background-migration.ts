/**
 * Migration map: old path-based background values → new pack IDs.
 * Used once per user on first load after the refactor.
 */

export const PATH_TO_ID_MAP: Record<string, string> = {
  // System
  'system:auto-color': 'system-auto-color',
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
