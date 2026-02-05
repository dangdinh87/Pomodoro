'use client';

import { useGamificationCelebrations } from '@/hooks/useGamificationCelebrations';
import { LevelUpCelebration } from '@/components/animations';

interface GamificationCelebrationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that renders gamification celebrations globally
 * Wrap your app with this to enable level up celebrations and badge unlock notifications
 */
export function GamificationCelebrationProvider({
  children,
}: GamificationCelebrationProviderProps) {
  const { showLevelUp, levelUpLevel, handleLevelUpComplete } =
    useGamificationCelebrations();

  return (
    <>
      {children}
      <LevelUpCelebration
        show={showLevelUp}
        level={levelUpLevel}
        onComplete={handleLevelUpComplete}
      />
    </>
  );
}
