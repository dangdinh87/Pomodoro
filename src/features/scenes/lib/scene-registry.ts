export const SCENE_CATEGORIES = ['calm', 'nature', 'space', 'cozy', 'minimal'] as const;
export type SceneCategory = (typeof SCENE_CATEGORIES)[number];

export interface SceneMeta {
  id: string;
  nameKey: string;
  category: SceneCategory;
  /** Whether the scene recolours itself with the timer mode (focus / short break / long break). */
  followsMode: boolean;
  /** Brightness % applied when the scene is first picked; bright scenes start dimmer to keep the timer readable. */
  defaultBrightness: number;
  /** Time (s) used for the still frame: thumbnails and reduced-motion. Picked to look good, not at t=0. */
  stillTime: number;
  /** Internal resolution multiplier on top of devicePixelRatio; lower for heavier shaders. */
  renderScale: number;
  /** Shown while the shader loads or when WebGL is unavailable. */
  swatch: string;
  /** Shader code is split per scene so only the selected one is downloaded. */
  load: () => Promise<{ default: string }>;
}

export const SCENES: SceneMeta[] = [
  {
    id: 'aurora',
    nameKey: 'scenes.names.aurora',
    category: 'nature',
    followsMode: true,
    defaultBrightness: 100,
    stillTime: 35,
    renderScale: 0.75,
    swatch: 'linear-gradient(180deg, #1a3a5c 0%, #1f8f74 30%, #050b14 62%)',
    load: () => import('../shaders/aurora'),
  },
  {
    id: 'rain',
    nameKey: 'scenes.names.rain',
    category: 'cozy',
    followsMode: false,
    defaultBrightness: 100,
    stillTime: 25,
    renderScale: 0.6,
    swatch: 'linear-gradient(180deg, #0a0d1a 0%, #2b2438 100%)',
    load: () => import('../shaders/rain'),
  },
  {
    id: 'nebula',
    nameKey: 'scenes.names.nebula',
    category: 'space',
    followsMode: true,
    defaultBrightness: 100,
    stillTime: 60,
    renderScale: 0.7,
    swatch: 'linear-gradient(135deg, #0a0c1f 0%, #26276b 55%, #0b1330 100%)',
    load: () => import('../shaders/nebula'),
  },
  {
    id: 'sunset',
    nameKey: 'scenes.names.sunset',
    category: 'calm',
    followsMode: true,
    defaultBrightness: 80,
    stillTime: 20,
    renderScale: 0.8,
    swatch: 'linear-gradient(180deg, #2a1b4f 0%, #b24c5e 55%, #3a1e3f 100%)',
    load: () => import('../shaders/sunset'),
  },
  {
    id: 'ocean',
    nameKey: 'scenes.names.ocean',
    category: 'calm',
    followsMode: false,
    defaultBrightness: 100,
    stillTime: 35,
    renderScale: 0.8,
    swatch: 'linear-gradient(180deg, #0a1020 0%, #14233a 52%, #050a14 100%)',
    load: () => import('../shaders/ocean'),
  },
  {
    id: 'fireflies',
    nameKey: 'scenes.names.fireflies',
    category: 'nature',
    followsMode: true,
    defaultBrightness: 100,
    stillTime: 30,
    renderScale: 0.8,
    swatch: 'linear-gradient(180deg, #0a1a1a 0%, #0c2a24 60%, #04100f 100%)',
    load: () => import('../shaders/fireflies'),
  },
  {
    id: 'grain',
    nameKey: 'scenes.names.grain',
    category: 'minimal',
    followsMode: true,
    defaultBrightness: 100,
    stillTime: 20,
    renderScale: 1,
    swatch: 'linear-gradient(135deg, #1c1c22 0%, #2a2630 100%)',
    load: () => import('../shaders/grain'),
  },
  {
    id: 'snow',
    nameKey: 'scenes.names.snow',
    category: 'cozy',
    followsMode: false,
    defaultBrightness: 85,
    stillTime: 40,
    renderScale: 0.8,
    swatch: 'linear-gradient(180deg, #121b3a 0%, #2c3b5c 70%, #3c4b69 100%)',
    load: () => import('../shaders/snow'),
  },
  {
    id: 'planet',
    nameKey: 'scenes.names.planet',
    category: 'space',
    followsMode: true,
    defaultBrightness: 100,
    stillTime: 20,
    renderScale: 0.8,
    swatch: 'linear-gradient(135deg, #04060f 0%, #0a1226 60%, #2a5f8c 100%)',
    load: () => import('../shaders/planet'),
  },
];

const byId = new Map(SCENES.map((scene) => [scene.id, scene]));

export function findSceneById(id: string): SceneMeta | undefined {
  return byId.get(id);
}

export function scenesInCategory(category: SceneCategory | 'all'): SceneMeta[] {
  return category === 'all' ? SCENES : SCENES.filter((scene) => scene.category === category);
}
