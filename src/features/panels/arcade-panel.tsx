'use client';

import { useCallback, useEffect, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'motion/react';
import {
  Bomb,
  Clock,
  Crosshair,
  Cube,
  DeviceMobile,
  GameController,
  GridNine,
  Hash,
  Info,
  Keyboard,
  Lightbulb,
  Lightning,
  Mouse,
  Play,
  Rocket,
  Stack,
  Trophy,
  Wall,
  X,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { PageHeader, PanelBody } from '@/components/ui/page-header';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { useTimerStore } from '@/stores/timer-store';
import { GamePreview } from '@/components/entertainment/game-previews';
import { EMPTY_SCORES, readScores, recordScore, type GameScores } from '@/components/entertainment/game-scores';
import type { GameProps } from '@/components/entertainment/game-kit';

function GameLoading() {
  const { t } = useI18n();
  return (
    <div role="status" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-surface-page">
      <GameController size={40} className="text-ink-faint" />
      <span className="text-sm text-ink-muted" suppressHydrationWarning>
        {t('arcadeKit.loading')}
      </span>
    </div>
  );
}

const load = (loader: () => Promise<ComponentType<GameProps>>) => dynamic(loader, { ssr: false, loading: () => <GameLoading /> });

type GameId =
  | 'snake'
  | 'game-2048'
  | 'minesweeper'
  | 'stack'
  | 'typing-sprint'
  | 'aim-trainer'
  | 'brick-breaker'
  | 'space-shooter'
  | 'neon-flip'
  | 'tic-tac-toe';

const COMPONENTS: Record<GameId, ComponentType<GameProps>> = {
  snake: load(() => import('@/components/entertainment/snake-game').then((m) => m.SnakeGame)),
  'game-2048': load(() => import('@/components/entertainment/game-2048').then((m) => m.Game2048)),
  minesweeper: load(() => import('@/components/entertainment/minesweeper-game').then((m) => m.MinesweeperGame)),
  stack: load(() => import('@/components/entertainment/stack-game').then((m) => m.StackGame)),
  'typing-sprint': load(() => import('@/components/entertainment/typing-sprint-game').then((m) => m.TypingSprintGame)),
  'aim-trainer': load(() => import('@/components/entertainment/aim-trainer-game').then((m) => m.AimTrainerGame)),
  'brick-breaker': load(() => import('@/components/entertainment/brick-breaker-game').then((m) => m.BrickBreakerGame)),
  'space-shooter': load(() => import('@/components/entertainment/space-shooter-game').then((m) => m.SpaceShooterGame)),
  'neon-flip': load(() => import('@/components/entertainment/neon-flip-game').then((m) => m.NeonFlipGame)),
  'tic-tac-toe': load(() => import('@/components/entertainment/tic-tac-toe-game').then((m) => m.TicTacToeGame)),
};

type Category = 'action' | 'puzzle' | 'skill';
type Control = 'keyboard' | 'mouse' | 'touch';

interface GameConfig {
  id: GameId;
  icon: PhosphorIcon;
  storageKey: string;
  i18nKey: string;
  category: Category;
  minutes: number;
  controls: Control[];
}

const GAMES: GameConfig[] = [
  { id: 'snake', icon: Lightning, storageKey: 'snake-scores', i18nKey: 'snake', category: 'action', minutes: 3, controls: ['keyboard', 'touch'] },
  { id: 'game-2048', icon: Hash, storageKey: 'game-2048-scores', i18nKey: 'game2048', category: 'puzzle', minutes: 5, controls: ['keyboard', 'touch'] },
  { id: 'minesweeper', icon: Bomb, storageKey: 'minesweeper-scores', i18nKey: 'minesweeper', category: 'puzzle', minutes: 4, controls: ['mouse', 'touch'] },
  { id: 'stack', icon: Cube, storageKey: 'stack-scores', i18nKey: 'stack', category: 'skill', minutes: 2, controls: ['keyboard', 'mouse', 'touch'] },
  { id: 'typing-sprint', icon: Keyboard, storageKey: 'typing-sprint-scores', i18nKey: 'typingSprint', category: 'skill', minutes: 1, controls: ['keyboard'] },
  { id: 'aim-trainer', icon: Crosshair, storageKey: 'aim-trainer-scores', i18nKey: 'aimTrainer', category: 'skill', minutes: 1, controls: ['mouse', 'touch'] },
  { id: 'brick-breaker', icon: Wall, storageKey: 'brick-breaker-scores', i18nKey: 'brickBreaker', category: 'action', minutes: 4, controls: ['keyboard', 'mouse', 'touch'] },
  { id: 'space-shooter', icon: Rocket, storageKey: 'space-shooter-scores', i18nKey: 'spaceShooter', category: 'action', minutes: 3, controls: ['keyboard', 'mouse', 'touch'] },
  { id: 'neon-flip', icon: Stack, storageKey: 'memory-match-scores', i18nKey: 'memoryMatch', category: 'puzzle', minutes: 2, controls: ['mouse', 'touch'] },
  { id: 'tic-tac-toe', icon: GridNine, storageKey: 'tic-tac-toe-scores', i18nKey: 'ticTacToe', category: 'puzzle', minutes: 2, controls: ['mouse', 'touch'] },
];

const CATEGORIES: ('all' | Category)[] = ['all', 'action', 'puzzle', 'skill'];

const CONTROL_ICONS: Record<Control, PhosphorIcon> = { keyboard: Keyboard, mouse: Mouse, touch: DeviceMobile };

function MetaLine({ game }: { game: GameConfig }) {
  const { t } = useI18n();
  return (
    <span className="flex items-center gap-2 text-xs text-ink-muted" suppressHydrationWarning>
      <span>{t(`arcadeKit.category.${game.category}`)}</span>
      <span aria-hidden className="size-0.5 rounded-full bg-ink-faint" />
      <span className="inline-flex items-center gap-1">
        <Clock size={12} />
        {t('arcadeKit.minutes', { min: game.minutes })}
      </span>
    </span>
  );
}

function GameCard({ game, best, onClick }: { game: GameConfig; best: number; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-left',
        'transition-colors duration-150 hover:border-border-strong',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page',
      )}
    >
      <div className="border-b border-border bg-surface-raised px-4 py-3 transition-colors duration-150 group-hover:bg-surface-hover">
        <GamePreview id={game.id} className="mx-auto h-[72px] w-full max-w-[130px]" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        <h2 className="font-heading text-base font-bold leading-tight text-ink" suppressHydrationWarning>
          {t(`arcadeGames.${game.i18nKey}.title`)}
        </h2>
        <p className="line-clamp-2 text-[0.8125rem] leading-snug text-ink-muted" suppressHydrationWarning>
          {t(`arcadeGames.${game.i18nKey}.description`)}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2">
          <MetaLine game={game} />
          {best > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-ink-secondary" suppressHydrationWarning>
              <Trophy size={12} weight="fill" className="text-gold" />
              {best.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function InstructionSheet({ game, best, onStart, onClose }: { game: GameConfig; best: number; onStart: () => void; onClose: () => void }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const Icon = game.icon;

  // Captured on window so Esc closes this sheet, not the dialog the panel lives in.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <motion.div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t(`arcadeGames.${game.i18nKey}.title`)}
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-lg border border-border bg-surface sm:rounded-lg"
        initial={reduceMotion ? false : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('arcadeKit.close')}
          className="absolute right-3 top-3 rounded-md p-2 text-ink-muted transition-colors hover:bg-surface-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
        >
          <X size={18} />
        </button>

        <div className="border-b border-border bg-surface-raised px-6 py-4">
          <GamePreview id={game.id} className="mx-auto h-[84px] w-full max-w-[150px]" />
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Icon size={22} className="shrink-0 text-ink-secondary" />
              <h2 className="font-heading text-xl font-bold text-ink" suppressHydrationWarning>
                {t(`arcadeGames.${game.i18nKey}.title`)}
              </h2>
            </div>
            <MetaLine game={game} />
          </div>

          <section>
            <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink" suppressHydrationWarning>
              <Play size={13} weight="fill" className="text-ink-muted" />
              {t('arcadeKit.howToPlay')}
            </h3>
            <p className="text-sm leading-relaxed text-ink-secondary" suppressHydrationWarning>
              {t(`arcadeGames.${game.i18nKey}.instructions`)}
            </p>
          </section>

          <section>
            <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink" suppressHydrationWarning>
              <Lightbulb size={14} className="text-ink-muted" />
              {t('arcadeKit.tip')}
            </h3>
            <p className="text-sm leading-relaxed text-ink-secondary" suppressHydrationWarning>
              {t(`arcadeGames.${game.i18nKey}.tip`)}
            </p>
          </section>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink" suppressHydrationWarning>
              {t('arcadeKit.controls')}
            </span>
            {game.controls.map((control) => {
              const ControlIcon = CONTROL_ICONS[control];
              return (
                <span key={control} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-ink-secondary" suppressHydrationWarning>
                  <ControlIcon size={14} className="text-ink-muted" />
                  {t(`arcadeKit.control.${control}`)}
                </span>
              );
            })}
          </div>

          {best > 0 && (
            <p className="flex items-center gap-2 text-sm text-ink-secondary" suppressHydrationWarning>
              <Trophy size={16} weight="fill" className="text-gold" />
              {t('arcadeKit.yourBest', { score: best.toLocaleString() })}
            </p>
          )}

          <Button onClick={onStart} size="lg" className="w-full gap-2" autoFocus>
            <Play size={18} weight="fill" />
            <span suppressHydrationWarning>{t('arcadeKit.play')}</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function readAllScores(): Record<string, GameScores> {
  return Object.fromEntries(GAMES.map((g) => [g.id, readScores(g.storageKey)]));
}

export default function ArcadePanel() {
  const { t } = useI18n();
  const isFocusRunning = useTimerStore((s) => s.isRunning && s.mode === 'work');
  const [scores, setScores] = useState<Record<string, GameScores>>(readAllScores);
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [selected, setSelected] = useState<GameId | null>(null);
  const [playing, setPlaying] = useState<GameId | null>(null);

  const closeSheet = useCallback(() => setSelected(null), []);
  const closeGame = useCallback(() => setPlaying(null), []);

  const handleGameEnd = useCallback(
    (id: GameId, score: number) => {
      const game = GAMES.find((g) => g.id === id);
      if (!game) return;
      const next = recordScore(game.storageKey, score);
      setScores((prev) => ({ ...prev, [id]: next }));
    },
    [],
  );

  if (playing) {
    const Game = COMPONENTS[playing];
    return <Game best={(scores[playing] ?? EMPTY_SCORES).highScore} onGameEnd={(score) => handleGameEnd(playing, score)} onClose={closeGame} />;
  }

  const visible = GAMES.filter((g) => filter === 'all' || g.category === filter);
  const selectedGame = GAMES.find((g) => g.id === selected);

  return (
    <PanelBody>
      <PageHeader
        title={<span suppressHydrationWarning>{t('arcadeUi.title')}</span>}
        description={<span suppressHydrationWarning>{t('arcadeKit.subtitle')}</span>}
      />

      <p
        className="mb-5 flex items-start gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink-secondary"
        suppressHydrationWarning
      >
        <Info size={16} className="mt-0.5 shrink-0 text-ink-muted" />
        {isFocusRunning ? t('arcadeUi.runningNote') : t('arcadeKit.breakNote')}
      </p>

      <div role="group" aria-label={t('arcadeKit.filterLabel')} className="mb-5 flex flex-wrap gap-1.5">
        {CATEGORIES.map((category) => {
          const active = filter === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(category)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page',
                active ? 'border-transparent bg-primary text-primary-foreground' : 'border-border text-ink-secondary hover:bg-surface-hover',
              )}
              suppressHydrationWarning
            >
              {t(`arcadeKit.category.${category}`)}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {visible.map((game) => (
          <GameCard key={game.id} game={game} best={scores[game.id]?.highScore ?? 0} onClick={() => setSelected(game.id)} />
        ))}
      </div>

      {selectedGame && (
        <InstructionSheet
          game={selectedGame}
          best={scores[selectedGame.id]?.highScore ?? 0}
          onStart={() => {
            setPlaying(selectedGame.id);
            setSelected(null);
          }}
          onClose={closeSheet}
        />
      )}
    </PanelBody>
  );
}
