'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowClockwise, ArrowLeft, Pause, Play, Trophy, X } from '@phosphor-icons/react/dist/ssr';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import type { GameSession } from './game-kit';

export interface FrameStat {
  label: string;
  value: ReactNode;
}

function StatChip({ label, value, strong }: FrameStat & { strong?: boolean }) {
  return (
    <div className="min-w-[36px] text-right leading-tight">
      <div className="text-[0.625rem] font-medium uppercase tracking-wide text-ink-muted" suppressHydrationWarning>
        {label}
      </div>
      <div className={cn('font-heading text-base font-bold tabular-nums', strong ? 'text-ink' : 'text-ink-secondary')}>{value}</div>
    </div>
  );
}

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

/** Filter-style pill group (filled when active) used for difficulty / size pickers in the ready overlay. */
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
      <span className="text-xs font-medium text-ink-muted" suppressHydrationWarning>
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
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page',
                active
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-transparent text-ink-secondary hover:bg-surface-hover',
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

/** Centered card of content laid over the play area (also usable inside a game for custom states). */
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
      className={cn('absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-surface-page/92 p-5', className)}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <div className="my-auto flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-ink" suppressHydrationWarning>
          {title}
        </h2>
        {description && (
          <p className="text-sm leading-relaxed text-ink-secondary" suppressHydrationWarning>
            {description}
          </p>
        )}
        {children}
      </div>
    </motion.div>
  );
}

export function SummaryRow({ items }: { items: FrameStat[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 rounded-lg border border-border bg-surface px-5 py-3">
      {items.map((item) => (
        <div key={item.label} className="text-center leading-tight">
          <div className="text-[0.6875rem] uppercase tracking-wide text-ink-muted" suppressHydrationWarning>
            {item.label}
          </div>
          <div className="font-heading text-lg font-bold tabular-nums text-ink">{item.value}</div>
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-page pb-[env(safe-area-inset-bottom)]">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 sm:px-5">
        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          <Icon size={20} className="shrink-0 text-ink-secondary" />
          <h1 className="truncate font-heading text-base font-bold text-ink" suppressHydrationWarning>
            {title}
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-start gap-3 sm:justify-center sm:gap-6">
          <StatChip label={scoreLabel ?? t('arcadeKit.score')} value={score.toLocaleString()} strong />
          <StatChip label={t('arcadeKit.best')} value={best.toLocaleString()} />
          {stats.map((s) => (
            <StatChip key={s.label} {...s} />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
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
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            aria-label={t('arcadeKit.restart')}
          >
            <ArrowClockwise size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={session.close} aria-label={t('arcadeKit.close')}>
            <X size={18} />
          </Button>
        </div>
      </header>

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
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="lg" className="gap-2" autoFocus onClick={session.resume}>
                <Play size={18} weight="fill" />
                <span suppressHydrationWarning>{t('arcadeKit.resume')}</span>
              </Button>
              <Button size="lg" variant="secondary" className="gap-2" onClick={onRestart}>
                <ArrowClockwise size={18} />
                <span suppressHydrationWarning>{t('arcadeKit.restart')}</span>
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={session.close}>
              <ArrowLeft size={14} />
              <span suppressHydrationWarning>{t('arcadeKit.backToGames')}</span>
            </Button>
          </GameOverlay>
        )}

        {status === 'over' && (
          <GameOverlay title={overTitle ?? t('arcadeKit.gameOver')}>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted" suppressHydrationWarning>
                {scoreLabel ?? t('arcadeKit.score')}
              </span>
              <span className="font-heading text-5xl font-bold tabular-nums text-ink">{finalScore.toLocaleString()}</span>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary" suppressHydrationWarning>
                <Trophy size={16} weight="fill" className="text-gold" />
                {isNewBest ? t('arcadeKit.newBest') : t('arcadeKit.bestIs', { score: Math.max(initialBest, finalScore).toLocaleString() })}
              </span>
            </div>
            {overSummary}
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="lg" className="gap-2" autoFocus onClick={onRestart}>
                <ArrowClockwise size={18} />
                <span suppressHydrationWarning>{t('arcadeKit.playAgain')}</span>
              </Button>
              <Button size="lg" variant="secondary" className="gap-2" onClick={session.close}>
                <ArrowLeft size={16} />
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
      <canvas ref={stage.canvasRef} className={cn('rounded-lg border border-border bg-surface', canvasClassName)} />
    </div>
  );
}
