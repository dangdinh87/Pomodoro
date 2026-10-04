import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audioManager, AudioSource } from '@/lib/audio/audio-manager';
import { soundCatalog, findSound } from '@/lib/audio/sound-catalog';

// --- Types ---

export interface AmbientSoundState {
  id: string;
  volume: number; // 0-100, per-sound
}

export interface SoundPreset {
  id: string;
  name: string;
  icon?: string;
  sounds: AmbientSoundState[];
  isBuiltIn: boolean;
}

export interface CurrentlyPlayingAudio {
  type: 'ambient' | 'youtube';
  id: string;
  name: string;
  vn?: string;
  volume: number;
  isPlaying: boolean;
  icon?: string;
  /** How many sounds a 'mixed-ambient' entry stands for (the title is built per language) */
  count?: number;
  timestamp?: number;
  duration?: number;
  currentTime?: number;
  source?: AudioSource;
}

export interface AudioSettings {
  masterVolume: number; // 0-100
  isMuted: boolean;
  activeSource: 'ambient' | 'youtube' | 'none';
  alarmType: string; // 'bell' | 'chime' | 'gong' | 'digital' | 'soft'
  alarmVolume: number; // 0-100
  youtubeUrl: string;
}

/**
 * What is left to do with a mix restored from storage. Browsers refuse to start audio
 * before the first user gesture, so a restored mix shows its sliders at once but only
 * starts sounding on that gesture (or when the timer starts).
 * - 'none': nothing pending (players exist, or there is no mix)
 * - 'autoplay': start on the first gesture
 * - 'paused': the mix was paused when the page closed; wait for the play button
 */
export type AmbientRestore = 'none' | 'autoplay' | 'paused';

/** Mix from storage -> known sounds only, volume 1..100, one entry per sound. */
export function sanitizeAmbientMix(raw: unknown): AmbientSoundState[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const mix: AmbientSoundState[] = [];
  for (const item of raw) {
    const id = item?.id;
    const volume = item?.volume;
    if (typeof id !== 'string' || typeof volume !== 'number' || !Number.isFinite(volume)) continue;
    if (!findSound(id) || seen.has(id)) continue;
    const clamped = Math.min(100, Math.round(volume));
    if (clamped <= 0) continue;
    seen.add(id);
    mix.push({ id, volume: clamped });
  }
  return mix;
}

// --- State ---

/** What reaches localStorage (see `partialize`). */
type PersistedAudio = Pick<AudioState, 'audioSettings' | 'presets' | 'activeAmbientSounds'> & {
  ambientPaused: boolean;
};

interface AudioState {
  currentlyPlaying: CurrentlyPlayingAudio | null;
  audioSettings: AudioSettings;
  activeAmbientSounds: AmbientSoundState[];
  presets: SoundPreset[];
  ambientRestore: AmbientRestore; // runtime only

  // Actions
  setCurrentlyPlaying: (audio: CurrentlyPlayingAudio | null) => void;
  clearCurrentlyPlaying: () => void;
  updatePlayingStatus: (isPlaying: boolean) => void;

  // Playback Actions
  playAmbient: (soundId: string, volume?: number) => Promise<void>;
  toggleAmbient: (soundId: string) => Promise<void>;
  stopAmbient: (soundId: string) => Promise<void>;
  stopAllAmbient: () => Promise<void>;
  /** Start a mix restored from storage. Resolves false if the browser still refused. */
  startRestoredAmbient: (opts?: { force?: boolean }) => Promise<boolean>;
  /** Give up on restored sounds that never started, so the sliders match what plays. */
  dropUnstartedAmbient: () => void;
  togglePlayPause: () => Promise<void>;
  stop: () => Promise<void>;

  // Volume & Settings
  updateVolume: (volume: number) => void;
  toggleMute: () => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  setSoundVolume: (soundId: string, volume: number) => void;

  // Source switching
  setActiveSource: (source: 'ambient' | 'youtube' | 'none') => Promise<void>;

  // Preset management
  loadPreset: (preset: SoundPreset) => Promise<void>;
  savePreset: (name: string, icon?: string) => void;
  deletePreset: (presetId: string) => void;
  renamePreset: (presetId: string, newName: string) => void;
}

function mixedAmbientPlaying(count: number, masterVolume: number): CurrentlyPlayingAudio {
  return {
    type: 'ambient',
    id: 'mixed-ambient',
    // English fallback only: screens build the title with `playingTitle` (i18n, count)
    name: 'Mixed Ambient',
    count,
    volume: masterVolume,
    isPlaying: true,
    timestamp: Date.now(),
  };
}

const defaultAudioSettings: AudioSettings = {
  masterVolume: 50,
  isMuted: false,
  activeSource: 'none',
  alarmType: 'bell',
  alarmVolume: 70,
  youtubeUrl: '',
};

// v3 -> v4: favorites, recently played, history and the saved mix were dropped (see `migrate`)
const AUDIO_STORE_VERSION = 4;
const REMOVED_STATE_KEYS = ['audioHistory', 'favorites', 'recentlyPlayed', 'savedAmbientState'] as const;

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      currentlyPlaying: null,
      audioSettings: defaultAudioSettings,
      activeAmbientSounds: [],
      presets: [],
      ambientRestore: 'none',

      setCurrentlyPlaying: (audio) => {
        const current = get().currentlyPlaying;

        // Guard against redundant updates
        if (!audio && !current) return;
        if (
          audio &&
          current &&
          current.id === audio.id &&
          current.isPlaying === audio.isPlaying &&
          current.type === audio.type &&
          current.name === audio.name
        ) {
          return;
        }

        const timestamp = Date.now();
        const audioWithTimestamp = audio ? { ...audio, timestamp } : null;

        set({ currentlyPlaying: audioWithTimestamp });
      },

      clearCurrentlyPlaying: () => {
        set({ currentlyPlaying: null });
      },

      updatePlayingStatus: (isPlaying) => {
        const current = get().currentlyPlaying;
        if (!current || current.isPlaying === isPlaying) return;

        set((state) => ({
          currentlyPlaying: state.currentlyPlaying
            ? { ...state.currentlyPlaying, isPlaying }
            : null,
        }));
      },

      playAmbient: async (soundId, volume = 50) => {
        const sound = soundCatalog.ambient.find((s) => s.id === soundId);
        if (!sound) return;

        // Don't play sounds with 0% volume
        if (volume <= 0) {
          console.warn(`Cannot play sound with volume ${volume}`);
          return;
        }

        const { audioSettings } = get();
        const source: AudioSource = {
          id: sound.id,
          type: 'ambient',
          name: sound.label,
          vn: sound.vn,
          url: sound.url,
          volume, // per-sound volume (AudioManager calculates effective)
          loop: true,
        };

        const success = await audioManager.playAmbient(source);

        if (success) {
          // Read the mix AFTER the await: other plays may have landed meanwhile, and a
          // sound already listed (restored mix, double click) is updated, not repeated.
          const { activeAmbientSounds } = get();
          const newEntry: AmbientSoundState = { id: soundId, volume };
          const newActiveAmbientSounds = activeAmbientSounds.some((s) => s.id === soundId)
            ? activeAmbientSounds.map((s) => (s.id === soundId ? newEntry : s))
            : [...activeAmbientSounds, newEntry];
          const soundCount = newActiveAmbientSounds.length;

          // Calculate new currentlyPlaying based on new ambient sounds
          let newCurrentlyPlaying: CurrentlyPlayingAudio | null = null;
          const current = get().currentlyPlaying;
          const isMainSourcePlaying = current && current.type !== 'ambient';

          if (isMainSourcePlaying) {
            newCurrentlyPlaying = current;
          } else if (soundCount === 1) {
            newCurrentlyPlaying = {
              type: 'ambient',
              id: sound.id,
              name: sound.label,
              vn: sound.vn,
              volume: audioSettings.masterVolume,
              isPlaying: true,
              timestamp: Date.now(),
            };
          } else {
            newCurrentlyPlaying = mixedAmbientPlaying(soundCount, audioSettings.masterVolume);
          }

          // BATCH all updates into single set() to prevent multiple re-renders
          set({
            activeAmbientSounds: newActiveAmbientSounds,
            currentlyPlaying: newCurrentlyPlaying,
          });
        }
      },

      toggleAmbient: async (soundId) => {
        const { activeAmbientSounds } = get();
        const isActive = activeAmbientSounds.some((s) => s.id === soundId);

        if (isActive) {
          await get().stopAmbient(soundId);
        } else {
          await get().playAmbient(soundId);
        }
      },

      stopAmbient: async (soundId) => {
        const { activeAmbientSounds, audioSettings } = get();
        await audioManager.stopAmbient(soundId);

        const newActiveAmbientSounds = activeAmbientSounds.filter(
          (s) => s.id !== soundId,
        );
        const soundCount = newActiveAmbientSounds.length;

        // Calculate new currentlyPlaying
        let newCurrentlyPlaying: CurrentlyPlayingAudio | null = null;
        const current = get().currentlyPlaying;
        const isMainSourcePlaying = current && current.type !== 'ambient';

        if (isMainSourcePlaying) {
          newCurrentlyPlaying = current;
        } else if (soundCount === 0) {
          newCurrentlyPlaying = null;
        } else if (soundCount === 1) {
          const sound = soundCatalog.ambient.find(
            (s) => s.id === newActiveAmbientSounds[0].id,
          );
          if (sound) {
            newCurrentlyPlaying = {
              type: 'ambient',
              id: sound.id,
              name: sound.label,
              vn: sound.vn,
              volume: audioSettings.masterVolume,
              isPlaying: true,
              timestamp: Date.now(),
            };
          }
        } else {
          newCurrentlyPlaying = mixedAmbientPlaying(soundCount, audioSettings.masterVolume);
        }

        // BATCH update
        set({
          activeAmbientSounds: newActiveAmbientSounds,
          currentlyPlaying: newCurrentlyPlaying,
          // Nothing left to restore once the whole mix is gone
          ...(soundCount === 0 ? { ambientRestore: 'none' as const } : {}),
        });
      },

      stopAllAmbient: async () => {
        await audioManager.stopAllAmbient();
        const current = get().currentlyPlaying;
        const isMainSource = current && current.type !== 'ambient';
        set({
          activeAmbientSounds: [],
          currentlyPlaying: isMainSource ? current : null,
          ambientRestore: 'none',
        });
      },

      startRestoredAmbient: async ({ force = false } = {}) => {
        const { ambientRestore, activeAmbientSounds } = get();
        if (ambientRestore === 'none' || (ambientRestore === 'paused' && !force)) return true;

        // Claim it first: two gestures in a row must not start the mix twice
        set({ ambientRestore: 'none' });
        const toStart = activeAmbientSounds.filter(
          (s) => s.volume > 0 && !audioManager.isAmbientActive(s.id),
        );
        await Promise.all(toStart.map((s) => get().playAmbient(s.id, s.volume)));

        const refused = toStart.some((s) => !audioManager.isAmbientActive(s.id));
        // Still blocked (no real gesture yet): keep the mix for the next attempt
        if (refused) set({ ambientRestore });
        return !refused;
      },

      dropUnstartedAmbient: () => {
        set((state) => ({
          activeAmbientSounds: state.activeAmbientSounds.filter((s) =>
            audioManager.isAmbientActive(s.id),
          ),
          ambientRestore: 'none',
        }));
      },

      togglePlayPause: async () => {
        const { currentlyPlaying } = get();

        // Handle YouTube separately
        if (currentlyPlaying?.type === 'youtube') {
          try {
            // Access global YouTube player (matches use-youtube-player.ts)
            const yt = (window as any).__globalYTPlayer;
            if (yt) {
              const state = yt.getPlayerState?.();
              if (state === 1) {
                // Video is playing -> Pause it AND all ambients
                yt.pauseVideo();
                await audioManager.pause();
                get().updatePlayingStatus(false);
              } else {
                // Video is NOT playing -> Play it AND resume all ambients
                yt.playVideo();
                await audioManager.resume();
                get().updatePlayingStatus(true);
              }
            }
          } catch (error) {
            console.error('Error toggling YouTube playback:', error);
          }
          return;
        }

        // Handle other audio types & Ambient mixing
        if (currentlyPlaying?.isPlaying) {
          await audioManager.pause();
          get().updatePlayingStatus(false);
        } else {
          // A mix restored from storage has no players yet: pressing play creates them
          if (get().ambientRestore !== 'none') {
            await get().startRestoredAmbient({ force: true });
          }
          await audioManager.resume();

          const { activeAmbientSounds } = get();
          // Update status to true if we have ANY active content with volume > 0
          const activeWithVolume = activeAmbientSounds.filter(s => s.volume > 0);
          if (currentlyPlaying || activeWithVolume.length > 0) {
            get().updatePlayingStatus(true);
          }
        }
      },

      stop: async () => {
        await audioManager.stop();
        get().clearCurrentlyPlaying();
      },

      updateVolume: (volume) => {
        // Update manager (recalculates all ambient effective volumes internally)
        audioManager.setVolume(volume);

        // Update state
        set((state) => ({
          audioSettings: { ...state.audioSettings, masterVolume: volume },
          currentlyPlaying: state.currentlyPlaying
            ? { ...state.currentlyPlaying, volume }
            : null,
        }));
      },

      toggleMute: () => {
        const { audioSettings } = get();
        const newMuted = !audioSettings.isMuted;

        // Update manager
        audioManager.setMute(newMuted);

        // Update state
        set((state) => ({
          audioSettings: { ...state.audioSettings, isMuted: newMuted },
        }));
      },

      setSoundVolume: (soundId, volume) => {
        const { activeAmbientSounds } = get();
        const clamped = Math.max(0, Math.min(100, volume));

        // If volume is 0, stop the sound completely instead of just muting it
        if (clamped === 0) {
          get().stopAmbient(soundId);
          return;
        }

        // Update volume in activeAmbientSounds
        const updated = activeAmbientSounds.map((s) =>
          s.id === soundId ? { ...s, volume: clamped } : s,
        );

        // Update AudioManager per-sound volume
        audioManager.setAmbientVolume(soundId, clamped);

        set({ activeAmbientSounds: updated });
      },

      setActiveSource: async (source) => {
        const current = get().audioSettings.activeSource;

        // No-op if already on this source
        if (current === source) return;

        // Update active source in settings
        set((state) => ({
          audioSettings: { ...state.audioSettings, activeSource: source },
        }));
      },

      // --- Preset Management ---

      loadPreset: async (preset) => {
        // Stop all current ambient sounds
        await get().stopAllAmbient();

        // Play each sound in preset at its volume (filter out 0% volume, graceful skip on errors)
        for (const sound of preset.sounds.filter(s => s.volume > 0)) {
          try {
            await get().playAmbient(sound.id, sound.volume);
          } catch (error) {
            console.warn(
              `Skipping sound "${sound.id}" from preset "${preset.name}":`,
              error,
            );
            // Continue to next sound (graceful skip)
          }
        }
      },

      savePreset: (name, icon) => {
        const { activeAmbientSounds, presets } = get();

        // Filter only sounds with volume > 0
        const activeWithVolume = activeAmbientSounds.filter(s => s.volume > 0);

        // Validation
        if (activeWithVolume.length === 0) {
          console.warn('Cannot save preset: no active sounds with volume > 0');
          return;
        }

        const userPresets = presets.filter((p) => !p.isBuiltIn);
        if (userPresets.length >= 10) {
          console.warn('Cannot save preset: maximum 10 user presets reached');
          return;
        }

        // Create new user preset
        const newPreset: SoundPreset = {
          id: `user-${Date.now()}`,
          name,
          icon: icon || '🎵',
          sounds: [...activeWithVolume],
          isBuiltIn: false,
        };

        set({ presets: [...presets, newPreset] });
      },

      deletePreset: (presetId) => {
        set((state) => ({
          presets: state.presets.filter(
            (p) => p.id !== presetId || p.isBuiltIn,
          ),
        }));
      },

      renamePreset: (presetId, newName) => {
        set((state) => ({
          presets: state.presets.map((p) =>
            p.id === presetId && !p.isBuiltIn ? { ...p, name: newName } : p,
          ),
        }));
      },

      updateAudioSettings: (settings) => {
        set((state) => ({
          audioSettings: { ...state.audioSettings, ...settings },
        }));
      },
    }),
    {
      name: 'audio-storage-v2',
      version: AUDIO_STORE_VERSION,
      migrate: (storedState: any, version: number) => {
        const persistedState = storedState ?? {};
        if (version < 3) {
          // Convert string[] to AmbientSoundState[]
          if (Array.isArray(persistedState.activeAmbientSounds)) {
            persistedState.activeAmbientSounds =
              persistedState.activeAmbientSounds.map((item: any) =>
                typeof item === 'string' ? { id: item, volume: 50 } : item,
              );
          }
          // Rename volume -> masterVolume
          if (persistedState.audioSettings?.volume !== undefined) {
            persistedState.audioSettings.masterVolume =
              persistedState.audioSettings.volume;
            delete persistedState.audioSettings.volume;
          }
          // Add defaults for new fields
          persistedState.audioSettings = {
            ...persistedState.audioSettings,
            activeSource: persistedState.audioSettings?.activeSource || 'none',
            alarmType: persistedState.audioSettings?.alarmType || 'bell',
            alarmVolume: persistedState.audioSettings?.alarmVolume ?? 70,
          };
          // Remove deprecated fields
          delete persistedState.audioSettings?.selectedAmbientSound;
          delete persistedState.audioSettings?.selectedTab;
          delete persistedState.audioSettings?.selectedNotificationSound;
          delete persistedState.audioSettings?.notificationVolume;
          // Init new state
          if (!persistedState.presets) persistedState.presets = [];
        }
        if (version < 4) {
          // Favorites, recently played, play history, the saved mix and the fade flag had no UI
          for (const key of REMOVED_STATE_KEYS) delete persistedState[key];
          delete persistedState.audioSettings?.fadeInOut;
        }
        return persistedState as PersistedAudio;
      },
      partialize: (state) => ({
        audioSettings: state.audioSettings,
        presets: state.presets,
        // The mix (ids + per-sound volume) survives a reload; playback restarts on a gesture
        activeAmbientSounds: state.activeAmbientSounds,
        ambientPaused:
          state.ambientRestore === 'paused' ||
          (state.currentlyPlaying !== null && !state.currentlyPlaying.isPlaying),
      }),
      merge: (persistedState, currentState) => {
        const { ambientPaused, ...persisted } = (persistedState ?? {}) as {
          ambientPaused?: boolean;
        } & Partial<AudioState>;
        const mix = sanitizeAmbientMix(persisted.activeAmbientSounds);
        return {
          ...currentState,
          ...persisted,
          // Always use current runtime currentlyPlaying, not persisted
          currentlyPlaying: currentState.currentlyPlaying,
          // AudioManager has no players after a reload: sliders come back now, sound on a gesture
          activeAmbientSounds: mix,
          ambientRestore: mix.length === 0 ? 'none' : ambientPaused ? 'paused' : 'autoplay',
        };
      },
      // The manager is a fresh singleton on every load: give it the saved master volume
      // and mute, or the UI would say "Muted" while sounds still play at full level
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        audioManager.setVolume(state.audioSettings.masterVolume);
        audioManager.setMute(state.audioSettings.isMuted);
      },
    },
  ),
);
