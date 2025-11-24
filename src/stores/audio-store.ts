import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioManager, AudioSource } from '@/lib/audio/audio-manager'
import { soundCatalog } from '@/lib/audio/sound-catalog'

export interface CurrentlyPlayingAudio {
  type: 'ambient' | 'youtube' | 'spotify'
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
        const timestamp = Date.now()
        const audioWithTimestamp = audio ? { ...audio, timestamp } : null

        set({ currentlyPlaying: audioWithTimestamp })

        if (audioWithTimestamp) {
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
        set((state) => ({
          currentlyPlaying: state.currentlyPlaying
            ? { ...state.currentlyPlaying, isPlaying }
            : null
        }))
      },

      playAmbient: async (soundId) => {
        const sound = soundCatalog.ambient.find(s => s.id === soundId)
        if (!sound) return

        const { audioSettings } = get()
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
          // Add to active ambient sounds
          set((state) => ({
            activeAmbientSounds: [...state.activeAmbientSounds, soundId]
          }))

          // Update selected ambient sound in settings
          get().updateAudioSettings({ selectedAmbientSound: soundId })

          // Update currently playing to show mixed status
          get().updateCurrentlyPlayingForAmbients()
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
        await audioManager.stopAmbient(soundId)

        set((state) => ({
          activeAmbientSounds: state.activeAmbientSounds.filter(id => id !== soundId)
        }))

        // Update currently playing status
        get().updateCurrentlyPlayingForAmbients()
      },

      stopAllAmbient: async () => {
        await audioManager.stopAllAmbient()
        set({ activeAmbientSounds: [] })
        get().clearCurrentlyPlaying()
      },

      updateCurrentlyPlayingForAmbients: () => {
        const { activeAmbientSounds } = get()
        console.log('[AudioStore] updateCurrentlyPlayingForAmbients called, activeAmbientSounds:', activeAmbientSounds);

        if (activeAmbientSounds.length === 0) {
          console.log('[AudioStore] No ambient sounds, clearing');
          get().clearCurrentlyPlaying()
        } else if (activeAmbientSounds.length === 1) {
          const sound = soundCatalog.ambient.find(s => s.id === activeAmbientSounds[0])
          if (sound) {
            console.log('[AudioStore] Single ambient sound, setting:', sound.label);
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
          console.log('[AudioStore] Multiple ambient sounds:', activeAmbientSounds.length);
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
          // For non-ambient sources, stop all ambients first
          if (source.type === 'youtube' || source.type === 'spotify') {
            await get().stopAllAmbient()
          }

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
            // Access global YouTube player
            const yt = (window as any).__globalYTPlayer;
            if (yt) {
              const state = yt.getPlayerState?.();
              if (state === 1) { // Playing
                yt.pauseVideo();
                get().updatePlayingStatus(false);
              } else { // Paused or other
                yt.playVideo();
                get().updatePlayingStatus(true);
              }
            }
          } catch (error) {
            console.error('Error toggling YouTube playback:', error);
          }
          return;
        }

        // Handle other audio types
        if (currentlyPlaying?.isPlaying) {
          await audioManager.pause()
          get().updatePlayingStatus(false)
        } else {
          await audioManager.resume()
          get().updatePlayingStatus(true)
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
        audioHistory: state.audioHistory,
        audioSettings: state.audioSettings,
        favorites: state.favorites,
        recentlyPlayed: state.recentlyPlayed,
        activeAmbientSounds: state.activeAmbientSounds,
        currentlyPlaying: state.currentlyPlaying,
      }),
    }
  )
)

// Helper hook for audio controls
export const useAudioControls = () => {
  const { currentlyPlaying, audioSettings } = useAudioStore()

  const isPlaying = currentlyPlaying?.isPlaying || false
  const volume = audioSettings.volume
  const isMuted = audioSettings.isMuted

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioManager.pause()
      } else {
        await audioManager.resume()
      }
    } catch (error) {
      console.error('Error toggling playback:', error)
    }
  }

  const handleStop = async () => {
    try {
      await audioManager.stop()
    } catch (error) {
      console.error('Error stopping audio:', error)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    try {
      setAudioVolume(newVolume)
      useAudioStore.getState().updateVolume(newVolume)
    } catch (error) {
      console.error('Error changing volume:', error)
    }
  }

  const handleMuteToggle = () => {
    const newMuted = !isMuted
    setAudioMute(newMuted)
    useAudioStore.getState().updateAudioSettings({ isMuted: newMuted })
  }

  const currentPlaying = currentlyPlaying

  return {
    isPlaying,
    volume,
    isMuted,
    currentPlaying,
    handlePlayPause,
    handleStop,
    handleVolumeChange,
    handleMuteToggle,
  }
}

// Export audio manager functions
export { audioManager, playAmbientSound, playYouTube, stopAllAudio, setAudioVolume, setAudioMute } from '@/lib/audio/audio-manager'