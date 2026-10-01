'use client';

import Image from 'next/image';
import { Fire, Gear, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { Kbd } from '@/components/ui/kbd';
import { UserMenu } from '@/components/layout/user-menu';
import { isFeatureEnabled } from '@/config/feature-flags';
import { useI18n } from '@/contexts/i18n-context';
import { useAuth } from '@/hooks/use-auth';
import { useStats } from '@/hooks/use-stats';
import { openCommandPalette } from './command-palette';
import { openPanel } from './panel-store';

const ICON_BUTTON =
  'flex size-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand';

function StreakChip() {
  const { t } = useI18n();
  const { hasSession } = useAuth();
  const { data } = useStats(undefined);
  const streak = data?.summary.streak.current ?? 0;
  if (!hasSession || streak === 0 || !isFeatureEnabled('history')) return null;

  return (
    <button
      type="button"
      onClick={() => openPanel('stats')}
      aria-label={t('shell.streak', { count: streak })}
      className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 text-sm font-semibold tabular-nums text-ink backdrop-blur-md transition-colors hover:bg-surface-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Fire size={16} weight="fill" className="text-gold" aria-hidden="true" />
      {streak}
    </button>
  );
}

export function AppStatusBar() {
  const { t } = useI18n();

  return (
    <header
      data-chrome
      className="absolute inset-x-0 top-0 z-20 flex h-14 items-center gap-3 px-[clamp(16px,4vw,32px)] pt-[env(safe-area-inset-top)]"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Image src="/images/logo.png" alt="" width={26} height={26} className="size-[26px]" priority />
        <span className="font-heading text-[0.9375rem] font-bold tracking-[-0.02em] text-ink">{t('brand.title')}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <StreakChip />
        <button
          type="button"
          onClick={openCommandPalette}
          aria-label={t('shell.palette.open')}
          className="hidden h-9 items-center gap-2 rounded-full border border-border bg-surface/60 pl-3 pr-2 text-sm text-ink-muted backdrop-blur-md transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand sm:flex"
        >
          <MagnifyingGlass size={15} aria-hidden="true" />
          <span>{t('shell.palette.short')}</span>
          <Kbd>⌘K</Kbd>
        </button>
        <button type="button" onClick={openCommandPalette} aria-label={t('shell.palette.open')} className={`${ICON_BUTTON} sm:hidden`}>
          <MagnifyingGlass size={19} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => openPanel('settings')} aria-label={t('shell.panels.settings')} className={ICON_BUTTON}>
          <Gear size={19} aria-hidden="true" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
