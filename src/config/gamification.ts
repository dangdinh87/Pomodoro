// Gamification Configuration
// XP, Levels, Streaks, Badges, Coins

// =============================================================================
// XP CONFIGURATION
// =============================================================================

export const XP_CONFIG = {
  pomodoroComplete: 10,
  taskComplete: 5,
  dailyStreak: 20,
  weeklyGoal: 50,
  achievementBase: 25, // multiplied by rarity
} as const;

// Exponential level curve: 20-30% increase per level
export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

export function getLevelFromXP(totalXP: number): { level: number; currentXP: number; xpForNextLevel: number } {
  let level = 1;
  let accumulated = 0;
  let xpNeeded = calculateXPForLevel(level);

  while (accumulated + xpNeeded <= totalXP) {
    accumulated += xpNeeded;
    level++;
    xpNeeded = calculateXPForLevel(level);
  }

  return {
    level,
    currentXP: totalXP - accumulated,
    xpForNextLevel: xpNeeded,
  };
}

// =============================================================================
// LEVEL TITLES
// =============================================================================

export const LEVEL_TITLES = [
  { min: 1, max: 5, title: 'Rookie Pup', titleVi: 'Cún Con' },
  { min: 6, max: 10, title: 'Study Apprentice', titleVi: 'Học Viên' },
  { min: 11, max: 20, title: 'Focus Warrior', titleVi: 'Chiến Binh Tập Trung' },
  { min: 21, max: 30, title: 'Productivity Pro', titleVi: 'Chuyên Gia' },
  { min: 31, max: 50, title: 'Master Scholar', titleVi: 'Bậc Thầy' },
  { min: 51, max: Infinity, title: 'Legendary Bro', titleVi: 'Huyền Thoại' },
] as const;

export function getLevelTitle(level: number, locale: 'en' | 'vi' = 'vi'): string {
  const tier = LEVEL_TITLES.find((t) => level >= t.min && level <= t.max);
  return tier ? (locale === 'vi' ? tier.titleVi : tier.title) : LEVEL_TITLES[0].title;
}

// =============================================================================
// STREAK STAGES
// =============================================================================

export type StreakStage = 'spark' | 'small' | 'medium' | 'large' | 'inferno';

export const STREAK_STAGES: Record<StreakStage, { min: number; max: number; color: string; label: string; labelVi: string }> = {
  spark: { min: 1, max: 7, color: '#FB923C', label: 'Spark', labelVi: 'Tia Lửa' },
  small: { min: 8, max: 14, color: '#F97316', label: 'Small Flame', labelVi: 'Lửa Nhỏ' },
  medium: { min: 15, max: 30, color: '#EA580C', label: 'Medium Flame', labelVi: 'Lửa Vừa' },
  large: { min: 31, max: 60, color: '#DC2626', label: 'Large Flame', labelVi: 'Lửa Lớn' },
  inferno: { min: 61, max: Infinity, color: '#7C3AED', label: 'Inferno', labelVi: 'Địa Ngục' },
};

export function getStreakStage(days: number): StreakStage {
  if (days <= 0) return 'spark';
  const entry = Object.entries(STREAK_STAGES).find(
    ([, stage]) => days >= stage.min && days <= stage.max
  );
  return (entry?.[0] as StreakStage) || 'spark';
}

// =============================================================================
// BADGES / ACHIEVEMENTS
// =============================================================================

export type BadgeTier = 'bronze' | 'silver' | 'gold';
export type BadgeIcon = 'flame' | 'timer' | 'clock' | 'sun' | 'moon' | 'calendar' | 'star' | 'trophy';

export interface BadgeDefinition {
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  tier: BadgeTier;
  icon: BadgeIcon;
  requirement: number;
  category: 'streak' | 'sessions' | 'time' | 'special';
}

export const BADGES: Record<string, BadgeDefinition> = {
  // Streak badges
  streak_7: {
    name: 'Week Warrior',
    nameVi: 'Chiến Binh Tuần',
    description: '7-day streak',
    descriptionVi: 'Streak 7 ngày',
    tier: 'bronze',
    icon: 'flame',
    requirement: 7,
    category: 'streak',
  },
  streak_30: {
    name: 'Monthly Master',
    nameVi: 'Bậc Thầy Tháng',
    description: '30-day streak',
    descriptionVi: 'Streak 30 ngày',
    tier: 'silver',
    icon: 'flame',
    requirement: 30,
    category: 'streak',
  },
  streak_100: {
    name: 'Century Champion',
    nameVi: 'Nhà Vô Địch Thế Kỷ',
    description: '100-day streak',
    descriptionVi: 'Streak 100 ngày',
    tier: 'gold',
    icon: 'flame',
    requirement: 100,
    category: 'streak',
  },

  // Session badges
  sessions_10: {
    name: 'Getting Started',
    nameVi: 'Khởi Đầu',
    description: 'Complete 10 sessions',
    descriptionVi: 'Hoàn thành 10 phiên',
    tier: 'bronze',
    icon: 'timer',
    requirement: 10,
    category: 'sessions',
  },
  sessions_100: {
    name: 'Focus Centurion',
    nameVi: 'Chiến Binh Tập Trung',
    description: 'Complete 100 sessions',
    descriptionVi: 'Hoàn thành 100 phiên',
    tier: 'silver',
    icon: 'timer',
    requirement: 100,
    category: 'sessions',
  },
  sessions_1000: {
    name: 'Pomodoro Legend',
    nameVi: 'Huyền Thoại Pomodoro',
    description: 'Complete 1000 sessions',
    descriptionVi: 'Hoàn thành 1000 phiên',
    tier: 'gold',
    icon: 'timer',
    requirement: 1000,
    category: 'sessions',
  },

  // Time badges (hours)
  hours_10: {
    name: 'Dedicated',
    nameVi: 'Tận Tâm',
    description: '10 hours of focus',
    descriptionVi: '10 giờ tập trung',
    tier: 'bronze',
    icon: 'clock',
    requirement: 10,
    category: 'time',
  },
  hours_100: {
    name: 'Committed',
    nameVi: 'Cam Kết',
    description: '100 hours of focus',
    descriptionVi: '100 giờ tập trung',
    tier: 'silver',
    icon: 'clock',
    requirement: 100,
    category: 'time',
  },
  hours_1000: {
    name: 'Time Lord',
    nameVi: 'Chúa Tể Thời Gian',
    description: '1000 hours of focus',
    descriptionVi: '1000 giờ tập trung',
    tier: 'gold',
    icon: 'clock',
    requirement: 1000,
    category: 'time',
  },

  // Special badges
  early_bird: {
    name: 'Early Bird',
    nameVi: 'Chim Sớm',
    description: '5 sessions before 8am',
    descriptionVi: '5 phiên trước 8 giờ sáng',
    tier: 'bronze',
    icon: 'sun',
    requirement: 5,
    category: 'special',
  },
  night_owl: {
    name: 'Night Owl',
    nameVi: 'Cú Đêm',
    description: '5 sessions after 10pm',
    descriptionVi: '5 phiên sau 10 giờ tối',
    tier: 'bronze',
    icon: 'moon',
    requirement: 5,
    category: 'special',
  },
  weekend_warrior: {
    name: 'Weekend Warrior',
    nameVi: 'Chiến Binh Cuối Tuần',
    description: '10 weekend sessions',
    descriptionVi: '10 phiên cuối tuần',
    tier: 'silver',
    icon: 'calendar',
    requirement: 10,
    category: 'special',
  },
};

export const BADGE_TIER_COLORS: Record<BadgeTier, { bg: string; border: string; text: string }> = {
  bronze: { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  silver: { bg: 'bg-slate-100 dark:bg-slate-800/50', border: 'border-slate-400', text: 'text-slate-600 dark:text-slate-300' },
  gold: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-500', text: 'text-yellow-700 dark:text-yellow-400' },
};

// =============================================================================
// COIN ECONOMY
// =============================================================================

export const COIN_REWARDS = {
  pomodoroComplete: 2,
  taskComplete: 1,
  dailyStreak: 5,
  badgeBronze: 10,
  badgeSilver: 25,
  badgeGold: 50,
} as const;

export const SHOP_ITEMS = {
  streakFreeze: { name: 'Streak Freeze', nameVi: 'Đóng Băng Streak', cost: 200, type: 'consumable' as const },
  doubleXP: { name: 'Double XP (24h)', nameVi: 'Gấp Đôi XP (24h)', cost: 150, type: 'consumable' as const },
} as const;

export type ShopItemId = keyof typeof SHOP_ITEMS;
