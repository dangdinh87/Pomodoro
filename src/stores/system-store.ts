import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SoundSettings {
  soundType: 'bell' | 'chime' | 'gong' | 'digital' | 'none'
  volume: number
  isMuted: boolean
}

interface BackgroundSettings {
  showDottedMap: boolean
  backgroundType: 'none' | 'gradient' | 'solid' | 'image' | 'video'
  backgroundStyle: string
  backgroundOpacity: number
}

interface AudioSettings {
  selectedAmbientSound: string
  volume: number
  fadeInOut: boolean
  selectedNotificationSound: string
  notificationVolume: number
  youtubeUrl?: string
}

interface SystemState {
  soundSettings: SoundSettings
  backgroundSettings: BackgroundSettings
  audioSettings: AudioSettings
  isLoading: boolean
  loadingMessage?: string
  loadingSubtitle?: string
  
  // Sound settings actions
  updateSoundSettings: (settings: Partial<SoundSettings>) => void
  resetSoundSettings: () => void
  
  // Background settings actions
  updateBackgroundSettings: (settings: Partial<BackgroundSettings>) => void
  resetBackgroundSettings: () => void
  
  // Audio settings actions
  updateAudioSettings: (settings: Partial<AudioSettings>) => void
  resetAudioSettings: () => void
  
  // Loading actions
  setLoading: (isLoading: boolean, message?: string, subtitle?: string) => void
}

const defaultSoundSettings: SoundSettings = {
  soundType: 'bell',
  volume: 50,
  isMuted: false,
}

const defaultBackgroundSettings: BackgroundSettings = {
  showDottedMap: false,
  backgroundType: 'none',
  backgroundStyle: '',
  backgroundOpacity: 100,
}

const defaultAudioSettings: AudioSettings = {
  selectedAmbientSound: '',
  volume: 50,
  fadeInOut: true,
  selectedNotificationSound: 'alarm',
  notificationVolume: 70,
  youtubeUrl: '',
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      soundSettings: defaultSoundSettings,
      backgroundSettings: defaultBackgroundSettings,
      audioSettings: defaultAudioSettings,
      isLoading: false,
      
      updateSoundSettings: (newSettings) =>
        set((state) => ({
          soundSettings: { ...state.soundSettings, ...newSettings },
        })),
      
      resetSoundSettings: () =>
        set({ soundSettings: defaultSoundSettings }),
      
      updateBackgroundSettings: (newSettings) =>
        set((state) => ({
          backgroundSettings: { ...state.backgroundSettings, ...newSettings },
        })),
      
      resetBackgroundSettings: () =>
        set({ backgroundSettings: defaultBackgroundSettings }),
      
      updateAudioSettings: (newSettings) =>
        set((state) => ({
          audioSettings: { ...state.audioSettings, ...newSettings },
        })),
      
      resetAudioSettings: () =>
        set({ audioSettings: defaultAudioSettings }),
      
      setLoading: (isLoading, message, subtitle) =>
        set({
          isLoading,
          loadingMessage: message,
          loadingSubtitle: subtitle
        }),
    }),
    {
      name: 'system-storage',
      // Don't persist loading state
      partialize: (state) => ({
        soundSettings: state.soundSettings,
        backgroundSettings: state.backgroundSettings,
        audioSettings: state.audioSettings,
      }),
    }
  )
)