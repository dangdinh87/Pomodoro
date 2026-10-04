import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { installMemoryStorage } from '@/test-utils/memory-storage';

const manager = vi.hoisted(() => {
  const active = new Set<string>();
  return {
    active,
    failIds: new Set<string>(),
    delayMs: 0,
    playAmbient: vi.fn(),
    stopAmbient: vi.fn(),
    stopAllAmbient: vi.fn(),
    isAmbientActive: vi.fn(),
    setAmbientVolume: vi.fn(),
    setVolume: vi.fn(),
    setMute: vi.fn(),
    pause: vi.fn(async () => {}),
    resume: vi.fn(async () => {}),
  };
});

vi.mock('@/lib/audio/audio-manager', () => ({ audioManager: manager, default: manager }));

import { useAudioStore, sanitizeAmbientMix } from '@/stores/audio-store';
import { soundCatalog } from '@/lib/audio/sound-catalog';

const [A, B, C] = soundCatalog.ambient.map((s) => s.id);
const KEY = 'audio-storage-v2';

function seed(state: Record<string, unknown>) {
  window.localStorage.setItem(KEY, JSON.stringify({ state, version: 3 }));
}

beforeEach(() => {
  installMemoryStorage();
  vi.clearAllMocks();
  manager.active.clear();
  manager.failIds.clear();
  manager.delayMs = 0;
  manager.playAmbient.mockImplementation(async (source: { id: string }) => {
    if (manager.delayMs) await new Promise((r) => setTimeout(r, manager.delayMs));
    if (manager.failIds.has(source.id)) return false;
    manager.active.add(source.id);
    return true;
  });
  manager.stopAmbient.mockImplementation(async (id: string) => void manager.active.delete(id));
  manager.stopAllAmbient.mockImplementation(async () => manager.active.clear());
  manager.isAmbientActive.mockImplementation((id: string) => manager.active.has(id));
  useAudioStore.persist.setOptions({ storage: createJSONStorage(() => window.localStorage) });
  useAudioStore.setState({
    activeAmbientSounds: [],
    currentlyPlaying: null,
    ambientRestore: 'none',
    audioSettings: { ...useAudioStore.getState().audioSettings, masterVolume: 50, isMuted: false },
  });
});

describe('sanitizeAmbientMix', () => {
  it('keeps known sounds with clamped, rounded volumes and drops the rest', () => {
    expect(
      sanitizeAmbientMix([
        { id: A, volume: 40 },
        { id: B, volume: 250 },
        { id: C, volume: 0 }, // 0% is "off"
        { id: 'removed-sound', volume: 50 },
        { id: A, volume: 10 }, // duplicate id
        { id: B },
        null,
        'x',
      ]),
    ).toEqual([
      { id: A, volume: 40 },
      { id: B, volume: 100 },
    ]);
  });

  it('survives a corrupted payload', () => {
    expect(sanitizeAmbientMix(undefined)).toEqual([]);
    expect(sanitizeAmbientMix('nope')).toEqual([]);
    expect(sanitizeAmbientMix({})).toEqual([]);
  });
});

describe('ambient mix survives a reload', () => {
  it('persists the active mix and whether it was paused', async () => {
    await useAudioStore.getState().playAmbient(A, 30);
    await useAudioStore.getState().playAmbient(B, 70);

    const saved = JSON.parse(window.localStorage.getItem(KEY)!);
    expect(saved.state.activeAmbientSounds).toEqual([
      { id: A, volume: 30 },
      { id: B, volume: 70 },
    ]);
    expect(saved.state.ambientPaused).toBe(false);

    useAudioStore.getState().updatePlayingStatus(false);
    expect(JSON.parse(window.localStorage.getItem(KEY)!).state.ambientPaused).toBe(true);
    // runtime-only fields never reach storage
    expect(saved.state).not.toHaveProperty('currentlyPlaying');
    expect(saved.state).not.toHaveProperty('ambientRestore');
  });

  it('restores the sliders on rehydrate but creates no player yet (autoplay policy)', async () => {
    seed({
      activeAmbientSounds: [
        { id: A, volume: 30 },
        { id: 'removed-sound', volume: 50 },
      ],
      audioSettings: { masterVolume: 80, isMuted: false },
    });
    await useAudioStore.persist.rehydrate();

    const s = useAudioStore.getState();
    expect(s.activeAmbientSounds).toEqual([{ id: A, volume: 30 }]);
    expect(s.ambientRestore).toBe('autoplay');
    expect(manager.playAmbient).not.toHaveBeenCalled();
  });

  it('a mix that was paused is restored as paused, an empty mix as nothing to restore', async () => {
    seed({ activeAmbientSounds: [{ id: A, volume: 30 }], ambientPaused: true });
    await useAudioStore.persist.rehydrate();
    expect(useAudioStore.getState().ambientRestore).toBe('paused');

    seed({ activeAmbientSounds: [] });
    await useAudioStore.persist.rehydrate();
    expect(useAudioStore.getState().ambientRestore).toBe('none');
    expect(useAudioStore.getState().activeAmbientSounds).toEqual([]);
  });

  it('applies the saved master volume and mute to the audio manager', async () => {
    seed({ audioSettings: { masterVolume: 35, isMuted: true } });
    await useAudioStore.persist.rehydrate();

    expect(manager.setVolume).toHaveBeenCalledWith(35);
    expect(manager.setMute).toHaveBeenCalledWith(true);
  });

  it('startRestoredAmbient plays every restored sound once at its saved volume', async () => {
    seed({
      activeAmbientSounds: [
        { id: A, volume: 30 },
        { id: B, volume: 70 },
      ],
    });
    await useAudioStore.persist.rehydrate();

    await expect(useAudioStore.getState().startRestoredAmbient()).resolves.toBe(true);

    expect(manager.playAmbient).toHaveBeenCalledTimes(2);
    expect(manager.playAmbient).toHaveBeenCalledWith(expect.objectContaining({ id: A, volume: 30 }));
    expect(manager.playAmbient).toHaveBeenCalledWith(expect.objectContaining({ id: B, volume: 70 }));
    const s = useAudioStore.getState();
    expect(s.activeAmbientSounds).toEqual([
      { id: A, volume: 30 },
      { id: B, volume: 70 },
    ]); // no duplicates
    expect(s.ambientRestore).toBe('none');
    expect(s.currentlyPlaying).toMatchObject({ id: 'mixed-ambient', count: 2, isPlaying: true });
  });

  it('two gestures in a row start the mix only once', async () => {
    seed({ activeAmbientSounds: [{ id: A, volume: 30 }] });
    await useAudioStore.persist.rehydrate();
    manager.delayMs = 5;

    await Promise.all([
      useAudioStore.getState().startRestoredAmbient(),
      useAudioStore.getState().startRestoredAmbient(),
    ]);

    expect(manager.playAmbient).toHaveBeenCalledTimes(1);
  });

  it('a paused mix does not start by itself but does on explicit play', async () => {
    seed({ activeAmbientSounds: [{ id: A, volume: 30 }], ambientPaused: true });
    await useAudioStore.persist.rehydrate();

    await expect(useAudioStore.getState().startRestoredAmbient()).resolves.toBe(true);
    expect(manager.playAmbient).not.toHaveBeenCalled();
    expect(useAudioStore.getState().ambientRestore).toBe('paused');

    await useAudioStore.getState().togglePlayPause();
    expect(manager.playAmbient).toHaveBeenCalledTimes(1);
    expect(useAudioStore.getState().ambientRestore).toBe('none');
  });

  it('keeps the mix for another try when the browser still refuses to play', async () => {
    seed({
      activeAmbientSounds: [
        { id: A, volume: 30 },
        { id: B, volume: 70 },
      ],
    });
    await useAudioStore.persist.rehydrate();
    manager.failIds.add(B);

    await expect(useAudioStore.getState().startRestoredAmbient()).resolves.toBe(false);
    expect(useAudioStore.getState().ambientRestore).toBe('autoplay');
    expect(useAudioStore.getState().activeAmbientSounds).toHaveLength(2);

    // giving up drops only what never started, so the sliders stay honest
    useAudioStore.getState().dropUnstartedAmbient();
    expect(useAudioStore.getState().activeAmbientSounds).toEqual([{ id: A, volume: 30 }]);
    expect(useAudioStore.getState().ambientRestore).toBe('none');
  });

  it('stopping everything cancels a pending restore', async () => {
    seed({ activeAmbientSounds: [{ id: A, volume: 30 }] });
    await useAudioStore.persist.rehydrate();

    await useAudioStore.getState().stopAllAmbient();

    expect(useAudioStore.getState().ambientRestore).toBe('none');
    expect(useAudioStore.getState().activeAmbientSounds).toEqual([]);
    await useAudioStore.getState().startRestoredAmbient();
    expect(manager.playAmbient).not.toHaveBeenCalled();
  });
});

describe('playAmbient races', () => {
  it('a double click on one sound leaves one entry in the mix', async () => {
    manager.delayMs = 5;
    await Promise.all([
      useAudioStore.getState().playAmbient(A, 40),
      useAudioStore.getState().playAmbient(A, 40),
    ]);
    expect(useAudioStore.getState().activeAmbientSounds).toEqual([{ id: A, volume: 40 }]);
  });

  it('two different sounds started together both land in the mix', async () => {
    manager.delayMs = 5;
    await Promise.all([
      useAudioStore.getState().playAmbient(A, 40),
      useAudioStore.getState().playAmbient(B, 60),
    ]);
    const ids = useAudioStore.getState().activeAmbientSounds.map((s) => s.id).sort();
    expect(ids).toEqual([A, B].sort());
    expect(useAudioStore.getState().currentlyPlaying).toMatchObject({ id: 'mixed-ambient', count: 2 });
  });
});
