import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SoundSettings {
  soundType: 'bell' | 'chime' | 'gong' | 'digital' | 'none'
  volume: number
  isMuted: boolean
}

interface BackgroundSettings {
  backgroundType: 'none' | 'gradient' | 'solid' | 'image' | 'video'
  backgroundStyle: string
  backgroundOpacity: number
}



interface SystemState {
  soundSettings: SoundSettings
  backgroundSettings: BackgroundSettings
  isLoading: boolean
  loadingMessage?: string
  loadingSubtitle?: string
  isFocusMode: boolean

  // Sound settings actions
  updateSoundSettings: (settings: Partial<SoundSettings>) => void
  resetSoundSettings: () => void

  // Background settings actions
  updateBackgroundSettings: (settings: Partial<BackgroundSettings>) => void
  resetBackgroundSettings: () => void

  // Loading actions
  setLoading: (isLoading: boolean, message?: string, subtitle?: string) => void

  // Focus mode actions
  setFocusMode: (isFocusMode: boolean) => void
}

const defaultSoundSettings: SoundSettings = {
  soundType: 'bell',
  volume: 50,
  isMuted: false,
}

const defaultBackgroundSettings: BackgroundSettings = {
  backgroundType: 'solid',
  backgroundStyle: 'hsl(var(--background))',
  backgroundOpacity: 100,
}



export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      soundSettings: defaultSoundSettings,
      backgroundSettings: defaultBackgroundSettings,
      isLoading: false,
      isFocusMode: false,

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



      setLoading: (isLoading, message, subtitle) =>
        set({
          isLoading,
          loadingMessage: message,
          loadingSubtitle: subtitle
        }),

      setFocusMode: (isFocusMode) =>
        set({ isFocusMode }),
    }),
    {
      name: 'system-storage',
      // Don't persist loading state
      partialize: (state) => ({
        soundSettings: state.soundSettings,
        backgroundSettings: state.backgroundSettings,
      }),
    }
  )
)