'use client';

import { motion } from 'framer-motion';
import { Clock, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { useGamificationStore } from '@/stores/gamification-store';
import { BADGES } from '@/config/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XPProgress } from './XPProgress';
import { StreakFlame } from './StreakFlame';
import { LevelBadge } from './LevelBadge';
import { CoinDisplay } from './CoinDisplay';
import { AchievementGrid } from './AchievementCard';
import { cn } from '@/lib/utils';

interface GamificationDashboardProps {
  className?: string;
}

export function GamificationDashboard({ className }: GamificationDashboardProps) {
  const {
    totalSessions,
    totalFocusMinutes,
    totalTasksCompleted,
    unlockedBadges,
    longestStreak,
  } = useGamificationStore();

  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  const totalBadges = Object.keys(BADGES).length;

  const stats = [
    {
      label: 'Phiên hoàn thành',
      value: totalSessions,
      icon: Target,
      color: 'text-primary',
    },
    {
      label: 'Thời gian tập trung',
      value: `${hours}h ${mins}m`,
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      label: 'Task hoàn thành',
      value: totalTasksCompleted,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: 'Streak cao nhất',
      value: `${longestStreak} ngày`,
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Top Row: Level, XP, Streak, Coins */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LevelBadge size="lg" showTitle />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <XPProgress showLabel showLevel />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <StreakFlame size="lg" />
            <p className="text-xs text-muted-foreground mt-2">Streak hiện tại</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <CoinDisplay size="lg" />
            <p className="text-xs text-muted-foreground mt-2">Coins</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thống kê</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon
                  className={cn('w-6 h-6 mx-auto mb-2', stat.color)}
                />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Thành tựu</span>
            <span className="text-sm font-normal text-muted-foreground">
              {unlockedBadges.length}/{totalBadges}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AchievementGrid />
        </CardContent>
      </Card>
    </div>
  );
}

// Compact version for sidebar or widgets
export function GamificationWidget({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <LevelBadge size="sm" />
        <StreakFlame size="sm" />
        <CoinDisplay size="sm" />
      </div>
      <XPProgress size="sm" showLabel={false} showLevel={false} />
    </div>
  );
}
