import { describe, expect, it } from 'vitest';
import { findSceneById, SCENE_CATEGORIES, SCENES, scenesInCategory } from './scene-registry';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';

describe('scene registry', () => {
  it('has unique ids and a lookup for each', () => {
    const ids = SCENES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const scene of SCENES) expect(findSceneById(scene.id)).toBe(scene);
    expect(findSceneById('nope')).toBeUndefined();
  });

  it('only uses known categories and keeps every category non-empty', () => {
    for (const scene of SCENES) expect(SCENE_CATEGORIES).toContain(scene.category);
    for (const c of SCENE_CATEGORIES) expect(scenesInCategory(c).length).toBeGreaterThan(0);
    expect(scenesInCategory('all')).toHaveLength(SCENES.length);
  });

  it('keeps sane render settings', () => {
    for (const s of SCENES) {
      expect(s.renderScale).toBeGreaterThan(0);
      expect(s.renderScale).toBeLessThanOrEqual(1);
      expect(s.defaultBrightness).toBeGreaterThanOrEqual(20);
      expect(s.defaultBrightness).toBeLessThanOrEqual(130);
    }
  });

  it('has a loadable shader that defines scene()', async () => {
    for (const s of SCENES) {
      const mod = await s.load();
      expect(mod.default).toContain('vec3 scene(vec2 uv, vec2 p, float t)');
    }
  });

  it('has i18n for every scene and category in all three languages', () => {
    const lookup = (dict: unknown, key: string) =>
      key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dict);
    for (const [lang, dict] of Object.entries({ en, vi, ja })) {
      for (const s of SCENES) expect(lookup(dict, s.nameKey), `${lang} ${s.nameKey}`).toBeTruthy();
      for (const c of ['all', ...SCENE_CATEGORIES]) expect(lookup(dict, `scenes.categories.${c}`)).toBeTruthy();
    }
  });
});
