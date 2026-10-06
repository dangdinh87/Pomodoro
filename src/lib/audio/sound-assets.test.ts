// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
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
// Alarms are 1.5-3 s clips (about 25-45 KB), so they get a lower floor; the silent placeholder
// is also caught by the hash checks below.
const MIN_ALARM_BYTES = 10 * 1024;
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SILENCE_URL = '/sounds/silence.mp3';

function fileSize(url: string): number | null {
  try {
    return statSync(path.join(PUBLIC_DIR, url)).size;
  } catch {
    return null;
  }
}

function fileHash(url: string): string {
  return createHash('sha256').update(readFileSync(path.join(PUBLIC_DIR, url))).digest('hex');
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
    expect(size!, `${url} looks like a silent placeholder`).toBeGreaterThanOrEqual(MIN_ALARM_BYTES);
    expect(fileHash(url), `${url} is a copy of silence.mp3`).not.toBe(fileHash(SILENCE_URL));
  });

  // The bell picker offers one choice per file; five identical copies shipped once, so the
  // picker looked like a choice and sounded like none.
  it('gives every alarm its own audio file', () => {
    const byHash = new Map<string, string[]>();
    for (const alarm of alarmSounds) {
      const hash = fileHash(alarm.url);
      byHash.set(hash, [...(byHash.get(hash) ?? []), alarm.id]);
    }
    const copies = [...byHash.values()].filter((ids) => ids.length > 1);
    expect(copies, `alarms with identical files: ${JSON.stringify(copies)}`).toEqual([]);
    expect(new Set(alarmSounds.map((a) => a.url)).size).toBe(alarmSounds.length);
  });

  it('keeps listed ambient sounds from being copies of one another', () => {
    const byHash = new Map<string, string[]>();
    for (const sound of ambient) {
      const hash = fileHash(sound.url);
      byHash.set(hash, [...(byHash.get(hash) ?? []), sound.id]);
    }
    const copies = [...byHash.values()].filter((ids) => ids.length > 1);
    expect(copies, `ambient sounds with identical files: ${JSON.stringify(copies)}`).toEqual([]);
  });

  it('lists the generated noises', () => {
    const ids = allAmbientSounds().map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(['white-noise', 'pink-noise', 'brown-noise']));
  });

  it('hides the seven placeholders still waiting for a real recording from every listing', () => {
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
