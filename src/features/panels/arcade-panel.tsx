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
  Warning,
  X,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip';
import { IconTile, type IconTileTone } from '@/components/ui/icon-tile';
import Loader from '@/components/ui/loader';
import { PageHeader, PanelBody } from '@/components/ui/page-header';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { useTimerStore } from '@/stores/timer-store';
import { ArcadeMiniTimer } from '@/components/entertainment/arcade-mini-timer';
import { GamePreview } from '@/components/entertainment/game-previews';
import { EMPTY_SCORES, readScores, recordScore, type GameScores } from '@/components/entertainment/game-scores';
import type { GameProps } from '@/components/entertainment/game-kit';

function GameLoading() {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-page">
      <Loader size="md" title={t('arcadeKit.loading')} subtitle="" />
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
  /** Candy colour of the game's icon tile (identity only). */
  tone: IconTileTone;
  storageKey: string;
  i18nKey: string;
  category: Category;
  minutes: number;
  controls: Control[];
}

const GAMES: GameConfig[] = [
  { id: 'snake', tone: 'mint', icon: Lightning, storageKey: 'snake-scores', i18nKey: 'snake', category: 'action', minutes: 3, controls: ['keyboard', 'touch'] },
  { id: 'game-2048', tone: 'butter', icon: Hash, storageKey: 'game-2048-scores', i18nKey: 'game2048', category: 'puzzle', minutes: 5, controls: ['keyboard', 'touch'] },
  { id: 'minesweeper', tone: 'sky', icon: Bomb, storageKey: 'minesweeper-scores', i18nKey: 'minesweeper', category: 'puzzle', minutes: 4, controls: ['mouse', 'touch'] },
  { id: 'stack', tone: 'lilac', icon: Cube, storageKey: 'stack-scores', i18nKey: 'stack', category: 'skill', minutes: 2, controls: ['keyboard', 'mouse', 'touch'] },
  { id: 'typing-sprint', tone: 'peach', icon: Keyboard, storageKey: 'typing-sprint-scores', i18nKey: 'typingSprint', category: 'skill', minutes: 1, controls: ['keyboard'] },
  { id: 'aim-trainer', tone: 'tomato', icon: Crosshair, storageKey: 'aim-trainer-scores', i18nKey: 'aimTrainer', category: 'skill', minutes: 1, controls: ['mouse', 'touch'] },
  { id: 'brick-breaker', tone: 'butter', icon: Wall, storageKey: 'brick-breaker-scores', i18nKey: 'brickBreaker', category: 'action', minutes: 4, controls: ['keyboard', 'mouse', 'touch'] },
  { id: 'space-shooter', tone: 'lilac', icon: Rocket, storageKey: 'space-shooter-scores', i18nKey: 'spaceShooter', category: 'action', minutes: 3, controls: ['keyboard', 'mouse', 'touch'] },
  { id: 'neon-flip', tone: 'peach', icon: Stack, storageKey: 'memory-match-scores', i18nKey: 'memoryMatch', category: 'puzzle', minutes: 2, controls: ['mouse', 'touch'] },
  { id: 'tic-tac-toe', tone: 'mint', icon: GridNine, storageKey: 'tic-tac-toe-scores', i18nKey: 'ticTacToe', category: 'puzzle', minutes: 2, controls: ['mouse', 'touch'] },
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
        <Clock size={12} aria-hidden />
        {t('arcadeKit.minutes', { min: game.minutes })}
      </span>
    </span>
  );
}

function BestPill({ score }: { score: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border-2 border-outline bg-candy-butter px-2 py-0.5 text-xs font-bold tabular-nums leading-none text-on-accent"
      suppressHydrationWarning
    >
      <Trophy size={12} weight="fill" aria-hidden />
      {score.toLocaleString()}
    </span>
  );
}

function GameCard({ game, best, onClick }: { game: GameConfig; best: number; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      className="sticker sticker-press focus-ring group flex h-full flex-col overflow-hidden text-left"
    >
      <div className="border-b-2 border-outline bg-surface-raised px-4 py-3 transition-colors duration-150 group-hover:bg-surface-hover">
        <GamePreview id={game.id} className="mx-auto h-[72px] w-full max-w-[130px] md:h-24 md:max-w-[170px]" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <IconTile icon={game.icon} tone={game.tone} size="sm" />
          <h2 className="line-clamp-2 min-w-0 break-words font-heading text-[0.9375rem] font-extrabold leading-tight text-ink sm:text-base" suppressHydrationWarning>
            {t(`arcadeGames.${game.i18nKey}.title`)}
          </h2>
        </div>
        <p className="line-clamp-2 text-[0.8125rem] leading-snug text-ink-muted" suppressHydrationWarning>
          {t(`arcadeGames.${game.i18nKey}.description`)}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-1">
          <MetaLine game={game} />
          {best > 0 && <BestPill score={best} />}
        </div>
      </div>
    </button>
  );
}

function InstructionSheet({ game, best, onStart, onClose }: { game: GameConfig; best: number; onStart: () => void; onClose: () => void }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

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
        className="absolute inset-0 bg-outline/60"
        onClick={onClose}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t(`arcadeGames.${game.i18nKey}.title`)}
        className="sticker-lg relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-b-none sm:rounded-b-xl"
        initial={reduceMotion ? false : { y: 24, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={onClose}
          aria-label={t('arcadeKit.close')}
          className="absolute right-3 top-3 z-10 size-9"
        >
          <X size={18} weight="bold" />
        </Button>

        <div className="border-b-2 border-outline bg-surface-raised px-6 py-4">
          <GamePreview id={game.id} className="mx-auto h-[84px] w-full max-w-[150px]" />
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <IconTile icon={game.icon} tone={game.tone} />
              <h2 className="font-heading text-2xl font-extrabold leading-tight text-ink" suppressHydrationWarning>
                {t(`arcadeGames.${game.i18nKey}.title`)}
              </h2>
            </div>
            <MetaLine game={game} />
          </div>

          <section>
            <h3 className="mb-1 flex items-center gap-1.5 font-heading text-[0.9375rem] font-bold text-ink" suppressHydrationWarning>
              <Play size={13} weight="fill" aria-hidden className="text-ink-muted" />
              {t('arcadeKit.howToPlay')}
            </h3>
            <p className="text-sm leading-relaxed text-ink-secondary" suppressHydrationWarning>
              {t(`arcadeGames.${game.i18nKey}.instructions`)}
            </p>
          </section>

          <section>
            <h3 className="mb-1 flex items-center gap-1.5 font-heading text-[0.9375rem] font-bold text-ink" suppressHydrationWarning>
              <Lightbulb size={14} weight="fill" aria-hidden className="text-ink-muted" />
              {t('arcadeKit.tip')}
            </h3>
            <p className="text-sm leading-relaxed text-ink-secondary" suppressHydrationWarning>
              {t(`arcadeGames.${game.i18nKey}.tip`)}
            </p>
          </section>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-[0.9375rem] font-bold text-ink" suppressHydrationWarning>
              {t('arcadeKit.controls')}
            </span>
            {game.controls.map((control) => {
              const ControlIcon = CONTROL_ICONS[control];
              return (
                <span key={control} className="inline-flex items-center gap-1.5 rounded-full border-2 border-outline bg-surface px-2.5 py-1 text-xs font-semibold text-ink-secondary" suppressHydrationWarning>
                  <ControlIcon size={14} aria-hidden />
                  {t(`arcadeKit.control.${control}`)}
                </span>
              );
            })}
          </div>

          {best > 0 && (
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-secondary" suppressHydrationWarning>
              <IconTile icon={Trophy} tone="butter" size="sm" />
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
        actions={<ArcadeMiniTimer />}
      />

      <p
        className={cn(
          'sticker-sm mb-6 flex items-start gap-2.5 px-4 py-3 text-sm font-semibold',
          isFocusRunning ? 'bg-warning-bg text-warning-ink' : 'bg-info-bg text-info-ink',
        )}
        suppressHydrationWarning
      >
        {isFocusRunning ? (
          <Warning size={18} weight="fill" aria-hidden className="mt-px shrink-0" />
        ) : (
          <Info size={18} weight="fill" aria-hidden className="mt-px shrink-0" />
        )}
        {isFocusRunning ? t('arcadeUi.runningNote') : t('arcadeKit.breakNote')}
      </p>

      <FilterChipGroup label={t('arcadeKit.filterLabel')} className="mb-6">
        {CATEGORIES.map((category) => (
          <FilterChip key={category} active={filter === category} onClick={() => setFilter(category)} suppressHydrationWarning>
            {t(`arcadeKit.category.${category}`)}
          </FilterChip>
        ))}
      </FilterChipGroup>

      <div className="grid grid-cols-2 gap-4 pb-1 pr-1 lg:grid-cols-3">
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
