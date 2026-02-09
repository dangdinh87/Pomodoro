import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioManager, AudioSource } from '@/lib/audio/audio-manager'
import { soundCatalog } from '@/lib/audio/sound-catalog'

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
  volume: number
  isMuted: boolean
  fadeInOut: boolean
  selectedAmbientSound: string
  youtubeUrl: string
  selectedTab: string
  // Notification/Alarm settings
  selectedNotificationSound: string
  notificationVolume: number
}

interface AudioState {
  currentlyPlaying: CurrentlyPlayingAudio | null
  audioHistory: CurrentlyPlayingAudio[]
  audioSettings: AudioSettings
  favorites: string[]
  recentlyPlayed: string[]
  activeAmbientSounds: string[] // IDs of currently mixed ambient sounds

  // Actions
  setCurrentlyPlaying: (audio: CurrentlyPlayingAudio | null) => void
  addToHistory: (audio: CurrentlyPlayingAudio) => void
  clearCurrentlyPlaying: () => void
  updatePlayingStatus: (isPlaying: boolean) => void

  // Playback Actions
  playAmbient: (soundId: string) => Promise<void>
  toggleAmbient: (soundId: string) => Promise<void>
  stopAmbient: (soundId: string) => Promise<void>
  stopAllAmbient: () => Promise<void>
  updateCurrentlyPlayingForAmbients: () => void
  playAudio: (source: AudioSource) => Promise<void>
  togglePlayPause: () => Promise<void>
  stop: () => Promise<void>

  // Settings Actions
  updateVolume: (volume: number) => void
  toggleMute: () => void
  updateAudioSettings: (settings: Partial<AudioSettings>) => void
  resetAudioSettings: () => void

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
  volume: 50,
  isMuted: false,
  fadeInOut: true,
  selectedAmbientSound: '',
  youtubeUrl: '',
  selectedTab: 'sources',
  selectedNotificationSound: 'alarm',
  notificationVolume: 70,
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

      playAmbient: async (soundId) => {
        const sound = soundCatalog.ambient.find(s => s.id === soundId)
        if (!sound) return

        const { audioSettings, activeAmbientSounds } = get()
        const source: AudioSource = {
          id: sound.id,
          type: 'ambient',
          name: sound.label,
          vn: sound.vn,
          url: sound.url,
          volume: audioSettings.volume,
          loop: true
        }

        const success = await audioManager.playAmbient(source)

        if (success) {
          const newActiveAmbientSounds = [...activeAmbientSounds, soundId]
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
              volume: audioSettings.volume,
              isPlaying: true,
              timestamp: Date.now()
            }
          } else {
            newCurrentlyPlaying = {
              type: 'ambient',
              id: 'mixed-ambient',
              name: `Mixed Ambient (${soundCount} sounds)`,
              volume: audioSettings.volume,
              isPlaying: true,
              timestamp: Date.now()
            }
          }

          // BATCH all updates into single set() to prevent multiple re-renders
          set((state) => ({
            activeAmbientSounds: newActiveAmbientSounds,
            audioSettings: { ...state.audioSettings, selectedAmbientSound: soundId },
            currentlyPlaying: newCurrentlyPlaying,
            audioHistory: newCurrentlyPlaying ? [newCurrentlyPlaying, ...state.audioHistory.filter(item => item.id !== newCurrentlyPlaying!.id)].slice(0, 20) : state.audioHistory,
            recentlyPlayed: newCurrentlyPlaying ? [newCurrentlyPlaying.id, ...state.recentlyPlayed.filter(id => id !== newCurrentlyPlaying!.id)].slice(0, 10) : state.recentlyPlayed
          }))
        }
      },

      toggleAmbient: async (soundId) => {
        const { activeAmbientSounds } = get()
        const isActive = activeAmbientSounds.includes(soundId)

        if (isActive) {
          await get().stopAmbient(soundId)
        } else {
          await get().playAmbient(soundId)
        }
      },

      stopAmbient: async (soundId) => {
        const { activeAmbientSounds, audioSettings } = get()
        await audioManager.stopAmbient(soundId)

        const newActiveAmbientSounds = activeAmbientSounds.filter(id => id !== soundId)
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
          const sound = soundCatalog.ambient.find(s => s.id === newActiveAmbientSounds[0])
          if (sound) {
            newCurrentlyPlaying = {
              type: 'ambient',
              id: sound.id,
              name: sound.label,
              vn: sound.vn,
              volume: audioSettings.volume,
              isPlaying: true,
              timestamp: Date.now()
            }
          }
        } else {
          newCurrentlyPlaying = {
            type: 'ambient',
            id: 'mixed-ambient',
            name: `Mixed Ambient (${soundCount} sounds)`,
            volume: audioSettings.volume,
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
          const sound = soundCatalog.ambient.find(s => s.id === activeAmbientSounds[0])
          if (sound) {
            get().setCurrentlyPlaying({
              type: 'ambient',
              id: sound.id,
              name: sound.label,
              vn: sound.vn,
              volume: get().audioSettings.volume,
              isPlaying: true,
            })
          }
        } else {
          // Multiple ambients - show mixed status
          get().setCurrentlyPlaying({
            type: 'ambient',
            id: 'mixed-ambient',
            name: `Mixed Ambient (${activeAmbientSounds.length} sounds)`,
            volume: get().audioSettings.volume,
            isPlaying: true,
          })
        }
      },

      playAudio: async (source) => {
        const { audioSettings } = get()

        // Ensure volume matches global settings
        source.volume = audioSettings.volume

        const success = await audioManager.play(source)

        if (success) {
          get().setCurrentlyPlaying({
            type: source.type as any,
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
        // audioManager.pause/resume now handles both main player and ambient players
        if (currentlyPlaying?.isPlaying) {
          await audioManager.pause()
          get().updatePlayingStatus(false)
        } else {
          // If we have nothing playing but have active ambients, resume them
          // Or if we have paused content
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
        // Update manager
        audioManager.setVolume(volume)

        // Update state
        set((state) => ({
          audioSettings: { ...state.audioSettings, volume },
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

      updateAudioSettings: (settings) => {
        set((state) => ({
          audioSettings: { ...state.audioSettings, ...settings }
        }))
      },

      resetAudioSettings: () => {
        set({ audioSettings: defaultAudioSettings })
        audioManager.setVolume(defaultAudioSettings.volume)
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

        // Calculate total play time (approximate)
        const totalPlayTime = audioHistory.reduce((total, audio) => {
          if (audio.timestamp) {
            const playTime = audio.duration || 0
            return total + playTime
          }
          return total
        }, 0)

        // Get most played type
        const typeCounts: Record<string, number> = {}
        audioHistory.forEach(audio => {
          typeCounts[audio.type] = (typeCounts[audio.type] || 0) + 1
        })

        const mostPlayedType = Object.keys(typeCounts).reduce((a, b) =>
          typeCounts[a] > typeCounts[b] ? a : b, 'ambient'
        )

        // Recent activity (last 5 items)
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
      partialize: (state) => ({
        // Only persist settings and history, NOT runtime state like currentlyPlaying
        audioHistory: state.audioHistory,
        audioSettings: state.audioSettings,
        favorites: state.favorites,
        recentlyPlayed: state.recentlyPlayed,
        activeAmbientSounds: state.activeAmbientSounds,
        // currentlyPlaying is NOT persisted - it's runtime state
      }),
      merge: (persistedState, currentState) => {
        // Merge persisted state with current state, keeping currentlyPlaying from current
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