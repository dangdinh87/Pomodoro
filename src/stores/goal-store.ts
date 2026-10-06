import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Minutes offered as quick picks in Timer settings; 0 means the goal is off. */
export const DAILY_GOAL_PRESETS_MIN = [0, 30, 60, 90, 120, 180] as const;

interface GoalState {
  dailyGoalMinutes: number;
  setDailyGoalMinutes: (minutes: number) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      dailyGoalMinutes: 0,
      setDailyGoalMinutes: (minutes) => set({ dailyGoalMinutes: Math.max(0, Math.round(minutes)) }),
    }),
    { name: 'goal-settings' },
  ),
);
