import { ALARM_NONE, playAlarm, preloadAlarm } from './alarm';

let audioSettings = { alarmType: 'bell', alarmVolume: 70 };
vi.mock('@/stores/audio-store', () => ({
  useAudioStore: { getState: () => ({ audioSettings }) },
}));

interface FakeAudio {
  src: string;
  preload: string;
  volume: number;
  currentTime: number;
  load: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
}

let created: FakeAudio[];
// alarm.ts keeps the elements it made, so a later test finds them cached; this registry survives
const everCreated = new Map<string, FakeAudio>();

describe('alarm', () => {
  beforeEach(() => {
    created = [];
    globalThis.Audio = vi.fn().mockImplementation(function (src: string) {
      const audio: FakeAudio = {
        src,
        preload: '',
        volume: 1,
        currentTime: 5,
        load: vi.fn(),
        play: vi.fn().mockResolvedValue(undefined),
      };
      created.push(audio);
      everCreated.set(src, audio);
      return audio;
    }) as unknown as typeof Audio;
  });

  it('plays the selected sound at the chosen volume, from the start', () => {
    audioSettings = { alarmType: 'wood', alarmVolume: 40 };
    playAlarm();
    const wood = created.find((a) => a.src === '/sounds/alarms/wood.mp3')!;
    expect(wood.play).toHaveBeenCalledTimes(1);
    expect(wood.volume).toBeCloseTo(0.4);
    expect(wood.currentTime).toBe(0);
  });

  it('never goes quieter than 10%', () => {
    audioSettings = { alarmType: 'chime', alarmVolume: 0 };
    playAlarm();
    expect(created.find((a) => a.src.endsWith('chime.mp3'))!.volume).toBeCloseTo(0.1);
  });

  it('falls back to the bell for an unknown sound', () => {
    audioSettings = { alarmType: 'does-not-exist', alarmVolume: 70 };
    playAlarm();
    expect(created.at(-1)!.src).toBe('/sounds/alarms/bell.mp3');
  });

  it.each([
    ['gong', '/sounds/alarms/bell.mp3'],
    ['soft', '/sounds/alarms/chime.mp3'],
  ])('plays the replacement for the retired "%s" sound', (retired, url) => {
    audioSettings = { alarmType: retired, alarmVolume: 70 };
    const played = () => everCreated.get(url)?.play.mock.calls.length ?? 0;
    const before = played();
    playAlarm();
    expect(played()).toBe(before + 1);
  });

  it('is silent when set to None', () => {
    audioSettings = { alarmType: ALARM_NONE, alarmVolume: 70 };
    const before = created.length;
    playAlarm();
    preloadAlarm();
    expect(created.length).toBe(before);
  });

  it('preload fetches the selected file once and play reuses that element', () => {
    audioSettings = { alarmType: 'kitchen', alarmVolume: 70 };
    preloadAlarm();
    preloadAlarm();
    const kitchen = created.filter((a) => a.src.endsWith('kitchen.mp3'));
    expect(kitchen).toHaveLength(1);
    expect(kitchen[0].preload).toBe('auto');
    expect(kitchen[0].load).toHaveBeenCalled();

    playAlarm();
    expect(created.filter((a) => a.src.endsWith('kitchen.mp3'))).toHaveLength(1);
    expect(kitchen[0].play).toHaveBeenCalledTimes(1);
  });

  it('swallows playback errors (autoplay blocked)', () => {
    audioSettings = { alarmType: 'digital', alarmVolume: 70 };
    globalThis.Audio = vi.fn().mockImplementation(function () {
      return { play: () => Promise.reject(new Error('NotAllowedError')), load: vi.fn() };
    }) as unknown as typeof Audio;
    expect(() => playAlarm()).not.toThrow();
  });
});
