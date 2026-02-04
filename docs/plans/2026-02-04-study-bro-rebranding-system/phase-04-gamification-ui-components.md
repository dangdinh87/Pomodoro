---
title: "Phase 04: Gamification UI Components"
status: pending
effort: 10h
dependencies: [phase-01, phase-03]
---

# Phase 04: Gamification UI Components

**Parent Plan**: [plan.md](./plan.md)
**Depends On**: [Phase 01](./phase-01-design-tokens-color-system.md), [Phase 03](./phase-03-mascot-system-assets.md)

## Overview

Build complete gamification system: enhanced streak tracker with flame stages, XP/Level system with store and UI, badge/achievement system, reward/coin system, and gamification dashboard.

## Key Insights (from Research)

### Streak System (Duolingo Pattern)
- Loss aversion: asymmetric emotional impact; high streaks psychologically expensive to lose
- Streak freeze: up to 2 base, costs currency; auto-equip option
- Separate streak from daily goals (Day 14 retention +3.3%)

### XP/Level System
- Exponential curve: 20-30% increase per level; easy early, hard late
- 10 XP per session, 5 XP per task, 20 XP daily streak bonus
- Scope to task categories for deep engagement

### Badge System
- 10-15 badges across 3-5 paths; avoid fragmentation
- Bronze/Silver/Gold tiers create progression clarity
- 70% require streaks/sequences, 30% milestone-based

### Currency Economics
- Soft currency: earned frequently (1-5 per action)
- Freeze cost: 200 units; Premium cosmetics: 500-2000 units
- Limited rotation creates FOMO

## Requirements

### R1: Gamification Store

```typescript
interface GamificationState {
  // XP & Levels
  currentXP: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;

  // Streaks (enhanced from existing)
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastActiveDate: string | null;
  streakHistory: string[];

  // Badges
  unlockedBadges: string[];
  badgeProgress: Record<string, number>;

  // Coins
  coins: number;

  // Actions
  addXP: (amount: number, source: string) => void;
  useStreakFreeze: () => boolean;
  purchaseItem: (itemId: string, cost: number) => boolean;
  unlockBadge: (badgeId: string) => void;
  markDayComplete: () => void;
}
```

### R2: XP Configuration

```typescript
const XP_CONFIG = {
  pomodoroComplete: 10,
  taskComplete: 5,
  dailyStreak: 20,
  weeklyGoal: 50,
  achievementBase: 25,  // multiplied by rarity
};

// Exponential level curve
const calculateXPForLevel = (level: number) =>
  Math.floor(100 * Math.pow(1.25, level - 1));

const LEVEL_TITLES = [
  { min: 1, max: 5, title: 'Rookie Pup' },
  { min: 6, max: 10, title: 'Study Apprentice' },
  { min: 11, max: 20, title: 'Focus Warrior' },
  { min: 21, max: 30, title: 'Productivity Pro' },
  { min: 31, max: 50, title: 'Master Scholar' },
  { min: 51, max: Infinity, title: 'Legendary Bro' },
];
```

### R3: Streak Flame Stages

| Stage | Days | Visual | Color |
|-------|------|--------|-------|
| `spark` | 1-7 | Small orange dot | `#FB923C` |
| `small` | 8-14 | Small flame | `#F97316` |
| `medium` | 15-30 | Medium flame, subtle pulse | `#EA580C` |
| `large` | 31-60 | Large flame, particles | `#DC2626` |
| `inferno` | 60+ | Blue-core flame, glow | `#7C3AED` |

### R4: Badge Definitions

```typescript
const BADGES = {
  // Streak badges
  streak_7: { name: 'Week Warrior', tier: 'bronze', icon: 'flame', requirement: 7 },
  streak_30: { name: 'Monthly Master', tier: 'silver', icon: 'flame', requirement: 30 },
  streak_100: { name: 'Century Champion', tier: 'gold', icon: 'flame', requirement: 100 },

  // Session badges
  sessions_10: { name: 'Getting Started', tier: 'bronze', icon: 'timer', requirement: 10 },
  sessions_100: { name: 'Focus Centurion', tier: 'silver', icon: 'timer', requirement: 100 },
  sessions_1000: { name: 'Pomodoro Legend', tier: 'gold', icon: 'timer', requirement: 1000 },

  // Time badges
  hours_10: { name: 'Dedicated', tier: 'bronze', icon: 'clock', requirement: 10 },
  hours_100: { name: 'Committed', tier: 'silver', icon: 'clock', requirement: 100 },
  hours_1000: { name: 'Time Lord', tier: 'gold', icon: 'clock', requirement: 1000 },

  // Special badges
  early_bird: { name: 'Early Bird', tier: 'bronze', icon: 'sun', requirement: 5 },  // 5 sessions before 8am
  night_owl: { name: 'Night Owl', tier: 'bronze', icon: 'moon', requirement: 5 },   // 5 sessions after 10pm
  weekend_warrior: { name: 'Weekend Warrior', tier: 'silver', icon: 'calendar', requirement: 10 },
};
```

### R5: Coin Economy

| Action | Coins Earned |
|--------|--------------|
| Complete Pomodoro | 2 |
| Complete Task | 1 |
| Daily streak bonus | 5 |
| Achievement unlock | 10-50 (by tier) |

| Item | Cost |
|------|------|
| Streak Freeze | 200 |
| Theme unlock | 500 |
| Mascot accessory | 300-1000 |
| Double XP (24h) | 150 |

## Architecture Decisions

1. **Single Zustand store** - gamification-store.ts holds all state
2. **Persist to localStorage** - survives refresh, syncs on login later
3. **Event-driven XP** - actions dispatch XP events, store handles calculation
4. **Badge progress tracking** - incremental progress for each badge
5. **Migrate existing streak data** - merge with new gamification store

## Related Files

| File | Action |
|------|--------|
| `/src/stores/gamification-store.ts` | NEW: Central gamification state |
| `/src/config/gamification.ts` | NEW: XP/badge/coin configurations |
| `/src/components/gamification/XPProgress.tsx` | NEW: XP bar component |
| `/src/components/gamification/LevelBadge.tsx` | NEW: Level display |
| `/src/components/gamification/StreakFlame.tsx` | NEW: Enhanced streak |
| `/src/components/gamification/AchievementCard.tsx` | NEW: Badge display |
| `/src/components/gamification/CoinDisplay.tsx` | NEW: Coin counter |
| `/src/components/gamification/GamificationDashboard.tsx` | NEW: Stats overview |
| `/src/components/focus/streak-tracker.tsx` | UPDATE: Integrate with new system |

## Implementation Steps

### Step 1: Create Configuration (1h)

1.1 Create `/src/config/gamification.ts`:
```typescript
export const XP_CONFIG = {
  pomodoroComplete: 10,
  taskComplete: 5,
  dailyStreak: 20,
  weeklyGoal: 50,
  achievementBase: 25,
};

export const STREAK_STAGES = {
  spark: { min: 1, max: 7, color: '#FB923C', label: 'Spark' },
  small: { min: 8, max: 14, color: '#F97316', label: 'Small Flame' },
  medium: { min: 15, max: 30, color: '#EA580C', label: 'Medium Flame' },
  large: { min: 31, max: 60, color: '#DC2626', label: 'Large Flame' },
  inferno: { min: 61, max: Infinity, color: '#7C3AED', label: 'Inferno' },
};

export const LEVEL_TITLES = [...];  // as above

export const BADGES = {...};  // as above

export const COIN_REWARDS = {
  pomodoroComplete: 2,
  taskComplete: 1,
  dailyStreak: 5,
  badgeBronze: 10,
  badgeSilver: 25,
  badgeGold: 50,
};

export const SHOP_ITEMS = {
  streakFreeze: { name: 'Streak Freeze', cost: 200, type: 'consumable' },
  doubleXP: { name: 'Double XP (24h)', cost: 150, type: 'consumable' },
  // Themes and accessories added in Phase 05
};

export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpNeeded = 100;
  let accumulated = 0;

  while (accumulated + xpNeeded <= totalXP) {
    accumulated += xpNeeded;
    level++;
    xpNeeded = calculateXPForLevel(level);
  }

  return level;
}

export function getStreakStage(days: number) {
  return Object.entries(STREAK_STAGES).find(
    ([_, stage]) => days >= stage.min && days <= stage.max
  )?.[0] || 'spark';
}
```

### Step 2: Create Gamification Store (2h)

2.1 Create `/src/stores/gamification-store.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  calculateXPForLevel,
  getLevelFromXP,
  XP_CONFIG,
  COIN_REWARDS,
  BADGES,
} from '@/config/gamification';

interface GamificationState {
  // XP
  currentXP: number;
  totalXP: number;
  level: number;

  // Streak
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastActiveDate: string | null;
  streakHistory: string[];

  // Badges
  unlockedBadges: string[];
  badgeProgress: Record<string, number>;

  // Coins
  coins: number;

  // Stats
  totalSessions: number;
  totalFocusMinutes: number;
  totalTasksCompleted: number;

  // Actions
  addXP: (amount: number, source: string) => void;
  completePomodoro: (minutes: number) => void;
  completeTask: () => void;
  markDayComplete: () => void;
  useStreakFreeze: () => boolean;
  purchaseItem: (itemId: string, cost: number) => boolean;
  addCoins: (amount: number) => void;
  checkBadges: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      currentXP: 0,
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      streakFreezes: 0,
      lastActiveDate: null,
      streakHistory: [],
      unlockedBadges: [],
      badgeProgress: {},
      coins: 0,
      totalSessions: 0,
      totalFocusMinutes: 0,
      totalTasksCompleted: 0,

      addXP: (amount, source) => {
        const { totalXP } = get();
        const newTotalXP = totalXP + amount;
        const newLevel = getLevelFromXP(newTotalXP);
        const xpForCurrentLevel = calculateXPForLevel(newLevel);
        const xpAtLevelStart = Array.from({ length: newLevel - 1 })
          .reduce((acc: number, _, i) => acc + calculateXPForLevel(i + 1), 0);

        set({
          totalXP: newTotalXP,
          level: newLevel,
          currentXP: newTotalXP - xpAtLevelStart,
        });
      },

      completePomodoro: (minutes) => {
        const { addXP, addCoins, totalSessions, totalFocusMinutes, checkBadges } = get();
        addXP(XP_CONFIG.pomodoroComplete, 'pomodoro');
        addCoins(COIN_REWARDS.pomodoroComplete);
        set({
          totalSessions: totalSessions + 1,
          totalFocusMinutes: totalFocusMinutes + minutes,
        });
        checkBadges();
      },

      completeTask: () => {
        const { addXP, addCoins, totalTasksCompleted, checkBadges } = get();
        addXP(XP_CONFIG.taskComplete, 'task');
        addCoins(COIN_REWARDS.taskComplete);
        set({ totalTasksCompleted: totalTasksCompleted + 1 });
        checkBadges();
      },

      markDayComplete: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastActiveDate, currentStreak, streakHistory, addXP, addCoins } = get();

        if (lastActiveDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().split('T')[0];

        let newStreak = currentStreak;
        if (lastActiveDate === yesterdayISO) {
          newStreak = currentStreak + 1;
        } else if (lastActiveDate !== today) {
          newStreak = 1;  // Reset if gap
        }

        const newHistory = [...streakHistory, today].slice(-365);

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(get().longestStreak, newStreak),
          lastActiveDate: today,
          streakHistory: newHistory,
        });

        addXP(XP_CONFIG.dailyStreak, 'streak');
        addCoins(COIN_REWARDS.dailyStreak);
      },

      useStreakFreeze: () => {
        const { streakFreezes } = get();
        if (streakFreezes <= 0) return false;
        set({ streakFreezes: streakFreezes - 1 });
        return true;
      },

      purchaseItem: (itemId, cost) => {
        const { coins } = get();
        if (coins < cost) return false;
        set({ coins: coins - cost });

        if (itemId === 'streakFreeze') {
          set({ streakFreezes: get().streakFreezes + 1 });
        }
        return true;
      },

      addCoins: (amount) => set({ coins: get().coins + amount }),

      checkBadges: () => {
        const state = get();
        const newBadges: string[] = [];

        // Check streak badges
        if (state.currentStreak >= 7 && !state.unlockedBadges.includes('streak_7')) {
          newBadges.push('streak_7');
        }
        // ... more badge checks

        if (newBadges.length > 0) {
          set({ unlockedBadges: [...state.unlockedBadges, ...newBadges] });
        }
      },
    }),
    {
      name: 'gamification-store',
      version: 1,
    }
  )
);
```

### Step 3: Create UI Components (4h)

3.1 XPProgress component:
```tsx
// /src/components/gamification/XPProgress.tsx
'use client';

import { useGamificationStore } from '@/stores/gamification-store';
import { calculateXPForLevel, LEVEL_TITLES } from '@/config/gamification';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export function XPProgress({ showLabel = true }: { showLabel?: boolean }) {
  const { currentXP, level } = useGamificationStore();
  const xpNeeded = calculateXPForLevel(level);
  const progress = (currentXP / xpNeeded) * 100;
  const title = LEVEL_TITLES.find(t => level >= t.min && level <= t.max)?.title;

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="font-medium">Level {level} - {title}</span>
          <span className="text-muted-foreground">{currentXP}/{xpNeeded} XP</span>
        </div>
      )}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Progress value={progress} className="h-2 bg-muted" />
      </motion.div>
    </div>
  );
}
```

3.2 StreakFlame component:
```tsx
// /src/components/gamification/StreakFlame.tsx
'use client';

import { useGamificationStore } from '@/stores/gamification-store';
import { getStreakStage, STREAK_STAGES } from '@/config/gamification';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export function StreakFlame({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { currentStreak } = useGamificationStore();
  const stage = getStreakStage(currentStreak);
  const config = STREAK_STAGES[stage as keyof typeof STREAK_STAGES];

  const sizeMap = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

  const flameVariants = {
    spark: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } },
    small: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5 } },
    medium: { scale: [1, 1.15, 1], rotate: [-2, 2, -2], transition: { repeat: Infinity, duration: 1 } },
    large: { scale: [1, 1.2, 1], rotate: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.8 } },
    inferno: { scale: [1, 1.25, 1], rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 0.6 } },
  };

  return (
    <div className="relative flex items-center gap-2">
      <motion.div
        variants={flameVariants}
        animate={stage}
        className={sizeMap[size]}
      >
        <Flame
          className="w-full h-full"
          style={{ color: config.color }}
          fill={stage !== 'spark' ? config.color : 'none'}
        />
      </motion.div>
      <div className="text-lg font-bold">{currentStreak}</div>
    </div>
  );
}
```

3.3 Create remaining components: LevelBadge, AchievementCard, CoinDisplay.

### Step 4: Create Dashboard (2h)

4.1 Create `/src/components/gamification/GamificationDashboard.tsx`:
```tsx
'use client';

import { XPProgress } from './XPProgress';
import { StreakFlame } from './StreakFlame';
import { CoinDisplay } from './CoinDisplay';
import { AchievementCard } from './AchievementCard';
import { useGamificationStore } from '@/stores/gamification-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BADGES } from '@/config/gamification';

export function GamificationDashboard() {
  const { unlockedBadges, totalSessions, totalFocusMinutes } = useGamificationStore();

  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <StreakFlame size="lg" />
            <p className="text-sm text-muted-foreground mt-2">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <XPProgress />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CoinDisplay size="lg" />
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{totalSessions}</p>
            <p className="text-sm text-muted-foreground">Sessions Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{hours}h {mins}m</p>
            <p className="text-sm text-muted-foreground">Total Focus Time</p>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements ({unlockedBadges.length}/{Object.keys(BADGES).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(BADGES).map(([id, badge]) => (
              <AchievementCard
                key={id}
                badge={badge}
                unlocked={unlockedBadges.includes(id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 5: Integration (1h)

5.1 Update streak-tracker.tsx to use gamification store.

5.2 Hook timer completion to `completePomodoro()`.

5.3 Hook task completion to `completeTask()`.

5.4 Add dashboard route or modal.

## Todo

- [ ] Create gamification.ts config file
- [ ] Create gamification-store.ts
- [ ] Create XPProgress.tsx
- [ ] Create LevelBadge.tsx
- [ ] Create StreakFlame.tsx with 5 stages
- [ ] Create AchievementCard.tsx
- [ ] Create CoinDisplay.tsx
- [ ] Create GamificationDashboard.tsx
- [ ] Update streak-tracker.tsx to use new store
- [ ] Integrate completePomodoro with timer
- [ ] Integrate completeTask with task system
- [ ] Add dashboard to navigation
- [ ] Test XP progression curve
- [ ] Test badge unlock logic
- [ ] Test coin economy balance
- [ ] Migrate existing streak data

## Success Criteria

1. XP bar animates on earn, shows level and title
2. Streak flame changes stage at thresholds
3. Badges display with locked/unlocked states
4. Coin counter updates in real-time
5. Dashboard shows all stats accurately
6. Existing streak data migrates successfully

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data migration failure | Medium | High | Version localStorage, backup old data |
| XP curve too fast/slow | Medium | Medium | Make curve configurable, A/B test later |
| Badge spam fatigue | Low | Medium | Rate limit notifications |
| Economy imbalance | Medium | Low | Start conservative, iterate based on usage |

## Next Phase

[Phase 05: Theme Redesign](./phase-05-theme-redesign.md)
