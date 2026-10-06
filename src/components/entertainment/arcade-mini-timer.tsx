'use client';

import { useEffect, useState } from 'react';
import { Pause, Timer } from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import { IconTile, type IconTileTone } from '@/components/ui/icon-tile';
import { useI18n } from '@/contexts/i18n-context';
import { closePanel } from '@/features/app-shell/panel-store';
import { cn } from '@/lib/utils';
import { formatClock } from '@/features/timer/components/clocks/clock-math';
import { useTimerStore, type TimerMode } from '@/stores/timer-store';

// Same colours the timer stage uses per phase (focus = tomato, short break = mint, long break = sky).
const PHASE_TONE: Record<TimerMode, IconTileTone> = { work: 'tomato', shortBreak: 'mint', longBreak: 'sky' };

/**
 * The timer lives under the arcade, so the arcade carries a small copy of it: current phase and the
 * time left in it (audit P2-12). Read-only; the engine keeps ticking the store.
 */
export function ArcadeMiniTimer({ className }: { className?: string }) {
  const { t } = useI18n();
  const mode = useTimerStore((s) => s.mode);
  const timeLeft = useTimerStore((s) => s.timeLeft);
  const isRunning = useTimerStore((s) => s.isRunning);

  const phase = t(`timer.modes.${mode}`);
  // Same mm:ss the timer shows
  const time = formatClock(timeLeft);

  return (
    <div
      role="timer"
      data-mode={mode}
      aria-label={t(isRunning ? 'arcadeUi.miniTimer.label' : 'arcadeUi.miniTimer.labelPaused', { phase, time })}
      className={cn('sticker-sm inline-flex items-center gap-2 py-1 pl-1 pr-3', className)}
    >
      <IconTile icon={Timer} tone={PHASE_TONE[mode]} size="sm" />
      <span aria-hidden="true" className="text-[0.8125rem] font-bold text-ink-secondary">
        {phase}
      </span>
      <span aria-hidden="true" className="min-w-[3.25rem] font-heading text-base font-extrabold tabular-nums text-ink">
        {time}
      </span>
      {!isRunning && <Pause size={14} weight="fill" aria-hidden="true" className="text-ink-muted" />}
    </div>
  );
}

/**
 * Tracks the timer phase while an arcade game is open. When it changes (a break ends and a focus
 * session starts, or the reverse), `pause` is called once so the game never keeps running under a
 * phase the player has not noticed, and `changedTo` holds the new phase until it is dismissed.
 */
export function useArcadePhaseNotice(pause: () => void) {
  const mode = useTimerStore((s) => s.mode);
  const [seenMode, setSeenMode] = useState(mode);
  const [changedTo, setChangedTo] = useState<TimerMode | null>(null);

  // Adjust state during render (not in an effect) so the notice and the pause land in the same commit.
  if (mode !== seenMode) {
    setSeenMode(mode);
    setChangedTo(mode);
  }

  useEffect(() => {
    if (changedTo) pause();
  }, [changedTo, pause]);

  return { changedTo, dismiss: () => setChangedTo(null) };
}

export function ArcadePhaseNotice({
  to,
  gamePaused,
  onDismiss,
}: {
  to: TimerMode;
  gamePaused: boolean;
  onDismiss: () => void;
}) {
  const { t } = useI18n();
  const message = to === 'work' ? t('arcadeUi.phaseChanged.toWork') : t('arcadeUi.phaseChanged.toBreak');

  return (
    <div
      role="status"
      data-phase={to}
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b-2 border-outline bg-warning-bg px-3 py-2 text-warning-ink sm:px-5"
    >
      <Timer size={20} weight="fill" aria-hidden="true" className="shrink-0" />
      <p className="min-w-0 flex-1 basis-48 text-sm font-semibold leading-snug">
        {message}
        {gamePaused && <> {t('arcadeUi.phaseChanged.gamePaused')}</>}
      </p>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" onClick={() => closePanel()}>
          {t('arcadeUi.phaseChanged.backToTimer')}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          {t('arcadeUi.phaseChanged.dismiss')}
        </Button>
      </div>
    </div>
  );
}
