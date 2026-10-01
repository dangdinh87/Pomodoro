import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';
export type ClockType = 'digital' | 'analog' | 'progress' | 'flip' | 'animated';

export interface TimerSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of work sessions before long break
  autoStartBreak: boolean;
  autoStartWork: boolean;
  clockType: ClockType;
  clockSize: 'small' | 'medium' | 'large';
  showClock: boolean;
  lowTimeWarningEnabled: boolean; // enable glow/shake effects under 10s
}

export interface TimerPlanStep {
  id: string;
  type: TimerMode;
  minutes: number;
}

interface TimerState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  sessionCount: number;
  completedSessions: number;
  totalFocusTime: number; // in seconds
  settings: TimerSettings;
  // Absolute timestamp (ms) when current session should end; null if paused/stopped
  deadlineAt: number | null;
  // Tracks timeLeft at the start of a focus period for accurate partial recording
  lastSessionTimeLeft: number;

  // Custom plan support
  usePlan: boolean;
  plan: TimerPlanStep[];
  currentStepIndex: number;
  repeatPlan: boolean;

  // Actions
  setMode: (mode: TimerMode) => void;
  setTimeLeft: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  setDeadlineAt: (deadline: number | null) => void;
  incrementSessionCount: () => void;
  incrementCompletedSessions: () => void;
  setTotalFocusTime: (time: number) => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  resetTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  setLastSessionTimeLeft: (time: number) => void;

  // Plan actions
  setPlan: (plan: TimerPlanStep[]) => void;
  setUsePlan: (use: boolean) => void;
  setRepeatPlan: (repeat: boolean) => void;
  setCurrentStepIndex: (index: number) => void;
  goToNextStep: () => void;
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
};

const TIMER_STORE_VERSION = 1;

/**
 * How late a phase may have finished (tab closed/crashed/reloaded) and still
 * count as a real session. Within this window the engine records it as if it
 * had just completed; beyond it the timer silently moves to the next phase
 * without crediting a session, so reopening the app days later cannot mint
 * sessions or streak days.
 */
export const CATCH_UP_GRACE_MS = 15 * 60 * 1000;

/** Full length (seconds) of the phase described by the given state. */
function phaseSeconds(
  state: Pick<
    TimerState,
    'mode' | 'settings' | 'usePlan' | 'plan' | 'currentStepIndex'
  >,
): number {
  if (state.usePlan && state.plan.length > 0) {
    const idx = Math.max(
      0,
      Math.min(state.currentStepIndex, state.plan.length - 1),
    );
    return state.plan[idx].minutes * 60;
  }
  const { mode, settings } = state;
  if (mode === 'work') return settings.workDuration * 60;
  if (mode === 'shortBreak') return settings.shortBreakDuration * 60;
  return settings.longBreakDuration * 60;
}

/**
 * Builds the in-memory state from whatever is in storage (any version).
 * Fills defaults for fields that older versions did not persist and
 * recomputes timeLeft from the deadline.
 *
 * If the deadline already elapsed while the app was closed we deliberately
 * keep `isRunning: true` with `timeLeft: 0` and the stale `deadlineAt`: the
 * timer engine then records the finished phase exactly once and moves on to
 * the next mode (see use-timer-engine). Resetting to "paused at 00:00" would
 * leave the user stuck, because Start is a no-op at 0.
 */
export function mergePersistedTimerState(
  persisted: unknown,
  current: TimerState,
  now: number = Date.now(),
): TimerState {
  const p = (persisted ?? {}) as Partial<TimerState>;
  const merged: TimerState = {
    ...current,
    ...p,
    settings: { ...defaultSettings, ...(p.settings ?? {}) },
    usePlan: typeof p.usePlan === 'boolean' ? p.usePlan : false,
    plan: Array.isArray(p.plan) ? p.plan : [],
    currentStepIndex:
      typeof p.currentStepIndex === 'number' ? p.currentStepIndex : 0,
    repeatPlan: typeof p.repeatPlan === 'boolean' ? p.repeatPlan : true,
  };

  if (merged.isRunning && merged.deadlineAt) {
    merged.timeLeft = Math.ceil(Math.max(0, merged.deadlineAt - now) / 1000);
    // Recently elapsed work phase: credit the seconds that were still on the
    // clock at the last tick, which no tick will ever count now. Keeps
    // totalFocusTime consistent with the session the engine is about to record.
    if (
      merged.timeLeft === 0 &&
      merged.mode === 'work' &&
      now - merged.deadlineAt <= CATCH_UP_GRACE_MS &&
      typeof p.timeLeft === 'number' &&
      p.timeLeft > 0
    ) {
      merged.totalFocusTime = (merged.totalFocusTime || 0) + p.timeLeft;
    }
  } else if (!Number.isFinite(merged.timeLeft) || merged.timeLeft <= 0) {
    // Fallback: derive timeLeft from plan (if enabled) or from mode/settings
    if (merged.usePlan && merged.plan.length > 0) {
      const idx = Math.max(
        0,
        Math.min(merged.currentStepIndex, merged.plan.length - 1),
      );
      merged.mode = merged.plan[idx].type;
    }
    merged.timeLeft = phaseSeconds(merged);
    merged.isRunning = false;
    merged.deadlineAt = null;
  }

  // Baseline must be a sane number >= timeLeft; older versions never persisted
  // it, so fall back to the full phase length (the previous behaviour).
  // (read from `persisted`, not `merged`, so a stale in-memory value is never reused)
  const baseline = p.lastSessionTimeLeft;
  if (
    typeof baseline !== 'number' ||
    !Number.isFinite(baseline) ||
    baseline < merged.timeLeft
  ) {
    merged.lastSessionTimeLeft = Math.max(
      merged.timeLeft,
      phaseSeconds(merged),
    );
  }
  return merged;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (
      set: (
        partial:
          | Partial<TimerState>
          | ((state: TimerState) => Partial<TimerState>),
      ) => void,
      get: () => TimerState,
    ) => ({
      mode: 'work',
      timeLeft: 25 * 60, // 25 minutes in seconds
      isRunning: false,
      deadlineAt: null,
      sessionCount: 0,
      completedSessions: 0,
      totalFocusTime: 0,
      lastSessionTimeLeft: 25 * 60,
      settings: defaultSettings,

      // Custom plan defaults
      usePlan: false,
      plan: [],
      currentStepIndex: 0,
      repeatPlan: true,

      setMode: (mode: TimerMode) => set({ mode }),
      setTimeLeft: (timeLeft: number) => {
        // Validate to prevent NaN or negative values
        const validTimeLeft =
          Number.isFinite(timeLeft) && timeLeft >= 0 ? timeLeft : 0;
        set({ timeLeft: validTimeLeft });
      },
      setIsRunning: (isRunning: boolean) => set({ isRunning }),
      setDeadlineAt: (deadlineAt) => set({ deadlineAt }),
      incrementSessionCount: () =>
        set((state: TimerState) => ({ sessionCount: state.sessionCount + 1 })),
      incrementCompletedSessions: () =>
        set((state: TimerState) => ({
          completedSessions: state.completedSessions + 1,
        })),
      // BUG-07 FIX: Protect against overflow (max ~31 years in seconds)
      setTotalFocusTime: (totalFocusTime: number) => {
        const MAX_FOCUS_TIME = 999_999_999; // ~31 years
        const validTime =
          Number.isFinite(totalFocusTime) && totalFocusTime >= 0
            ? Math.min(totalFocusTime, MAX_FOCUS_TIME)
            : 0;
        set({ totalFocusTime: validTime });
      },
      setLastSessionTimeLeft: (lastSessionTimeLeft: number) =>
        set({ lastSessionTimeLeft }),

      // Settings update respects plan mode: do not override timeLeft in plan mode
      updateSettings: (newSettings: Partial<TimerSettings>) =>
        set((state: TimerState) => {
          // BUG-01 FIX: Validate longBreakInterval >= 1 to prevent division issues
          if (
            newSettings.longBreakInterval !== undefined &&
            newSettings.longBreakInterval < 1
          ) {
            newSettings.longBreakInterval = 1;
          }
          // BUG-08 FIX: Validate duration settings >= 1 minute
          if (
            newSettings.workDuration !== undefined &&
            newSettings.workDuration < 1
          ) {
            newSettings.workDuration = 1;
          }
          if (
            newSettings.shortBreakDuration !== undefined &&
            newSettings.shortBreakDuration < 1
          ) {
            newSettings.shortBreakDuration = 1;
          }
          if (
            newSettings.longBreakDuration !== undefined &&
            newSettings.longBreakDuration < 1
          ) {
            newSettings.longBreakDuration = 1;
          }

          const nextSettings = { ...state.settings, ...newSettings };
          const nextState: Partial<TimerState> = {
            settings: nextSettings,
          };
          // If timer is not running and NOT using a custom plan, update timeLeft per mode and changed durations
          // FIX: Also sync lastSessionTimeLeft to prevent incorrect duration calculations
          if (!state.isRunning && !state.usePlan) {
            if (state.mode === 'work' && newSettings.workDuration) {
              const newTimeLeft = newSettings.workDuration * 60;
              nextState.timeLeft = newTimeLeft;
              nextState.lastSessionTimeLeft = newTimeLeft;
            } else if (
              state.mode === 'shortBreak' &&
              newSettings.shortBreakDuration
            ) {
              const newTimeLeft = newSettings.shortBreakDuration * 60;
              nextState.timeLeft = newTimeLeft;
              nextState.lastSessionTimeLeft = newTimeLeft;
            } else if (
              state.mode === 'longBreak' &&
              newSettings.longBreakDuration
            ) {
              const newTimeLeft = newSettings.longBreakDuration * 60;
              nextState.timeLeft = newTimeLeft;
              nextState.lastSessionTimeLeft = newTimeLeft;
            }
          }
          return nextState;
        }),

      // Reset respects plan mode
      resetTimer: () => {
        const { mode, settings, usePlan, plan, currentStepIndex } = get();

        if (usePlan && plan.length > 0) {
          const step = plan[currentStepIndex] ?? plan[0];
          set({
            mode: step.type,
            timeLeft: step.minutes * 60,
            lastSessionTimeLeft: step.minutes * 60,
            isRunning: false,
            deadlineAt: null,
          });
          return;
        }

        let newTimeLeft = 0;
        if (mode === 'work') {
          newTimeLeft = settings.workDuration * 60;
        } else if (mode === 'shortBreak') {
          newTimeLeft = settings.shortBreakDuration * 60;
        } else {
          newTimeLeft = settings.longBreakDuration * 60;
        }

        set({
          timeLeft: newTimeLeft,
          // Fresh phase: the unrecorded segment starts from the full length
          lastSessionTimeLeft: newTimeLeft,
          isRunning: false,
          deadlineAt: null,
        });
      },

      // Plan actions
      setPlan: (plan: TimerPlanStep[]) => set({ plan }),
      setUsePlan: (usePlan: boolean) =>
        set((state: TimerState) => {
          const next: Partial<TimerState> = { usePlan };
          if (usePlan && state.plan.length > 0) {
            const step = state.plan[state.currentStepIndex] ?? state.plan[0];
            next.mode = step.type;
            next.timeLeft = step.minutes * 60;
            next.lastSessionTimeLeft = step.minutes * 60;
          }
          return next;
        }),
      setRepeatPlan: (repeatPlan: boolean) => set({ repeatPlan }),
      setCurrentStepIndex: (index: number) =>
        set((state: TimerState) => {
          const idx = Math.max(
            0,
            Math.min(index, Math.max(0, state.plan.length - 1)),
          );
          const next: Partial<TimerState> = { currentStepIndex: idx };
          if (state.usePlan && state.plan.length > 0) {
            const step = state.plan[idx];
            next.mode = step.type;
            next.timeLeft = step.minutes * 60;
            next.lastSessionTimeLeft = step.minutes * 60;
          }
          return next;
        }),
      goToNextStep: () =>
        set((state: TimerState) => {
          if (!state.usePlan || state.plan.length === 0) return {};
          let idx = state.currentStepIndex + 1;
          if (idx >= state.plan.length) {
            if (state.repeatPlan) {
              idx = 0;
            } else {
              // stop at end of plan
              return { isRunning: false, deadlineAt: null };
            }
          }
          const step = state.plan[idx];
          return {
            currentStepIndex: idx,
            mode: step.type,
            timeLeft: step.minutes * 60,
            lastSessionTimeLeft: step.minutes * 60,
            // Clear deadline to prevent stale deadline reuse on next start
            deadlineAt: null,
          };
        }),

      // Pause timer functionality
      pauseTimer: () => {
        set((state: TimerState) => ({
          isRunning: false,
          deadlineAt: null,
        }));
      },

      // Resume timer functionality
      resumeTimer: () => {
        set((state: TimerState) => {
          if (state.timeLeft <= 0) return state;
          return {
            isRunning: true,
            deadlineAt: Date.now() + state.timeLeft * 1000,
          };
        });
      },
    }),
    {
      name: 'timer-storage',
      version: TIMER_STORE_VERSION,
      // v0 -> v1: lastSessionTimeLeft is now persisted. Nothing to rewrite
      // here: mode/settings/deadlineAt/isRunning are kept as-is and missing
      // fields are defaulted in mergePersistedTimerState.
      migrate: (persistedState: unknown) => persistedState as TimerState,
      merge: (persisted: unknown, current: TimerState) =>
        mergePersistedTimerState(persisted, current),
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
        // Start of the current unrecorded focus segment (survives reload)
        lastSessionTimeLeft: state.lastSessionTimeLeft,

        // Plan fields
        usePlan: state.usePlan,
        plan: state.plan,
        currentStepIndex: state.currentStepIndex,
        repeatPlan: state.repeatPlan,
      }),
    },
  ),
);
