'use client';

import { motion } from 'framer-motion';
import {
  Flame,
  Timer,
  Clock,
  Sun,
  Moon,
  Calendar,
  Star,
  Trophy,
  Lock,
} from 'lucide-react';
import {
  BADGES,
  BADGE_TIER_COLORS,
  type BadgeDefinition,
  type BadgeIcon,
} from '@/config/gamification';
import { useGamificationStore } from '@/stores/gamification-store';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ICON_MAP: Record<BadgeIcon, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  timer: Timer,
  clock: Clock,
  sun: Sun,
  moon: Moon,
  calendar: Calendar,
  star: Star,
  trophy: Trophy,
};

interface AchievementCardProps {
  badgeId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: {
    wrapper: 'w-12 h-12',
    icon: 'w-5 h-5',
    padding: 'p-2',
  },
  md: {
    wrapper: 'w-16 h-16',
    icon: 'w-7 h-7',
    padding: 'p-3',
  },
  lg: {
    wrapper: 'w-20 h-20',
    icon: 'w-9 h-9',
    padding: 'p-4',
  },
};

export function AchievementCard({
  badgeId,
  size = 'md',
  className,
}: AchievementCardProps) {
  const { unlockedBadges, badgeProgress } = useGamificationStore();
  const badge = BADGES[badgeId];

  if (!badge) return null;

  const isUnlocked = unlockedBadges.includes(badgeId);
  const progress = badgeProgress[badgeId] || 0;
  const progressPercent = Math.min((progress / badge.requirement) * 100, 100);
  const tierColors = BADGE_TIER_COLORS[badge.tier];
  const styles = sizeStyles[size];

  const IconComponent = ICON_MAP[badge.icon];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              'relative rounded-xl border-2 flex items-center justify-center',
              'transition-all cursor-pointer',
              styles.wrapper,
              styles.padding,
              isUnlocked
                ? cn(tierColors.bg, tierColors.border)
                : 'bg-muted/50 border-muted-foreground/20',
              className
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isUnlocked ? (
              <IconComponent
                className={cn(styles.icon, tierColors.text)}
              />
            ) : (
              <>
                <Lock className={cn(styles.icon, 'text-muted-foreground/50')} />
                {/* Progress ring */}
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted-foreground/10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${progressPercent * 2.83} 283`}
                    className="text-primary/50"
                  />
                </svg>
              </>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-semibold">{badge.nameVi}</p>
            <p className="text-xs text-muted-foreground">
              {badge.descriptionVi}
            </p>
            {!isUnlocked && (
              <p className="text-xs">
                Tiến độ: {progress}/{badge.requirement}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Grid component for displaying all badges
interface AchievementGridProps {
  category?: BadgeDefinition['category'];
  className?: string;
}

export function AchievementGrid({ category, className }: AchievementGridProps) {
  const badgeIds = Object.keys(BADGES).filter(
    (id) => !category || BADGES[id].category === category
  );

  return (
    <div
      className={cn(
        'grid grid-cols-4 sm:grid-cols-6 gap-2',
        className
      )}
    >
      {badgeIds.map((id) => (
        <AchievementCard key={id} badgeId={id} size="md" />
      ))}
    </div>
  );
}
