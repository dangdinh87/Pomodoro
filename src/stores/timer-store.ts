import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'
export type ClockType = 'digital' | 'analog' | 'progress' | 'flip' | 'ring'

interface TimerSettings {
  workDuration: number // in minutes
  shortBreakDuration: number // in minutes
  longBreakDuration: number // in minutes
  longBreakInterval: number // number of work sessions before long break
  autoStartBreak: boolean
  autoStartWork: boolean
  clockType: ClockType
  showClock: boolean
  lowTimeWarningEnabled: boolean // enable glow/shake effects under 10s
}

interface TimerState {
  mode: TimerMode
  timeLeft: number // in seconds
  isRunning: boolean
  sessionCount: number
  completedSessions: number
  totalFocusTime: number // in seconds
  settings: TimerSettings

  // Actions
  setMode: (mode: TimerMode) => void
  setTimeLeft: (time: number) => void
  setIsRunning: (running: boolean) => void
  incrementSessionCount: () => void
  incrementCompletedSessions: () => void
  setTotalFocusTime: (time: number) => void
  updateSettings: (settings: Partial<TimerSettings>) => void
  resetTimer: () => void
}

const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartWork: false,
  clockType: 'digital',
  showClock: false,
  lowTimeWarningEnabled: true,
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: 'work',
      timeLeft: 25 * 60, // 25 minutes in seconds
      isRunning: false,
      sessionCount: 0,
      completedSessions: 0,
      totalFocusTime: 0,
      settings: defaultSettings,

      setMode: (mode) => set({ mode }),
      setTimeLeft: (timeLeft) => set({ timeLeft }),
      setIsRunning: (isRunning) => set({ isRunning }),
      incrementSessionCount: () => set((state) => ({ sessionCount: state.sessionCount + 1 })),
      incrementCompletedSessions: () => set((state) => ({ completedSessions: state.completedSessions + 1 })),
      setTotalFocusTime: (totalFocusTime) => set({ totalFocusTime }),
      updateSettings: (newSettings) =>
        set((state) => {
          const nextSettings = { ...state.settings, ...newSettings }
          const nextState: Partial<TimerState> = {
            settings: nextSettings,
          }
          // If timer is not running, update timeLeft according to current mode and changed durations
          if (!state.isRunning) {
            if (state.mode === 'work' && newSettings.workDuration) {
              nextState.timeLeft = newSettings.workDuration * 60
            } else if (state.mode === 'shortBreak' && newSettings.shortBreakDuration) {
              nextState.timeLeft = newSettings.shortBreakDuration * 60
            } else if (state.mode === 'longBreak' && newSettings.longBreakDuration) {
              nextState.timeLeft = newSettings.longBreakDuration * 60
            }
          }
          return nextState
        }),
      resetTimer: () => {
        const { mode, settings } = get()
        let newTimeLeft = 0

        if (mode === 'work') {
          newTimeLeft = settings.workDuration * 60
        } else if (mode === 'shortBreak') {
          newTimeLeft = settings.shortBreakDuration * 60
        } else {
          newTimeLeft = settings.longBreakDuration * 60
        }

        set({
          timeLeft: newTimeLeft,
          isRunning: false
        })
      },
    }),
    {
      name: 'timer-storage',
      partialize: (state) => ({
        settings: state.settings,
        completedSessions: state.completedSessions,
        totalFocusTime: state.totalFocusTime,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize timeLeft based on mode and settings after rehydration
        if (state) {
          const { mode, settings } = state
          let newTimeLeft = 0

          if (mode === 'work') {
            newTimeLeft = settings.workDuration * 60
          } else if (mode === 'shortBreak') {
            newTimeLeft = settings.shortBreakDuration * 60
          } else {
            newTimeLeft = settings.longBreakDuration * 60
          }

          state.timeLeft = newTimeLeft
        }
      },
    }
  )
)