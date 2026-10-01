import { ChartBar, GameController, ListChecks, Timer } from '@phosphor-icons/react/dist/ssr';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { isFeatureEnabled, type Feature } from '@/config/feature-flags';

export type AppNavItem = {
  href: string;
  labelKey: string;
  icon: PhosphorIcon;
  /** Feature flag that must be on for the item to show. */
  flag?: Feature;
};

export const APP_NAV: AppNavItem[] = [
  { href: '/timer', labelKey: 'nav.timer', icon: Timer },
  { href: '/tasks', labelKey: 'nav.tasks', icon: ListChecks },
  { href: '/history', labelKey: 'nav.history', icon: ChartBar, flag: 'history' },
  { href: '/entertainment', labelKey: 'nav.entertainment', icon: GameController },
];

export const getVisibleNav = () => APP_NAV.filter((item) => !item.flag || isFeatureEnabled(item.flag));

export const isNavActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
