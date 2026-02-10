import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioManager, AudioSource } from '@/lib/audio/audio-manager'
import { soundCatalog } from '@/lib/audio/sound-catalog'

// --- Types ---

export interface AmbientSoundState {
  id: string
  volume: number // 0-100, per-sound
}

export interface SoundPreset {
  id: string
  name: string
  icon?: string
  sounds: AmbientSoundState[]
  isBuiltIn: boolean
}

export interface CurrentlyPlayingAudio {
  type: 'ambient' | 'youtube'
  id: string
  name: string
  vn?: string
  volume: number
  isPlaying: boolean
  icon?: string
  timestamp?: number
  duration?: number
  currentTime?: number
  source?: AudioSource
}

export interface AudioSettings {
  masterVolume: number       // 0-100 (renamed from 'volume')
  isMuted: boolean
  fadeInOut: boolean
  activeSource: 'ambient' | 'youtube' | 'none'
  alarmType: string          // 'bell' | 'chime' | 'gong' | 'digital' | 'soft'
  alarmVolume: number        // 0-100
  youtubeUrl: string
}

// --- State ---

interface AudioState {
  currentlyPlaying: CurrentlyPlayingAudio | null
  audioHistory: CurrentlyPlayingAudio[]
  audioSettings: AudioSettings
  favorites: string[]
  recentlyPlayed: string[]
  activeAmbientSounds: AmbientSoundState[]   // changed from string[]
  presets: SoundPreset[]
  savedAmbientState: AmbientSoundState[]

  // Actions
  setCurrentlyPlaying: (audio: CurrentlyPlayingAudio | null) => void
  addToHistory: (audio: CurrentlyPlayingAudio) => void
  clearCurrentlyPlaying: () => void
  updatePlayingStatus: (isPlaying: boolean) => void

  // Playback Actions
  playAmbient: (soundId: string, volume?: number) => Promise<void>
  toggleAmbient: (soundId: string) => Promise<void>
  stopAmbient: (soundId: string) => Promise<void>
  stopAllAmbient: () => Promise<void>
  updateCurrentlyPlayingForAmbients: () => void
  playAudio: (source: AudioSource) => Promise<void>
  togglePlayPause: () => Promise<void>
  stop: () => Promise<void>

  // Volume & Settings
  updateVolume: (volume: number) => void
  toggleMute: () => void
  updateAudioSettings: (settings: Partial<AudioSettings>) => void
  resetAudioSettings: () => void
  setSoundVolume: (soundId: string, volume: number) => void

  // Source switching
  setActiveSource: (source: 'ambient' | 'youtube' | 'none') => Promise<void>
  saveAmbientState: () => void
  restoreAmbientState: () => Promise<void>

  // Preset management
  loadPreset: (preset: SoundPreset) => Promise<void>
  savePreset: (name: string, icon?: string) => void
  deletePreset: (presetId: string) => void
  renamePreset: (presetId: string, newName: string) => void

  // Favorites/History
  addToFavorites: (soundId: string) => void
  removeFromFavorites: (soundId: string) => void
  toggleFavorite: (soundId: string) => void
  addToRecentlyPlayed: (soundId: string) => void

  getAudioStats: () => {
    totalPlayTime: number
    favoriteCount: number
    mostPlayedType: string
    recentActivity: string[]
  }
}

const defaultAudioSettings: AudioSettings = {
  masterVolume: 50,
  isMuted: false,
  fadeInOut: true,
  activeSource: 'none',
  alarmType: 'bell',
  alarmVolume: 70,
  youtubeUrl: '',
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      currentlyPlaying: null,
      audioHistory: [],
      audioSettings: defaultAudioSettings,
      favorites: [],
      recentlyPlayed: [],
      activeAmbientSounds: [],
      presets: [],
      savedAmbientState: [],

      setCurrentlyPlaying: (audio) => {
        const current = get().currentlyPlaying

        // Guard against redundant updates
        if (!audio && !current) return
        if (audio && current &&
          current.id === audio.id &&
          current.isPlaying === audio.isPlaying &&
          current.type === audio.type &&
          current.name === audio.name) {
          return
        }

        const timestamp = Date.now()
        const audioWithTimestamp = audio ? { ...audio, timestamp } : null

        set({ currentlyPlaying: audioWithTimestamp })

        // Only add to history if it's a new item or if history is empty
        if (audioWithTimestamp && (!current || current.id !== audioWithTimestamp.id)) {
          get().addToHistory(audioWithTimestamp)
          get().addToRecentlyPlayed(audioWithTimestamp.id)
        }
      },

      addToHistory: (audio) => {
        set((state) => ({
          audioHistory: [audio, ...state.audioHistory.filter(item => item.id !== audio.id)].slice(0, 20)
        }))
      },

      clearCurrentlyPlaying: () => {
        set({ currentlyPlaying: null })
      },

      updatePlayingStatus: (isPlaying) => {
        const current = get().currentlyPlaying
        if (!current || current.isPlaying === isPlaying) return

        set((state) => ({
          currentlyPlaying: state.currentlyPlaying
            ? { ...state.currentlyPlaying, isPlaying }
            : null
        }))
      },

      playAmbient: async (soundId, volume = 50) => {
        const sound = soundCatalog.ambient.find(s => s.id === soundId)
        if (!sound) return

        const { audioSettings, activeAmbientSounds } = get()
        const source: AudioSource = {
          id: sound.id,
          type: 'ambient',
          name: sound.label,
          vn: sound.vn,
          url: sound.url,
          volume, // per-sound volume (AudioManager calculates effective)
          loop: true
        }

        const success = await audioManager.playAmbient(source)

        if (success) {
          const newEntry: AmbientSoundState = { id: soundId, volume }
          const newActiveAmbientSounds = [...activeAmbientSounds, newEntry]
          const soundCount = newActiveAmbientSounds.length

          // Calculate new currentlyPlaying based on new ambient sounds
          let newCurrentlyPlaying: CurrentlyPlayingAudio | null = null
          const current = get().currentlyPlaying
          const isMainSourcePlaying = current && current.type !== 'ambient'

          if (isMainSourcePlaying) {
            newCurrentlyPlaying = current
          } else if (soundCount === 1) {
            newCurrentlyPlaying = {
              type: 'ambient',
              id: sound.id,
              name: sound.label,
              vn: sound.vn,
              volume: audioSettings.masterVolume,
              isPlaying: true,
              timestamp: Date.now()
            }
          } else {
            newCurrentlyPlaying = {
              type: 'ambient',
              id: 'mixed-ambient',
              name: `Mixed Ambient (${soundCount} sounds)`,
              volume: audioSettings.masterVolume,
              isPlaying: true,
              timestamp: Date.now()
            }
          }

          // BATCH all updates into single set() to prevent multiple re-renders
          set((state) => ({
            activeAmbientSounds: newActiveAmbientSounds,
            currentlyPlaying: newCurrentlyPlaying,
            audioHistory: newCurrentlyPlaying ? [newCurrentlyPlaying, ...state.audioHistory.filter(item => item.id !== newCurrentlyPlaying!.id)].slice(0, 20) : state.audioHistory,
            recentlyPlayed: newCurrentlyPlaying ? [newCurrentlyPlaying.id, ...state.recentlyPlayed.filter(id => id !== newCurrentlyPlaying!.id)].slice(0, 10) : state.recentlyPlayed
          }))
        }
      },

      toggleAmbient: async (soundId) => {
        const { activeAmbientSounds } = get()
        const isActive = activeAmbientSounds.some(s => s.id === soundId)

        if (isActive) {
          await get().stopAmbient(soundId)
        } else {
          await get().playAmbient(soundId)
        }
      },

      stopAmbient: async (soundId) => {
        const { activeAmbientSounds, audioSettings } = get()
        await audioManager.stopAmbient(soundId)

        const newActiveAmbientSounds = activeAmbientSounds.filter(s => s.id !== soundId)
        const soundCount = newActiveAmbientSounds.length

        // Calculate new currentlyPlaying
        let newCurrentlyPlaying: CurrentlyPlayingAudio | null = null
        const current = get().currentlyPlaying
        const isMainSourcePlaying = current && current.type !== 'ambient'

        if (isMainSourcePlaying) {
          newCurrentlyPlaying = current
        } else if (soundCount === 0) {
          newCurrentlyPlaying = null
        } else if (soundCount === 1) {
          const sound = soundCatalog.ambient.find(s => s.id === newActiveAmbientSounds[0].id)
          if (sound) {
            newCurrentlyPlaying = {
              type: 'ambient',
              id: sound.id,
              name: sound.label,
              vn: sound.vn,
              volume: audioSettings.masterVolume,
              isPlaying: true,
              timestamp: Date.now()
            }
          }
        } else {
          newCurrentlyPlaying = {
            type: 'ambient',
            id: 'mixed-ambient',
            name: `Mixed Ambient (${soundCount} sounds)`,
            volume: audioSettings.masterVolume,
            isPlaying: true,
            timestamp: Date.now()
          }
        }

        // BATCH update
        set({
          activeAmbientSounds: newActiveAmbientSounds,
          currentlyPlaying: newCurrentlyPlaying
        })
      },

      stopAllAmbient: async () => {
        await audioManager.stopAllAmbient()
        const current = get().currentlyPlaying
        const isMainSource = current && current.type !== 'ambient'
        set({
          activeAmbientSounds: [],
          currentlyPlaying: isMainSource ? current : null
        })
      },

      updateCurrentlyPlayingForAmbients: () => {
        const { activeAmbientSounds, currentlyPlaying } = get()

        // If playing main source, do NOT override it with ambient info
        if (currentlyPlaying && currentlyPlaying.type !== 'ambient') {
          return
        }

        if (activeAmbientSounds.length === 0) {
          get().clearCurrentlyPlaying()
        } else if (activeAmbientSounds.length === 1) {
          const sound = soundCatalog.ambient.find(s => s.id === activeAmbientSounds[0].id)
          if (sound) {
            get().setCurrentlyPlaying({
              type: 'ambient',
              id: sound.id,
              name: sound.label,
              vn: sound.vn,
              volume: get().audioSettings.masterVolume,
              isPlaying: true,
            })
          }
        } else {
          // Multiple ambients - show mixed status
          get().setCurrentlyPlaying({
            type: 'ambient',
            id: 'mixed-ambient',
            name: `Mixed Ambient (${activeAmbientSounds.length} sounds)`,
            volume: get().audioSettings.masterVolume,
            isPlaying: true,
          })
        }
      },

      playAudio: async (source) => {
        const { audioSettings } = get()

        // Ensure volume matches global settings
        source.volume = audioSettings.masterVolume

        const success = await audioManager.play(source)

        if (success) {
          get().setCurrentlyPlaying({
            type: source.type as 'ambient' | 'youtube',
            id: source.id,
            name: source.name,
            vn: source.vn,
            volume: source.volume,
            isPlaying: true,
            source: source
          })

          // Apply mute state if needed
          if (audioSettings.isMuted) {
            audioManager.setMute(true)
          }
        }
      },

      togglePlayPause: async () => {
        const { currentlyPlaying } = get()

        // Handle YouTube separately
        if (currentlyPlaying?.type === 'youtube') {
          try {
            // Access global YouTube player (matches use-youtube-player.ts)
            const yt = (window as any).__globalYTPlayer
            if (yt) {
              const state = yt.getPlayerState?.()
              if (state === 1) {
                // Video is playing -> Pause it AND all ambients
                yt.pauseVideo()
                await audioManager.pause()
                get().updatePlayingStatus(false)
              } else {
                // Video is NOT playing -> Play it AND resume all ambients
                yt.playVideo()
                await audioManager.resume()
                get().updatePlayingStatus(true)
              }
            }
          } catch (error) {
            console.error('Error toggling YouTube playback:', error)
          }
          return
        }

        // Handle other audio types & Ambient mixing
        if (currentlyPlaying?.isPlaying) {
          await audioManager.pause()
          get().updatePlayingStatus(false)
        } else {
          await audioManager.resume()

          const { activeAmbientSounds } = get()
          // Update status to true if we have ANY active content
          if (currentlyPlaying || activeAmbientSounds.length > 0) {
            get().updatePlayingStatus(true)
          }
        }
      },

      stop: async () => {
        await audioManager.stop()
        get().clearCurrentlyPlaying()
      },

      updateVolume: (volume) => {
        // Update manager (recalculates all ambient effective volumes internally)
        audioManager.setVolume(volume)

        // Update state
        set((state) => ({
          audioSettings: { ...state.audioSettings, masterVolume: volume },
          currentlyPlaying: state.currentlyPlaying
            ? { ...state.currentlyPlaying, volume }
            : null
        }))
      },

      toggleMute: () => {
        const { audioSettings } = get()
        const newMuted = !audioSettings.isMuted

        // Update manager
        audioManager.setMute(newMuted)

        // Update state
        set((state) => ({
          audioSettings: { ...state.audioSettings, isMuted: newMuted }
        }))
      },

      setSoundVolume: (soundId, volume) => {
        const { activeAmbientSounds } = get()
        const clamped = Math.max(0, Math.min(100, volume))

        // Update volume in activeAmbientSounds
        const updated = activeAmbientSounds.map(s =>
          s.id === soundId ? { ...s, volume: clamped } : s
        )

        // Update AudioManager per-sound volume
        audioManager.setAmbientVolume(soundId, clamped)

        set({ activeAmbientSounds: updated })
      },

      setActiveSource: async (source) => {
        const current = get().audioSettings.activeSource

        // No-op if already on this source
        if (current === source) return

        // Switching to YouTube: save and pause ambient
        if (source === 'youtube') {
          get().saveAmbientState()
          await get().stopAllAmbient()
        }

        // Switching to Ambient: stop YouTube and restore ambient
        else if (source === 'ambient') {
          // Stop YouTube via global player
          const yt = (window as any).__globalYTPlayer
          if (yt?.stopVideo) {
            yt.stopVideo()
          }
          // Restore ambient state
          await get().restoreAmbientState()
        }

        // Update active source in settings
        set((state) => ({
          audioSettings: { ...state.audioSettings, activeSource: source }
        }))
      },

      saveAmbientState: () => {
        const { activeAmbientSounds } = get()
        set({ savedAmbientState: [...activeAmbientSounds] })
      },

      restoreAmbientState: async () => {
        const { savedAmbientState } = get()
        // Stop current ambients
        await get().stopAllAmbient()
        // Replay saved sounds
        for (const sound of savedAmbientState) {
          await get().playAmbient(sound.id, sound.volume)
        }
        set({ savedAmbientState: [] })
      },

      // --- Preset Management ---

      loadPreset: async (preset) => {
        // Stop all current ambient sounds
        await get().stopAllAmbient()

        // Play each sound in preset at its volume (graceful skip on errors)
        for (const sound of preset.sounds) {
          try {
            await get().playAmbient(sound.id, sound.volume)
          } catch (error) {
            console.warn(`Skipping sound "${sound.id}" from preset "${preset.name}":`, error)
            // Continue to next sound (graceful skip)
          }
        }
      },

      savePreset: (name, icon) => {
        const { activeAmbientSounds, presets } = get()

        // Validation
        if (activeAmbientSounds.length === 0) {
          console.warn('Cannot save preset: no active sounds')
          return
        }

        const userPresets = presets.filter(p => !p.isBuiltIn)
        if (userPresets.length >= 10) {
          console.warn('Cannot save preset: maximum 10 user presets reached')
          return
        }

        // Create new user preset
        const newPreset: SoundPreset = {
          id: `user-${Date.now()}`,
          name,
          icon: icon || '🎵',
          sounds: [...activeAmbientSounds],
          isBuiltIn: false,
        }

        set({ presets: [...presets, newPreset] })
      },

      deletePreset: (presetId) => {
        set((state) => ({
          presets: state.presets.filter(p => p.id !== presetId || p.isBuiltIn)
        }))
      },

      renamePreset: (presetId, newName) => {
        set((state) => ({
          presets: state.presets.map(p =>
            p.id === presetId && !p.isBuiltIn ? { ...p, name: newName } : p
          )
        }))
      },

      updateAudioSettings: (settings) => {
        set((state) => ({
          audioSettings: { ...state.audioSettings, ...settings }
        }))
      },

      resetAudioSettings: () => {
        set({ audioSettings: defaultAudioSettings })
        audioManager.setVolume(defaultAudioSettings.masterVolume)
        audioManager.setMute(defaultAudioSettings.isMuted)
      },

      addToFavorites: (soundId) => {
        set((state) => ({
          favorites: [...state.favorites, soundId]
        }))
      },

      removeFromFavorites: (soundId) => {
        set((state) => ({
          favorites: state.favorites.filter(id => id !== soundId)
        }))
      },

      toggleFavorite: (soundId) => {
        const { favorites } = get()
        if (favorites.includes(soundId)) {
          get().removeFromFavorites(soundId)
        } else {
          get().addToFavorites(soundId)
        }
      },

      addToRecentlyPlayed: (soundId) => {
        set((state) => ({
          recentlyPlayed: [soundId, ...state.recentlyPlayed.filter(id => id !== soundId)].slice(0, 10)
        }))
      },

      getAudioStats: () => {
        const { audioHistory, favorites } = get()

        const totalPlayTime = audioHistory.reduce((total, audio) => {
          if (audio.timestamp) {
            const playTime = audio.duration || 0
            return total + playTime
          }
          return total
        }, 0)

        const typeCounts: Record<string, number> = {}
        audioHistory.forEach(audio => {
          typeCounts[audio.type] = (typeCounts[audio.type] || 0) + 1
        })

        const mostPlayedType = Object.keys(typeCounts).reduce((a, b) =>
          typeCounts[a] > typeCounts[b] ? a : b, 'ambient'
        )

        const recentActivity = audioHistory.slice(0, 5).map(audio =>
          `${audio.name} (${audio.type})`
        )

        return {
          totalPlayTime,
          favoriteCount: favorites.length,
          mostPlayedType,
          recentActivity
        }
      }
    }),
    {
      name: 'audio-storage-v2',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          // Convert string[] to AmbientSoundState[]
          if (Array.isArray(persistedState.activeAmbientSounds)) {
            persistedState.activeAmbientSounds = persistedState.activeAmbientSounds.map(
              (item: any) => typeof item === 'string' ? { id: item, volume: 50 } : item
            )
          }
          // Rename volume -> masterVolume
          if (persistedState.audioSettings?.volume !== undefined) {
            persistedState.audioSettings.masterVolume = persistedState.audioSettings.volume
            delete persistedState.audioSettings.volume
          }
          // Add defaults for new fields
          persistedState.audioSettings = {
            ...persistedState.audioSettings,
            activeSource: persistedState.audioSettings?.activeSource || 'none',
            alarmType: persistedState.audioSettings?.alarmType || 'bell',
            alarmVolume: persistedState.audioSettings?.alarmVolume ?? 70,
          }
          // Remove deprecated fields
          delete persistedState.audioSettings?.selectedAmbientSound
          delete persistedState.audioSettings?.selectedTab
          delete persistedState.audioSettings?.selectedNotificationSound
          delete persistedState.audioSettings?.notificationVolume
          // Init new state
          if (!persistedState.presets) persistedState.presets = []
          if (!persistedState.savedAmbientState) persistedState.savedAmbientState = []
        }
        return persistedState as AudioState
      },
      partialize: (state) => ({
        audioHistory: state.audioHistory,
        audioSettings: state.audioSettings,
        favorites: state.favorites,
        recentlyPlayed: state.recentlyPlayed,
        activeAmbientSounds: state.activeAmbientSounds,
        presets: state.presets,
        savedAmbientState: state.savedAmbientState,
      }),
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...(persistedState as object),
          // Always use current runtime currentlyPlaying, not persisted
          currentlyPlaying: currentState.currentlyPlaying,
        }
      },
    }
  )
)

// Export audio manager functions
export { audioManager, playAmbientSound, playYouTube, stopAllAudio, setAudioVolume, setAudioMute } from '@/lib/audio/audio-manager'
