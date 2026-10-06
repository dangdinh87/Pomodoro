import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioManager, type AudioSource } from './audio-manager';

/** Controllable stand-in for HTMLAudioElement. */
class FakeAudio {
  static instances: FakeAudio[] = [];
  static playImpl: (a: FakeAudio) => Promise<void> = async () => {};
  src = '';
  loop = false;
  volume = 1;
  paused = true;
  attrs: Record<string, string> = {};
  pause = vi.fn(() => {
    this.paused = true;
  });
  constructor() {
    FakeAudio.instances.push(this);
  }
  setAttribute(k: string, v: string) {
    this.attrs[k] = v;
  }
  async play() {
    await FakeAudio.playImpl(this);
    this.paused = false;
  }
}

const source = (id: string, volume = 60): AudioSource => ({
  id,
  type: 'ambient',
  name: id,
  url: `/sounds/${id}.mp3`,
  volume,
  loop: true,
});

/** A play() that stays pending until released. */
function gate() {
  let release!: () => void;
  const opened = new Promise<void>((r) => (release = r));
  FakeAudio.playImpl = () => opened;
  return release;
}

describe('AudioManager ambient mix', () => {
  let manager: AudioManager;

  beforeEach(() => {
    FakeAudio.instances = [];
    FakeAudio.playImpl = async () => {};
    vi.stubGlobal('Audio', FakeAudio);
    manager = new AudioManager();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('plays a sound once even when asked twice while the first is still loading', async () => {
    const release = gate();
    const first = manager.playAmbient(source('rain'));
    const second = manager.playAmbient(source('rain'));
    release();

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(FakeAudio.instances).toHaveLength(1);
    expect(manager.getAmbientCount()).toBe(1);
  });

  it('a stop that arrives while the sound is loading silences it for good', async () => {
    const release = gate();
    const playing = manager.playAmbient(source('rain'));
    const stopping = manager.stopAmbient('rain');
    release();

    await expect(playing).resolves.toBe(false);
    await stopping;
    expect(manager.isAmbientActive('rain')).toBe(false);
    expect(FakeAudio.instances[0].paused).toBe(true);
  });

  it('asking again after such a stop brings the sound back (no orphan, no second element)', async () => {
    const release = gate();
    const first = manager.playAmbient(source('rain'));
    await manager.stopAmbient('rain');
    const again = manager.playAmbient(source('rain'));
    release();

    await expect(Promise.all([first, again])).resolves.toEqual([true, true]);
    expect(FakeAudio.instances).toHaveLength(1);
    expect(manager.isAmbientActive('rain')).toBe(true);
  });

  it('stopAllAmbient also cancels sounds that are still loading', async () => {
    const release = gate();
    const a = manager.playAmbient(source('rain'));
    const b = manager.playAmbient(source('wind'));
    await manager.stopAllAmbient();
    release();

    await expect(Promise.all([a, b])).resolves.toEqual([false, false]);
    expect(manager.getAmbientCount()).toBe(0);
    expect(FakeAudio.instances.every((i) => i.paused)).toBe(true);
  });

  it('a refused play leaves nothing behind and can be retried', async () => {
    FakeAudio.playImpl = async () => {
      throw new DOMException('blocked', 'NotAllowedError');
    };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(manager.playAmbient(source('rain'))).resolves.toBe(false);
    expect(manager.isAmbientActive('rain')).toBe(false);

    FakeAudio.playImpl = async () => {};
    await expect(manager.playAmbient(source('rain'))).resolves.toBe(true);
    expect(manager.isAmbientActive('rain')).toBe(true);
  });

  it('applies the master volume and mute to sounds that start later', async () => {
    manager.setVolume(40);
    manager.setMute(true);
    await manager.playAmbient(source('rain', 50));
    expect(FakeAudio.instances[0].volume).toBe(0);

    manager.setMute(false);
    expect(FakeAudio.instances[0].volume).toBeCloseTo(0.2); // 50% of 40%
  });
});
