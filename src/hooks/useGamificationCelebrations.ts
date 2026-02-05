'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGamificationStore } from '@/stores/gamification-store';
import { fireConfetti } from '@/components/animations';

interface CelebrationState {
  showLevelUp: boolean;
  levelUpLevel: number;
  showBadgeUnlock: boolean;
  unlockedBadgeIds: string[];
}

/**
 * Hook to manage gamification celebrations (level up, badge unlock)
 * Listens to gamification store changes and triggers appropriate animations
 */
export function useGamificationCelebrations() {
  const level = useGamificationStore((state) => state.level);
  const newBadges = useGamificationStore((state) => state.newBadges);
  const clearNewBadges = useGamificationStore((state) => state.clearNewBadges);

  const prevLevelRef = useRef(level);
  const [celebration, setCelebration] = useState<CelebrationState>({
    showLevelUp: false,
    levelUpLevel: 1,
    showBadgeUnlock: false,
    unlockedBadgeIds: [],
  });

  // Detect level up
  useEffect(() => {
    if (level > prevLevelRef.current && prevLevelRef.current > 0) {
      setCelebration((prev) => ({
        ...prev,
        showLevelUp: true,
        levelUpLevel: level,
      }));
    }
    prevLevelRef.current = level;
  }, [level]);

  // Detect new badges
  useEffect(() => {
    if (newBadges.length > 0) {
      // Trigger confetti for badge unlock
      fireConfetti({ intensity: 'medium' });

      setCelebration((prev) => ({
        ...prev,
        showBadgeUnlock: true,
        unlockedBadgeIds: newBadges,
      }));

      // Clear new badges from store after short delay
      const timeout = setTimeout(() => {
        clearNewBadges();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [newBadges, clearNewBadges]);

  const handleLevelUpComplete = useCallback(() => {
    setCelebration((prev) => ({
      ...prev,
      showLevelUp: false,
    }));
  }, []);

  const handleBadgeUnlockComplete = useCallback(() => {
    setCelebration((prev) => ({
      ...prev,
      showBadgeUnlock: false,
      unlockedBadgeIds: [],
    }));
  }, []);

  return {
    showLevelUp: celebration.showLevelUp,
    levelUpLevel: celebration.levelUpLevel,
    showBadgeUnlock: celebration.showBadgeUnlock,
    unlockedBadgeIds: celebration.unlockedBadgeIds,
    handleLevelUpComplete,
    handleBadgeUnlockComplete,
  };
}
