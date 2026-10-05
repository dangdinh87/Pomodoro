'use client';

import { Gear, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { Logo } from '@/components/brand/logo';
import { Tomo } from '@/components/brand/tomo';
import { Kbd } from '@/components/ui/kbd';
import { StreakPill } from '@/components/ui/streak-pill';
import { UserMenu } from '@/components/layout/user-menu';
import { isFeatureEnabled } from '@/config/feature-flags';
import { useI18n } from '@/contexts/i18n-context';
import { useAuth } from '@/hooks/use-auth';
import { useStats } from '@/hooks/use-stats';
import { studyTodayDate } from '@/lib/stats/study-day';
import { openCommandPalette } from './command-palette';
import { modShortcut } from './platform';
import { openPanel } from './panel-store';

// Small sticker controls: outlined, hard shadow, hover lifts 1px and press sinks (see .sticker-press).
const CHIP =
  'sticker-sm sticker-press focus-ring inline-flex items-center rounded-full font-heading font-extrabold text-ink';
const ICON_BUTTON = `${CHIP} size-9 justify-center`;

/** Streak and today's sessions come from the same stats the Stats panel shows; guests with no session get none. */
function useProgress(): { streak: number; sessions: number } | null {
  const { hasSession } = useAuth();
  // The study day starts at 04:00; recomputed per render so it rolls over without a reload (same as DailyProgress).
  const today = studyTodayDate();
  const { data } = useStats({ from: today, to: today });
  if (!hasSession || !isFeatureEnabled('history')) return null;
  return { streak: data?.summary.streak.current ?? 0, sessions: data?.summary.completedSessions ?? 0 };
}

function ProgressPills({ progress }: { progress: { streak: number; sessions: number } | null }) {
  const { t } = useI18n();
  if (!progress) return null;

  const { streak, sessions } = progress;
  const sessionsLabel = t(sessions === 1 ? 'shell.sessionsTodayOne' : 'shell.sessionsToday', { count: sessions });

  return (
    <>
      {streak > 0 && (
        <button
          type="button"
          onClick={() => openPanel('stats')}
          aria-label={t('shell.streak', { count: streak })}
          className="focus-ring rounded-full transition-transform duration-100 hover:-translate-y-px active:translate-y-px"
        >
          <StreakPill count={streak} />
        </button>
      )}
      <button
        type="button"
        data-testid="sessions-today"
        onClick={() => openPanel('stats')}
        aria-label={sessionsLabel}
        className={`${CHIP} h-8 gap-1.5 pl-1.5 pr-3 text-base`}
      >
        <Tomo face="happy" size={20} tight className="shrink-0" />
        <span aria-hidden="true" className="tabular-nums sm:hidden">
          {sessions}
        </span>
        <span aria-hidden="true" className="max-sm:hidden">
          {sessionsLabel}
        </span>
      </button>
    </>
  );
}

export function AppStatusBar() {
  const { t } = useI18n();
  const progress = useProgress();

  return (
    <header
      data-chrome
      className="absolute inset-x-0 top-0 z-20 flex h-16 items-center gap-3 px-[clamp(16px,4vw,32px)] pt-[env(safe-area-inset-top)]"
    >
      <div className="flex min-w-0 items-center gap-2">
        {/* Logo + streak pill + sessions pill + search + account need ~340px: on a 360px phone the wordmark gives
            way to Tomo (still read out) instead of wrapping to two lines. With fewer pills the name fits. */}
        <Logo size={28} wordmarkClassName={progress && progress.streak > 0 ? 'max-[379px]:sr-only' : undefined} />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ProgressPills progress={progress} />
        <button
          type="button"
          onClick={openCommandPalette}
          aria-label={t('shell.palette.open')}
          className={`${CHIP} h-9 gap-2 pl-3 pr-2 text-sm max-sm:hidden`}
        >
          <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
          <span className="font-body font-bold text-ink-secondary">{t('shell.palette.short')}</span>
          <Kbd>{modShortcut('K')}</Kbd>
        </button>
        <button type="button" onClick={openCommandPalette} aria-label={t('shell.palette.open')} className={`${ICON_BUTTON} sm:hidden`}>
          <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => openPanel('settings')}
          aria-label={t('shell.panels.settings')}
          className={`${ICON_BUTTON} max-sm:hidden`}
        >
          <Gear size={18} weight="bold" aria-hidden="true" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
