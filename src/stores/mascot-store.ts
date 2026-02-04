import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MascotState =
  | 'happy'
  | 'focused'
  | 'encouraging'
  | 'sleepy'
  | 'excited'
  | 'worried'
  | 'sad'
  | 'celebrating';

export type MascotEvent =
  | 'TASK_COMPLETE'
  | 'SESSION_START'
  | 'SESSION_END'
  | 'BREAK_START'
  | 'ACHIEVEMENT_UNLOCK'
  | 'STREAK_RISK'
  | 'STREAK_LOST'
  | 'MILESTONE_REACHED';

interface MascotStore {
  currentState: MascotState;
  previousState: MascotState;
  isAnimating: boolean;
  reducedMotion: boolean;

  // Actions
  setState: (state: MascotState) => void;
  triggerTemporary: (state: MascotState, durationMs: number) => void;
  setReducedMotion: (value: boolean) => void;
  handleEvent: (event: MascotEvent) => void;
}

// Timeout reference for temporary state changes
let temporaryTimeout: ReturnType<typeof setTimeout> | null = null;

export const useMascotStore = create<MascotStore>()(
  persist(
    (set, get) => ({
      currentState: 'happy',
      previousState: 'happy',
      isAnimating: false,
      reducedMotion: false,

      setState: (state) =>
        set({
          previousState: get().currentState,
          currentState: state,
        }),

      triggerTemporary: (state, durationMs) => {
        // Clear any existing timeout
        if (temporaryTimeout) {
          clearTimeout(temporaryTimeout);
        }

        const prev = get().currentState;
        set({ currentState: state, isAnimating: true });

        temporaryTimeout = setTimeout(() => {
          set({ currentState: prev, isAnimating: false });
          temporaryTimeout = null;
        }, durationMs);
      },

      setReducedMotion: (value) => set({ reducedMotion: value }),

      handleEvent: (event) => {
        const { setState, triggerTemporary } = get();

        switch (event) {
          case 'TASK_COMPLETE':
            triggerTemporary('happy', 2000);
            break;
          case 'SESSION_START':
            setState('focused');
            break;
          case 'SESSION_END':
            triggerTemporary('encouraging', 3000);
            break;
          case 'BREAK_START':
            setState('sleepy');
            break;
          case 'ACHIEVEMENT_UNLOCK':
            triggerTemporary('excited', 3000);
            break;
          case 'STREAK_RISK':
            setState('worried');
            break;
          case 'STREAK_LOST':
            triggerTemporary('sad', 5000);
            break;
          case 'MILESTONE_REACHED':
            triggerTemporary('celebrating', 5000);
            break;
        }
      },
    }),
    {
      name: 'mascot-state',
      partialize: (state) => ({
        reducedMotion: state.reducedMotion,
      }),
    }
  )
);
