import { useAudioStore } from '@/stores/audio-store';
import { alarmSounds } from '@/lib/audio/sound-catalog';

const FALLBACK_ALARM_URL = '/sounds/alarms/bell.mp3';

/** Plays the user's chosen alarm. Shared by the engine and manual skip. */
export function playAlarm(): void {
  try {
    const { alarmType, alarmVolume } = useAudioStore.getState().audioSettings;
    const url =
      alarmSounds.find((a) => a.id === alarmType)?.url || FALLBACK_ALARM_URL;
    const audio = new Audio(url);
    // Minimum 10% volume ensures alarm is always audible
    audio.volume = Math.max(0.1, alarmVolume / 100);
    void audio.play()?.catch(() => {});
  } catch {
    // Audio is best-effort
  }
}
