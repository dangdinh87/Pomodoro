import { beforeEach, describe, expect, it, vi } from 'vitest';

const manager = vi.hoisted(() => ({
  playAmbient: vi.fn(async () => true),
  stopAllAmbient: vi.fn(async () => {}),
  setVolume: vi.fn(),
  setMute: vi.fn(),
}));

vi.mock('@/lib/audio/audio-manager', () => ({ audioManager: manager, default: manager }));

import { useAudioStore } from '@/stores/audio-store';

describe('loading mixes that reference removed sounds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAudioStore.setState({ activeAmbientSounds: [], currentlyPlaying: null });
  });

  it('plays the sounds it knows and skips the rest', async () => {
    await useAudioStore.getState().loadPreset({
      id: 'user-1',
      name: 'Old mix',
      sounds: [
        { id: 'birds', volume: 40 },
        { id: 'light-rain', volume: 60 },
        { id: 'coffee-shop', volume: 50 },
      ],
      isBuiltIn: false,
    });

    expect(manager.playAmbient).toHaveBeenCalledTimes(1);
    expect(useAudioStore.getState().activeAmbientSounds).toEqual([{ id: 'light-rain', volume: 60 }]);
  });

  it('does nothing, without throwing, when every sound was removed', async () => {
    await expect(
      useAudioStore.getState().loadPreset({
        id: 'user-2',
        name: 'Silent mix',
        sounds: [{ id: 'cat-purring', volume: 50 }],
        isBuiltIn: false,
      }),
    ).resolves.toBeUndefined();

    expect(manager.playAmbient).not.toHaveBeenCalled();
    expect(useAudioStore.getState().activeAmbientSounds).toEqual([]);
  });

  it('ignores a removed sound in toggleAmbient', async () => {
    await useAudioStore.getState().toggleAmbient('night-crickets');
    expect(manager.playAmbient).not.toHaveBeenCalled();
    expect(useAudioStore.getState().activeAmbientSounds).toEqual([]);
  });
});
