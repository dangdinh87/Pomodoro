import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  isNavCollapsed: boolean
  toggleNav: () => void
  setNavCollapsed: (collapsed: boolean) => void
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      isNavCollapsed: true,
      toggleNav: () => set((state) => ({ isNavCollapsed: !state.isNavCollapsed })),
      setNavCollapsed: (collapsed) => set({ isNavCollapsed: collapsed }),
    }),
    {
      name: 'navigation-storage',
    }
  )
)