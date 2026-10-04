import type { CurrentlyPlayingAudio } from '@/stores/audio-store';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Title to show for what is playing; a mix is named in the user's language, with its size. */
export function playingTitle(
  audio: Pick<CurrentlyPlayingAudio, 'id' | 'name' | 'count'> | null | undefined,
  t: Translate,
): string {
  if (!audio) return '';
  if (audio.id === 'mixed-ambient' && audio.count) {
    return t('audio.ambient.mixedLabel', { count: audio.count });
  }
  return audio.name;
}
