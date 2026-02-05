import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  calculateXPForLevel,
  getLevelFromXP,
  XP_CONFIG,
  COIN_REWARDS,
  BADGES,
  type BadgeTier,
} from '@/config/gamification';

// =============================================================================
// TYPES
// =============================================================================

interface GamificationState {
  // XP & Levels
  totalXP: number;
  level: number;
  currentXP: number; // XP within current level
  xpForNextLevel: number;

  // Streak
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastActiveDate: string | null;
  streakHistory: string[]; // ISO date strings

  // Badges
  unlockedBadges: string[];
  badgeProgress: Record<string, number>;
  newBadges: string[]; // Recently unlocked, for celebration

  // Coins
  coins: number;

  // Stats
  totalSessions: number;
  totalFocusMinutes: number;
  totalTasksCompleted: number;

  // Special counters for badges
  earlyBirdSessions: number; // before 8am
  nightOwlSessions: number; // after 10pm
  weekendSessions: number;

  // Actions
  addXP: (amount: number) => void;
  completePomodoro: (minutes: number) => void;
  completeTask: () => void;
  markDayActive: () => void;
  useStreakFreeze: () => boolean;
  purchaseItem: (itemId: string, cost: number) => boolean;
  addCoins: (amount: number) => void;
  checkAndUnlockBadges: () => string[];
  clearNewBadges: () => void;
  resetGamification: () => void;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function isEarlyBird(): boolean {
  return new Date().getHours() < 8;
}

function isNightOwl(): boolean {
  return new Date().getHours() >= 22;
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function getCoinRewardForTier(tier: BadgeTier): number {
  switch (tier) {
    case 'bronze':
      return COIN_REWARDS.badgeBronze;
    case 'silver':
      return COIN_REWARDS.badgeSilver;
    case 'gold':
      return COIN_REWARDS.badgeGold;
    default:
      return 0;
  }
}

// =============================================================================
// STORE
// =============================================================================

const initialState = {
  totalXP: 0,
  level: 1,
  currentXP: 0,
  xpForNextLevel: 100,
  currentStreak: 0,
  longestStreak: 0,
  streakFreezes: 0,
  lastActiveDate: null,
  streakHistory: [],
  unlockedBadges: [],
  badgeProgress: {},
  newBadges: [],
  coins: 0,
  totalSessions: 0,
  totalFocusMinutes: 0,
  totalTasksCompleted: 0,
  earlyBirdSessions: 0,
  nightOwlSessions: 0,
  weekendSessions: 0,
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXP: (amount: number) => {
        // Validate input - only positive finite numbers
        if (amount <= 0 || !Number.isFinite(amount)) return;

        const { totalXP } = get();
        const newTotalXP = totalXP + amount;
        const levelInfo = getLevelFromXP(newTotalXP);

        set({
          totalXP: newTotalXP,
          level: levelInfo.level,
          currentXP: levelInfo.currentXP,
          xpForNextLevel: levelInfo.xpForNextLevel,
        });
      },

      completePomodoro: (minutes: number) => {
        const state = get();

        // Update stats
        const newTotalSessions = state.totalSessions + 1;
        const newTotalFocusMinutes = state.totalFocusMinutes + minutes;

        // Check special conditions
        let newEarlyBird = state.earlyBirdSessions;
        let newNightOwl = state.nightOwlSessions;
        let newWeekend = state.weekendSessions;

        if (isEarlyBird()) newEarlyBird++;
        if (isNightOwl()) newNightOwl++;
        if (isWeekend()) newWeekend++;

        set({
          totalSessions: newTotalSessions,
          totalFocusMinutes: newTotalFocusMinutes,
          earlyBirdSessions: newEarlyBird,
          nightOwlSessions: newNightOwl,
          weekendSessions: newWeekend,
        });

        // Add XP and coins
        state.addXP(XP_CONFIG.pomodoroComplete);
        state.addCoins(COIN_REWARDS.pomodoroComplete);

        // Mark day active and check badges
        state.markDayActive();
        state.checkAndUnlockBadges();
      },

      completeTask: () => {
        const state = get();

        set({
          totalTasksCompleted: state.totalTasksCompleted + 1,
        });

        state.addXP(XP_CONFIG.taskComplete);
        state.addCoins(COIN_REWARDS.taskComplete);
        state.checkAndUnlockBadges();
      },

      markDayActive: () => {
        const today = getToday();
        const yesterday = getYesterday();
        const state = get();

        // Already marked today
        if (state.lastActiveDate === today) return;

        let newStreak = state.currentStreak;

        if (state.lastActiveDate === yesterday) {
          // Consecutive day
          newStreak = state.currentStreak + 1;
        } else if (state.lastActiveDate !== today) {
          // Streak broken (or first day)
          newStreak = 1;
        }

        const newHistory = [...state.streakHistory, today].slice(-365);

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastActiveDate: today,
          streakHistory: newHistory,
        });

        // Daily streak bonus
        state.addXP(XP_CONFIG.dailyStreak);
        state.addCoins(COIN_REWARDS.dailyStreak);
      },

      useStreakFreeze: () => {
        const { streakFreezes } = get();
        if (streakFreezes <= 0) return false;

        set({ streakFreezes: streakFreezes - 1 });
        return true;
      },

      purchaseItem: (itemId: string, cost: number) => {
        const { coins } = get();
        if (coins < cost) return false;

        set({ coins: coins - cost });

        // Handle item effects
        if (itemId === 'streakFreeze') {
          set((state) => ({ streakFreezes: state.streakFreezes + 1 }));
        }
        // doubleXP would need a separate system with expiration

        return true;
      },

      addCoins: (amount: number) => {
        // Validate input - only positive finite numbers
        if (amount <= 0 || !Number.isFinite(amount)) return;
        set((state) => ({ coins: state.coins + amount }));
      },

      checkAndUnlockBadges: () => {
        const state = get();
        const newlyUnlocked: string[] = [];

        // Check each badge
        Object.entries(BADGES).forEach(([badgeId, badge]) => {
          // Already unlocked
          if (state.unlockedBadges.includes(badgeId)) return;

          let progress = 0;
          let unlocked = false;

          switch (badge.category) {
            case 'streak':
              progress = state.currentStreak;
              unlocked = state.currentStreak >= badge.requirement;
              break;
            case 'sessions':
              progress = state.totalSessions;
              unlocked = state.totalSessions >= badge.requirement;
              break;
            case 'time':
              const hours = Math.floor(state.totalFocusMinutes / 60);
              progress = hours;
              unlocked = hours >= badge.requirement;
              break;
            case 'special':
              if (badgeId === 'early_bird') {
                progress = state.earlyBirdSessions;
                unlocked = state.earlyBirdSessions >= badge.requirement;
              } else if (badgeId === 'night_owl') {
                progress = state.nightOwlSessions;
                unlocked = state.nightOwlSessions >= badge.requirement;
              } else if (badgeId === 'weekend_warrior') {
                progress = state.weekendSessions;
                unlocked = state.weekendSessions >= badge.requirement;
              }
              break;
          }

          // Update progress
          set((s) => ({
            badgeProgress: { ...s.badgeProgress, [badgeId]: progress },
          }));

          // Unlock badge
          if (unlocked) {
            newlyUnlocked.push(badgeId);
            // Award coins for badge
            const coinReward = getCoinRewardForTier(badge.tier);
            set((s) => ({ coins: s.coins + coinReward }));
          }
        });

        if (newlyUnlocked.length > 0) {
          set((state) => ({
            unlockedBadges: [...state.unlockedBadges, ...newlyUnlocked],
            newBadges: [...state.newBadges, ...newlyUnlocked],
          }));
        }

        return newlyUnlocked;
      },

      clearNewBadges: () => {
        set({ newBadges: [] });
      },

      resetGamification: () => {
        set(initialState);
      },
    }),
    {
      name: 'gamification-store',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        // Handle migrations for future versions
        if (version === 0) {
          // v0 -> v1: merge with initial state for any missing fields
          return { ...initialState, ...(persistedState as object) };
        }
        return persistedState as GamificationState;
      },
    }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectLevel = (state: GamificationState) => state.level;
export const selectXPProgress = (state: GamificationState) => ({
  current: state.currentXP,
  max: state.xpForNextLevel,
  percentage: (state.currentXP / state.xpForNextLevel) * 100,
});
export const selectStreak = (state: GamificationState) => ({
  current: state.currentStreak,
  longest: state.longestStreak,
  freezes: state.streakFreezes,
});
export const selectCoins = (state: GamificationState) => state.coins;
export const selectBadges = (state: GamificationState) => state.unlockedBadges;
