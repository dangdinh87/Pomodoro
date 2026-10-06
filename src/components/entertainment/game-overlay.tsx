'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowClockwise, ArrowLeft, Pause, Play, Trophy, X } from '@phosphor-icons/react/dist/ssr';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { IconTile } from '@/components/ui/icon-tile';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { ArcadeMiniTimer, ArcadePhaseNotice, useArcadePhaseNotice } from './arcade-mini-timer';
import type { GameSession } from './game-kit';

export interface FrameStat {
  label: string;
  value: ReactNode;
}

function StatChip({ label, value, strong }: FrameStat & { strong?: boolean }) {
  return (
    <div
      className={cn(
        'min-w-[3.25rem] rounded-[10px] border-2 border-outline px-2 py-0.5 text-center leading-tight',
        strong ? 'bg-candy-butter text-on-accent' : 'bg-surface text-ink',
      )}
    >
      <div className={cn('text-[0.6875rem] font-semibold', strong ? 'text-on-accent' : 'text-ink-muted')} suppressHydrationWarning>
        {label}
      </div>
      <div className="font-heading text-base font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

/** Filter-chip style pill group (accent fill when active) used for difficulty / size pickers in the ready overlay. */
export function OptionPills<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs font-semibold text-ink-muted" suppressHydrationWarning>
        {label}
      </span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap justify-center gap-1.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'focus-ring h-9 rounded-full border-2 border-outline px-3.5 font-heading text-[0.875rem] font-bold leading-none transition-[background-color,color,box-shadow,transform] duration-100 active:translate-y-px',
                active
                  ? 'bg-primary text-on-accent shadow-sticker-sm'
                  : 'bg-surface text-ink-secondary hover:bg-surface-hover hover:text-ink',
              )}
              suppressHydrationWarning
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Centered sticker card laid over the play area (also usable inside a game for custom states). */
export function GameOverlay({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      role="group"
      aria-label={title}
      className={cn('absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-surface-page/85 p-5', className)}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="sticker-lg my-auto flex w-full max-w-sm flex-col items-center gap-4 px-6 py-7 text-center"
        initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      >
        <h2 className="font-heading text-3xl font-extrabold leading-tight text-ink" suppressHydrationWarning>
          {title}
        </h2>
        {description && (
          <p className="text-sm leading-relaxed text-ink-secondary" suppressHydrationWarning>
            {description}
          </p>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
}

export function SummaryRow({ items }: { items: FrameStat[] }) {
  return (
    <div className="sticker-sm flex flex-wrap justify-center gap-x-6 gap-y-2 px-5 py-3">
      {items.map((item) => (
        <div key={item.label} className="text-center leading-tight">
          <div className="text-xs font-semibold text-ink-muted" suppressHydrationWarning>
            {item.label}
          </div>
          <div className="font-heading text-lg font-extrabold tabular-nums text-ink">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

interface GameFrameProps {
  title: string;
  icon: PhosphorIcon;
  description: string;
  hint: string;
  session: GameSession;
  /** Resets the game's own state; the frame then starts a run. */
  onRestart: () => void;
  /** Extra header stats after Score and Best. */
  stats?: FrameStat[];
  /** Hide the Score/Best chips (games that rank by something else still pass a score). */
  scoreLabel?: string;
  readyExtras?: ReactNode;
  overTitle?: string;
  overSummary?: ReactNode;
  /** Called instead of session.start() when the player presses Start (e.g. to apply picked options). */
  onStart?: () => void;
  children: ReactNode;
}

/**
 * Shared shell for every Arcade game: header (score, best, pause, restart, close),
 * play area, and the ready / paused / game over overlays.
 */
export function GameFrame({
  title,
  icon: Icon,
  description,
  hint,
  session,
  onRestart,
  stats = [],
  scoreLabel,
  readyExtras,
  overTitle,
  overSummary,
  onStart,
  children,
}: GameFrameProps) {
  const { t } = useI18n();
  const { status, score, finalScore, initialBest } = session;
  const best = Math.max(initialBest, score);
  const isNewBest = finalScore > 0 && finalScore > initialBest;
  const canPause = status === 'playing' || status === 'paused';
  // A phase change (break over, focus over) pauses the run and says so, instead of letting a
  // focus session start unnoticed underneath the game.
  const phase = useArcadePhaseNotice(session.pause);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-page pb-[env(safe-area-inset-bottom)]">
      <header className="flex min-h-14 shrink-0 items-center gap-2 border-b-[2.5px] border-outline bg-surface px-3 py-2 sm:px-5">
        <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
          <IconTile icon={Icon} tone="peach" size="sm" />
          <h1 className="truncate font-heading text-base font-extrabold text-ink" suppressHydrationWarning>
            {title}
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-start gap-2 sm:justify-center sm:gap-4">
          <StatChip label={scoreLabel ?? t('arcadeKit.score')} value={score.toLocaleString()} strong />
          <StatChip label={t('arcadeKit.best')} value={best.toLocaleString()} />
          {stats.map((s) => (
            <StatChip key={s.label} {...s} />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            className="size-9 sm:size-10"
            disabled={!canPause}
            onClick={(e) => {
              e.currentTarget.blur();
              (status === 'paused' ? session.resume : session.pause)();
            }}
            aria-label={status === 'paused' ? t('arcadeKit.resume') : t('arcadeKit.pause')}
          >
            {status === 'paused' ? <Play size={18} weight="fill" /> : <Pause size={18} weight="fill" />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="size-9 sm:size-10"
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            aria-label={t('arcadeKit.restart')}
          >
            <ArrowClockwise size={18} weight="bold" />
          </Button>
          <Button variant="secondary" size="icon" className="size-9 sm:size-10" onClick={session.close} aria-label={t('arcadeKit.close')}>
            <X size={18} weight="bold" />
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 items-center justify-between gap-2 border-b-2 border-border bg-surface-raised px-3 py-1.5 sm:px-5">
        <ArcadeMiniTimer />
      </div>

      {phase.changedTo && <ArcadePhaseNotice to={phase.changedTo} gamePaused={status === 'paused'} onDismiss={phase.dismiss} />}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {children}

        {status === 'ready' && (
          <GameOverlay title={title} description={description}>
            {readyExtras}
            <Button size="lg" className="min-w-40 gap-2" autoFocus onClick={onStart ?? session.start}>
              <Play size={18} weight="fill" />
              <span suppressHydrationWarning>{t('arcadeKit.start')}</span>
            </Button>
            <p className="text-xs text-ink-muted" suppressHydrationWarning>
              {hint}
            </p>
          </GameOverlay>
        )}

        {status === 'paused' && (
          <GameOverlay title={t('arcadeKit.paused')} description={t('arcadeKit.pausedHint')}>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="gap-2" autoFocus onClick={session.resume}>
                <Play size={18} weight="fill" />
                <span suppressHydrationWarning>{t('arcadeKit.resume')}</span>
              </Button>
              <Button size="lg" variant="secondary" className="gap-2" onClick={onRestart}>
                <ArrowClockwise size={18} weight="bold" />
                <span suppressHydrationWarning>{t('arcadeKit.restart')}</span>
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={session.close}>
              <ArrowLeft size={14} weight="bold" />
              <span suppressHydrationWarning>{t('arcadeKit.backToGames')}</span>
            </Button>
          </GameOverlay>
        )}

        {status === 'over' && (
          <GameOverlay title={overTitle ?? t('arcadeKit.gameOver')}>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-ink-muted" suppressHydrationWarning>
                {scoreLabel ?? t('arcadeKit.score')}
              </span>
              <span className="font-heading text-5xl font-extrabold tabular-nums text-ink">{finalScore.toLocaleString()}</span>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-ink-secondary" suppressHydrationWarning>
                <IconTile icon={Trophy} tone="butter" size="sm" />
                {isNewBest ? t('arcadeKit.newBest') : t('arcadeKit.bestIs', { score: Math.max(initialBest, finalScore).toLocaleString() })}
              </span>
            </div>
            {overSummary}
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="gap-2" autoFocus onClick={onRestart}>
                <ArrowClockwise size={18} weight="bold" />
                <span suppressHydrationWarning>{t('arcadeKit.playAgain')}</span>
              </Button>
              <Button size="lg" variant="secondary" className="gap-2" onClick={session.close}>
                <ArrowLeft size={16} weight="bold" />
                <span suppressHydrationWarning>{t('arcadeKit.backToGames')}</span>
              </Button>
            </div>
          </GameOverlay>
        )}
      </div>

      <p className="shrink-0 px-4 pb-2 pt-1 text-center text-xs text-ink-muted" suppressHydrationWarning>
        {hint}
      </p>
    </div>
  );
}

/* The stage object only carries refs to DOM nodes; they are attached, never read, during render. */
/* eslint-disable react-hooks/refs */
/** Canvas host: fills the play area and keeps the canvas fitted + crisp. */
export function GameCanvas({
  stage,
  className,
  canvasClassName,
  ...handlers
}: {
  stage: { containerRef: React.RefObject<HTMLDivElement | null>; canvasRef: React.RefObject<HTMLCanvasElement | null> };
  className?: string;
  canvasClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div ref={stage.containerRef} className={cn('flex min-h-0 flex-1 touch-none select-none items-center justify-center', className)} {...handlers}>
      <canvas ref={stage.canvasRef} className={cn('rounded-lg bg-surface ring-[2.5px] ring-outline shadow-sticker-sm', canvasClassName)} />
    </div>
  );
}
