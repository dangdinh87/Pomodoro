// @vitest-environment node
import { statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { builtInPresets } from '@/data/sound-presets';
import {
  alarmSounds,
  allAmbientSounds,
  hiddenAmbientSounds,
  soundCategories,
} from '@/lib/audio/sound-catalog';

/**
 * Guards the "silent placeholder" bug: nine sounds shipped as copies of silence.mp3
 * (36 710 bytes, -84 dB), so presets looked like they were playing but made no noise.
 * A real loop is always well above 50 KB.
 */
const MIN_BYTES = 50 * 1024;
const PUBLIC_DIR = path.join(process.cwd(), 'public');

function fileSize(url: string): number | null {
  try {
    return statSync(path.join(PUBLIC_DIR, url)).size;
  } catch {
    return null;
  }
}

describe('sound assets', () => {
  const ambient = allAmbientSounds();

  it.each(ambient.map((s) => [s.id, s.url] as const))('ambient "%s" is a real audio file', (_id, url) => {
    const size = fileSize(url);
    expect(size, `${url} is missing`).not.toBeNull();
    expect(size!, `${url} looks like a silent placeholder`).toBeGreaterThanOrEqual(MIN_BYTES);
  });

  it.each(alarmSounds.map((s) => [s.id, s.url] as const))('alarm "%s" is a real audio file', (_id, url) => {
    const size = fileSize(url);
    expect(size, `${url} is missing`).not.toBeNull();
    expect(size!, `${url} looks like a silent placeholder`).toBeGreaterThanOrEqual(MIN_BYTES);
  });

  it('hides the nine silent placeholders from every listing', () => {
    const hidden = hiddenAmbientSounds.map((s) => s.id).sort();
    expect(hidden).toEqual(
      [
        'birds',
        'cat-purring',
        'coffee-shop',
        'coworking',
        'fireplace',
        'library',
        'night-crickets',
        'pink-noise',
        'white-noise',
      ].sort(),
    );
    const listed = new Set(soundCategories.flatMap((c) => c.sounds.map((s) => s.id)));
    for (const id of hidden) {
      expect(listed.has(id), `${id} is still listed in the mixer`).toBe(false);
      expect(ambient.some((s) => s.id === id), `${id} is still resolvable`).toBe(false);
    }
  });

  it('keeps ids unique and drops categories that end up empty', () => {
    const ids = ambient.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const category of soundCategories) expect(category.sounds.length).toBeGreaterThan(0);
  });
});

describe('built-in presets', () => {
  const known = new Set(allAmbientSounds().map((s) => s.id));

  it.each(builtInPresets.map((p) => [p.id, p] as const))('"%s" only uses sounds that exist and are audible', (_id, preset) => {
    expect(preset.sounds.length).toBeGreaterThan(0);
    for (const sound of preset.sounds) {
      expect(known.has(sound.id), `${preset.id} uses unknown or hidden sound "${sound.id}"`).toBe(true);
      expect(sound.volume).toBeGreaterThan(0);
    }
  });
});
