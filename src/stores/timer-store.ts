import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'
export type ClockType = 'digital' | 'analog' | 'progress' | 'flip' | 'animated'

export interface TimerSettings {
  workDuration: number // in minutes
  shortBreakDuration: number // in minutes
  longBreakDuration: number // in minutes
  longBreakInterval: number // number of work sessions before long break
  autoStartBreak: boolean
  autoStartWork: boolean
  clockType: ClockType
  clockSize: 'small' | 'medium' | 'large'
  showClock: boolean
  lowTimeWarningEnabled: boolean // enable glow/shake effects under 10s
}

export interface TimerPlanStep {
  id: string
  type: TimerMode
  minutes: number
}

interface TimerState {
  mode: TimerMode
  timeLeft: number // in seconds
  isRunning: boolean
  sessionCount: number
  completedSessions: number
  totalFocusTime: number // in seconds
  settings: TimerSettings
  // Absolute timestamp (ms) when current session should end; null if paused/stopped
  deadlineAt: number | null

  // Custom plan support
  usePlan: boolean
  plan: TimerPlanStep[]
  currentStepIndex: number
  repeatPlan: boolean

  // Actions
  setMode: (mode: TimerMode) => void
  setTimeLeft: (time: number) => void
  setIsRunning: (running: boolean) => void
  setDeadlineAt: (deadline: number | null) => void
  incrementSessionCount: () => void
  incrementCompletedSessions: () => void
  setTotalFocusTime: (time: number) => void
  updateSettings: (settings: Partial<TimerSettings>) => void
  resetTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void

  // Plan actions
  setPlan: (plan: TimerPlanStep[]) => void
  setUsePlan: (use: boolean) => void
  setRepeatPlan: (repeat: boolean) => void
  setCurrentStepIndex: (index: number) => void
  goToNextStep: () => void
}

const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  // Default to automatically move to the next step (auto-start next session)
  autoStartBreak: true,
  autoStartWork: true,
  clockType: 'digital',
  clockSize: 'medium',
  showClock: false,
  lowTimeWarningEnabled: true,
}

export const useTimerStore = create<TimerState>()(
  persist(
    (
      set: (partial: Partial<TimerState> | ((state: TimerState) => Partial<TimerState>)) => void,
      get: () => TimerState
    ) => ({
      mode: 'work',
      timeLeft: 25 * 60, // 25 minutes in seconds
      isRunning: false,
      deadlineAt: null,
      sessionCount: 0,
      completedSessions: 0,
      totalFocusTime: 0,
      settings: defaultSettings,

      // Custom plan defaults
      usePlan: false,
      plan: [],
      currentStepIndex: 0,
      repeatPlan: true,

      setMode: (mode: TimerMode) => set({ mode }),
      setTimeLeft: (timeLeft: number) => {
        // Validate to prevent NaN or negative values
        const validTimeLeft = Number.isFinite(timeLeft) && timeLeft >= 0 ? timeLeft : 0;
        set({ timeLeft: validTimeLeft });
      },
      setIsRunning: (isRunning: boolean) => set({ isRunning }),
      setDeadlineAt: (deadlineAt) => set({ deadlineAt }),
      incrementSessionCount: () => set((state: TimerState) => ({ sessionCount: state.sessionCount + 1 })),
      incrementCompletedSessions: () => set((state: TimerState) => ({ completedSessions: state.completedSessions + 1 })),
      setTotalFocusTime: (totalFocusTime: number) => set({ totalFocusTime }),

      // Settings update respects plan mode: do not override timeLeft in plan mode
      updateSettings: (newSettings: Partial<TimerSettings>) =>
        set((state: TimerState) => {
          const nextSettings = { ...state.settings, ...newSettings }
          const nextState: Partial<TimerState> = {
            settings: nextSettings,
          }
          // If timer is not running and NOT using a custom plan, update timeLeft per mode and changed durations
          if (!state.isRunning && !state.usePlan) {
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

      // Reset respects plan mode
      resetTimer: () => {
        const { mode, settings, usePlan, plan, currentStepIndex } = get()

        if (usePlan && plan.length > 0) {
          const step = plan[currentStepIndex] ?? plan[0]
          set({
            mode: step.type,
            timeLeft: step.minutes * 60,
            isRunning: false,
            deadlineAt: null
          })
          return
        }

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
          isRunning: false,
          deadlineAt: null
        })
      },

      // Plan actions
      setPlan: (plan: TimerPlanStep[]) => set({ plan }),
      setUsePlan: (usePlan: boolean) =>
        set((state: TimerState) => {
          const next: Partial<TimerState> = { usePlan }
          if (usePlan && state.plan.length > 0) {
            const step = state.plan[state.currentStepIndex] ?? state.plan[0]
            next.mode = step.type
            next.timeLeft = step.minutes * 60
          }
          return next
        }),
      setRepeatPlan: (repeatPlan: boolean) => set({ repeatPlan }),
      setCurrentStepIndex: (index: number) =>
        set((state: TimerState) => {
          const idx = Math.max(0, Math.min(index, Math.max(0, state.plan.length - 1)))
          const next: Partial<TimerState> = { currentStepIndex: idx }
          if (state.usePlan && state.plan.length > 0) {
            const step = state.plan[idx]
            next.mode = step.type
            next.timeLeft = step.minutes * 60
          }
          return next
        }),
      goToNextStep: () =>
        set((state: TimerState) => {
          if (!state.usePlan || state.plan.length === 0) return {}
          let idx = state.currentStepIndex + 1
          if (idx >= state.plan.length) {
            if (state.repeatPlan) {
              idx = 0
            } else {
              // stop at end of plan
              return { isRunning: false, deadlineAt: null }
            }
          }
          const step = state.plan[idx]
          return {
            currentStepIndex: idx,
            mode: step.type,
            timeLeft: step.minutes * 60,
          }
        }),

      // Pause timer functionality
      pauseTimer: () => {
        set((state: TimerState) => ({
          isRunning: false,
          deadlineAt: null,
        }))
      },

      // Resume timer functionality
      resumeTimer: () => {
        set((state: TimerState) => {
          if (state.timeLeft <= 0) return state
          return {
            isRunning: true,
            deadlineAt: Date.now() + state.timeLeft * 1000,
          }
        })
      },
    }),
    {
      name: 'timer-storage',
      partialize: (state: TimerState) => ({
        // Persist current timer state across reloads
        mode: state.mode,
        timeLeft: state.timeLeft,
        isRunning: state.isRunning,
        sessionCount: state.sessionCount,
        deadlineAt: state.deadlineAt,
        settings: state.settings,
        completedSessions: state.completedSessions,
        totalFocusTime: state.totalFocusTime,

        // Plan fields
        usePlan: state.usePlan,
        plan: state.plan,
        currentStepIndex: state.currentStepIndex,
        repeatPlan: state.repeatPlan,
      }),
      onRehydrateStorage: () => (state: TimerState | undefined) => {
        // Restore persisted timer state; if running and deadline exists, recompute remaining
        if (state) {
          // Backward-compatible defaults for new fields
          // @ts-ignore - handle possibly missing fields from older persisted versions
          if (typeof (state as any).usePlan === 'undefined') (state as any).usePlan = false
          // @ts-ignore
          if (!Array.isArray((state as any).plan)) (state as any).plan = []
          // @ts-ignore
          if (typeof (state as any).currentStepIndex !== 'number') (state as any).currentStepIndex = 0
          // @ts-ignore
          if (typeof (state as any).repeatPlan === 'undefined') (state as any).repeatPlan = true

          const now = Date.now()
          if (state.isRunning && state.deadlineAt) {
            const remainingMs = Math.max(0, state.deadlineAt - now)
            const remaining = Math.ceil(remainingMs / 1000)
            state.timeLeft = remaining
            // If already elapsed, keep isRunning true; UI effect will handle completion
          } else if (typeof state.timeLeft !== 'number' || state.timeLeft <= 0) {
            // Fallback: derive timeLeft from plan (if enabled) or from mode and settings
            if (state.usePlan && state.plan.length > 0) {
              const idx = Math.max(0, Math.min(state.currentStepIndex, state.plan.length - 1))
              const step = state.plan[idx]
              state.mode = step.type
              state.timeLeft = step.minutes * 60
            } else {
              const { mode, settings } = state
              if (mode === 'work') {
                state.timeLeft = settings.workDuration * 60
              } else if (mode === 'shortBreak') {
                state.timeLeft = settings.shortBreakDuration * 60
              } else {
                state.timeLeft = settings.longBreakDuration * 60
              }
            }
          }
        }
      },
    }
  )
)