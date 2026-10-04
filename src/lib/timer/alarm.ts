import { useAudioStore } from '@/stores/audio-store';
import { alarmSounds } from '@/lib/audio/sound-catalog';

const FALLBACK_ALARM_URL = '/sounds/alarms/bell.mp3';

/** `alarmType` value that turns the bell off. */
export const ALARM_NONE = 'none';

// Audio element per sound file, created ahead of time so the bell does not wait
// on a network fetch (or on a throttled tab) when the session ends.
const preloaded = new Map<string, HTMLAudioElement>();

function selectedAlarmUrl(alarmType: string): string | null {
  if (alarmType === ALARM_NONE) return null;
  return alarmSounds.find((a) => a.id === alarmType)?.url || FALLBACK_ALARM_URL;
}

function audioFor(url: string): HTMLAudioElement {
  let audio = preloaded.get(url);
  if (!audio) {
    audio = new Audio(url);
    audio.preload = 'auto';
    preloaded.set(url, audio);
  }
  return audio;
}

/** Fetches the selected alarm sound now. Call when a run starts; cheap to repeat. */
export function preloadAlarm(): void {
  try {
    const url = selectedAlarmUrl(useAudioStore.getState().audioSettings.alarmType);
    if (url) audioFor(url).load();
  } catch {
    // Audio is best-effort
  }
}

/** Plays the user's chosen alarm (nothing when set to None). Shared by the engine, skip and Preview. */
export function playAlarm(): void {
  try {
    const { alarmType, alarmVolume } = useAudioStore.getState().audioSettings;
    const url = selectedAlarmUrl(alarmType);
    if (!url) return;
    const audio = audioFor(url);
    audio.currentTime = 0;
    // Minimum 10% volume ensures alarm is always audible
    audio.volume = Math.max(0.1, alarmVolume / 100);
    void audio.play()?.catch(() => {});
  } catch {
    // Audio is best-effort
  }
}
