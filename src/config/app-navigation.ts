import { ChartBar, GameController, ListChecks, Timer } from '@phosphor-icons/react/dist/ssr';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

export type AppNavItem = {
  href: string;
  labelKey: string;
  icon: PhosphorIcon;
  /** Feature flag that must be on for the item to show (see src/config/feature-flags.ts). */
  flag?: 'history' | 'leaderboard' | 'chat';
};

export const APP_NAV: AppNavItem[] = [
  { href: '/timer', labelKey: 'nav.timer', icon: Timer },
  { href: '/tasks', labelKey: 'nav.tasks', icon: ListChecks },
  { href: '/history', labelKey: 'nav.history', icon: ChartBar, flag: 'history' },
  { href: '/entertainment', labelKey: 'nav.entertainment', icon: GameController },
];

export const isNavActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
