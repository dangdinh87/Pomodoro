import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BackgroundSettings {
  backgroundType: 'none' | 'gradient' | 'solid' | 'image' | 'video'
  backgroundStyle: string
  backgroundOpacity: number
}



interface SystemState {
  backgroundSettings: BackgroundSettings
  isLoading: boolean
  loadingMessage?: string
  loadingSubtitle?: string
  isFocusMode: boolean

  // Background settings actions
  updateBackgroundSettings: (settings: Partial<BackgroundSettings>) => void
  resetBackgroundSettings: () => void

  // Loading actions
  setLoading: (isLoading: boolean, message?: string, subtitle?: string) => void

  // Focus mode actions
  setFocusMode: (isFocusMode: boolean) => void

  // Chat panel state
  isChatPanelOpen: boolean
  setChatPanelOpen: (isOpen: boolean) => void
}

const defaultBackgroundSettings: BackgroundSettings = {
  backgroundType: 'solid',
  backgroundStyle: 'hsl(var(--background))',
  backgroundOpacity: 100,
}



export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      backgroundSettings: defaultBackgroundSettings,
      isLoading: false,
      isFocusMode: false,
      isChatPanelOpen: false,

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

      setChatPanelOpen: (isOpen) =>
        set({ isChatPanelOpen: isOpen }),
    }),
    {
      name: 'system-storage',
      // Don't persist loading state
      partialize: (state) => ({
        backgroundSettings: state.backgroundSettings,
        isChatPanelOpen: state.isChatPanelOpen,
      }),
    }
  )
)