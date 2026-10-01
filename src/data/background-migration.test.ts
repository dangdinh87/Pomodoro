import { describe, expect, it } from 'vitest';
import { backgroundPacks, findImageById } from './background-packs';
import { ALIASED_BACKGROUND_IDS, DEFAULT_BACKGROUND, migrateBackground, type BackgroundSettings } from './background-migration';

const photo = (value: string): BackgroundSettings => ({ type: 'image', value, opacity: 0.8, blur: 2, brightness: 90 });

describe('migrateBackground', () => {
  it('keeps the default solid scene untouched', () => {
    expect(migrateBackground(DEFAULT_BACKGROUND)).toBe(DEFAULT_BACKGROUND);
  });

  it('resets empty, none, random and null configs to the default', () => {
    expect(migrateBackground({ ...DEFAULT_BACKGROUND, type: 'none', value: '' })).toEqual(DEFAULT_BACKGROUND);
    expect(migrateBackground({ ...DEFAULT_BACKGROUND, type: 'random', value: 'x' })).toEqual(DEFAULT_BACKGROUND);
    expect(migrateBackground(null as unknown as BackgroundSettings)).toEqual(DEFAULT_BACKGROUND);
  });

  it('keeps gradients and valid photos as saved', () => {
    const gradient: BackgroundSettings = { ...DEFAULT_BACKGROUND, type: 'gradient', value: 'linear-gradient(red, blue)' };
    expect(migrateBackground(gradient)).toBe(gradient);
    const saved = photo('cyber-city');
    expect(migrateBackground(saved)).toBe(saved);
  });

  it('maps legacy paths to pack ids', () => {
    expect(migrateBackground(photo('/backgrounds/day.mp4')).value).toBe('day-chill');
    expect(migrateBackground(photo('lofi:auto')).value).toBe('day-chill');
    expect(migrateBackground(photo('/backgrounds/new/cyber-city-nope.jpg')).value).toBe('/backgrounds/new/cyber-city-nope.jpg');
  });

  it('sends removed art and the old system sentinel back to the default scene', () => {
    expect(migrateBackground(photo('travelling-3'))).toEqual(DEFAULT_BACKGROUND);
    expect(migrateBackground(photo('/backgrounds/travelling3.jpg'))).toEqual(DEFAULT_BACKGROUND);
    expect(migrateBackground(photo('system:auto-color'))).toEqual(DEFAULT_BACKGROUND);
    expect(migrateBackground(photo('system-auto-color'))).toEqual(DEFAULT_BACKGROUND);
  });

  it('redirects retired near-duplicate photos to a pack item that still exists', () => {
    for (const [oldId, newId] of Object.entries(ALIASED_BACKGROUND_IDS)) {
      expect(findImageById(oldId)).toBeUndefined();
      expect(findImageById(newId)).toBeDefined();
      expect(migrateBackground(photo(oldId)).value).toBe(newId);
    }
  });

  it('validates scenes and clamps brightness', () => {
    const scene: BackgroundSettings = { type: 'scene', value: 'aurora', opacity: 1, blur: 0, brightness: 80, motion: false };
    expect(migrateBackground(scene)).toBe(scene);
    expect(migrateBackground({ ...scene, value: 'deleted-scene' })).toEqual(DEFAULT_BACKGROUND);
    expect(migrateBackground({ ...scene, brightness: 999 }).brightness).toBe(200);
    expect(migrateBackground({ ...scene, brightness: Number.NaN }).brightness).toBe(100);
  });

  it('every pack item resolves', () => {
    for (const pack of backgroundPacks) for (const item of pack.items) expect(findImageById(item.id)).toBe(item);
  });
});
