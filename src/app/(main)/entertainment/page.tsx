'use client';

import { useState, Suspense, lazy, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { X, Rocket, GameController, Trophy, Stack, GridNine, Lightning, Hash, Wall, Play, Keyboard, Mouse, DeviceMobile, Lightbulb, Info } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { PageContainer, PageHeader } from '@/components/ui/page-header';
import { useTimerStore } from '@/stores/timer-store';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

// Lazy load game components
const SpaceShooterGame = lazy(() =>
  import('@/components/entertainment/space-shooter-game').then(mod => ({
    default: mod.SpaceShooterGame
  }))
);

const NeonFlipGame = lazy(() =>
  import('@/components/entertainment/neon-flip-game').then(mod => ({
    default: mod.NeonFlipGame
  }))
);

const TicTacToeGame = lazy(() =>
  import('@/components/entertainment/tic-tac-toe-game').then(mod => ({
    default: mod.TicTacToeGame
  }))
);

const SnakeGame = lazy(() =>
  import('@/components/entertainment/snake-game').then(mod => ({
    default: mod.SnakeGame
  }))
);

const Game2048 = lazy(() =>
  import('@/components/entertainment/game-2048').then(mod => ({
    default: mod.Game2048
  }))
);

const BrickBreakerGame = lazy(() =>
  import('@/components/entertainment/brick-breaker-game').then(mod => ({
    default: mod.BrickBreakerGame
  }))
);

type GameId = 'space-shooter' | 'neon-flip' | 'tic-tac-toe' | 'snake' | 'game-2048' | 'brick-breaker' | null;

interface GameConfig {
  id: NonNullable<GameId>;
  icon: React.ElementType;
  storageKey: string;
  translationKey: string;
  controls: ('keyboard' | 'mouse' | 'touch')[];
}

const games: GameConfig[] = [
  {
    id: 'space-shooter',
    icon: Rocket,
    storageKey: 'space-shooter-scores',
    translationKey: 'spaceShooter',
    controls: ['mouse', 'touch'],
  },
  {
    id: 'snake',
    icon: Lightning,
    storageKey: 'snake-scores',
    translationKey: 'snake',
    controls: ['keyboard', 'touch'],
  },
  {
    id: 'neon-flip',
    icon: Stack,
    storageKey: 'memory-match-scores',
    translationKey: 'memoryMatch',
    controls: ['mouse', 'touch'],
  },
  {
    id: 'game-2048',
    icon: Hash,
    storageKey: 'game-2048-scores',
    translationKey: 'game2048',
    controls: ['keyboard', 'touch'],
  },
  {
    id: 'tic-tac-toe',
    icon: GridNine,
    storageKey: 'tic-tac-toe-scores',
    translationKey: 'ticTacToe',
    controls: ['mouse', 'touch'],
  },
  {
    id: 'brick-breaker',
    icon: Wall,
    storageKey: 'brick-breaker-scores',
    translationKey: 'brickBreaker',
    controls: ['keyboard', 'mouse', 'touch'],
  },
];

interface GameScores {
  highScore: number;
  lastScore: number;
}

function useGameScores(storageKey: string): [GameScores, (score: number) => void] {
  const [scores, setScores] = useState<GameScores>({ highScore: 0, lastScore: 0 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setScores(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey]);

  const updateScore = useCallback((newScore: number) => {
    setScores(prev => {
      const updated = {
        lastScore: newScore,
        highScore: Math.max(prev.highScore, newScore),
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  }, [storageKey]);

  return [scores, updateScore];
}

// Dynamic loading screen with real progress
function GameLoadingScreen({ gameName }: { gameName: string }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [loadingTextKey, setLoadingTextKey] = useState('initializing');
  const [particles, setParticles] = useState<Array<{ x: number; opacity: number; scale: number; duration: number; delay: number }>>([]);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * 100,
      opacity: 0.3 + Math.random() * 0.5,
      scale: 0.5 + Math.random() * 1,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const loadingStages = [
      { threshold: 15, key: 'loadingAssets' },
      { threshold: 35, key: 'preparingGraphics' },
      { threshold: 55, key: 'settingUpControls' },
      { threshold: 75, key: 'almostReady' },
      { threshold: 90, key: 'startingGame' },
    ];

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(95, Math.floor(100 * (1 - Math.exp(-elapsed / 400))));
      setProgress(newProgress);

      for (const stage of loadingStages) {
        if (newProgress >= stage.threshold) {
          setLoadingTextKey(stage.key);
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-surface-page flex flex-col items-center justify-center overflow-hidden">
      {!reduceMotion && (
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-ink-faint"
              style={{ left: `${particle.x}%` }}
              initial={{ y: '100vh', opacity: particle.opacity, scale: particle.scale }}
              animate={{
                y: '-10px',
                transition: { duration: particle.duration, repeat: Infinity, ease: 'linear', delay: particle.delay }
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <GameController size={48} className="text-ink-secondary" />

        <h2 className="font-heading text-2xl font-bold text-ink">{gameName}</h2>

        <div className="w-64 h-1.5 bg-surface-raised rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-ink-muted text-sm" suppressHydrationWarning>
            {t(`entertainment.loadingStages.${loadingTextKey}`)}...
          </span>
          <span className="text-ink font-mono text-lg tabular-nums">{progress}%</span>
        </div>
      </motion.div>
    </div>
  );
}

// Enhanced Game instruction popup with tips
interface GameInstructionPopupProps {
  game: GameConfig;
  highScore: number;
  onStart: () => void;
  onClose: () => void;
}

function GameInstructionPopup({ game, highScore, onStart, onClose }: GameInstructionPopupProps) {
  const { t } = useI18n();
  const Icon = game.icon;

  const controlIcons = {
    keyboard: { icon: Keyboard, labelKey: 'keyboard' },
    mouse: { icon: Mouse, labelKey: 'mouse' },
    touch: { icon: DeviceMobile, labelKey: 'touch' },
  };

  const tips = t(`entertainment.games.${game.translationKey}.tips`);
  const hasTips = tips && !tips.includes('entertainment.games');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative w-full max-w-md bg-surface rounded-lg border border-border shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)] overflow-hidden max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="relative p-5 sm:p-6">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-md hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            <X size={20} className="text-ink-muted" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <Icon size={28} className="text-ink-secondary shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink truncate" suppressHydrationWarning>
                {t(`entertainment.games.${game.translationKey}.title`)}
              </h2>
              <p className="text-sm text-ink-muted mt-0.5 line-clamp-1" suppressHydrationWarning>
                {t(`entertainment.games.${game.translationKey}.description`)}
              </p>
            </div>
          </div>

          {highScore > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-md bg-surface-raised">
              <Trophy size={20} className="text-gold shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-medium text-ink-muted" suppressHydrationWarning>
                  {t('entertainment.yourBest')}
                </span>
                <p className="font-heading text-lg font-bold tabular-nums text-ink">{highScore.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-4">
          {/* How to play */}
          <div className="bg-surface-raised rounded-md p-4">
            <h3 className="text-sm font-semibold text-ink mb-1.5 flex items-center gap-2" suppressHydrationWarning>
              <Play size={14} weight="fill" className="text-ink-muted" />
              {t('entertainment.howToPlay')}
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed" suppressHydrationWarning>
              {t(`entertainment.games.${game.translationKey}.instructions`)}
            </p>
          </div>

          {/* Pro Tips */}
          {hasTips && (
            <div className="bg-surface-raised rounded-md p-4">
              <h3 className="text-sm font-semibold text-ink mb-1.5 flex items-center gap-2" suppressHydrationWarning>
                <Lightbulb size={14} className="text-ink-muted" />
                {t('entertainment.tips')}
              </h3>
              <p className="text-sm text-ink-secondary" suppressHydrationWarning>
                {tips}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink" suppressHydrationWarning>
              {t('entertainment.controls.title')}
            </span>
            {game.controls.map(control => {
              const ControlIcon = controlIcons[control].icon;
              const label = t(`entertainment.controlTypes.${controlIcons[control].labelKey}`);
              return (
                <div
                  key={control}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border"
                  title={label}
                >
                  <ControlIcon className="w-3.5 h-3.5 text-ink-muted" />
                  <span className="text-xs text-ink-secondary" suppressHydrationWarning>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Start button */}
          <Button
            onClick={onStart}
            size="lg"
            className="w-full gap-2 mt-2"
          >
            <Play size={18} weight="fill" />
            <span suppressHydrationWarning>{t('entertainment.startGame')}</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Fullscreen game wrapper
interface FullscreenGameProps {
  gameId: NonNullable<GameId>;
  onClose: () => void;
  onScoreUpdate: (score: number) => void;
}

function FullscreenGame({ gameId, onClose, onScoreUpdate }: FullscreenGameProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const game = games.find(g => g.id === gameId)!;
  const { t } = useI18n();
  const gameName = t(`entertainment.games.${game.translationKey}.title`);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return <GameLoadingScreen gameName={gameName} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Button
        variant="secondary"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-50"
        aria-label={t('common.close')}
      >
        <X size={20} />
      </Button>

      <div className="w-full h-full">
        <Suspense fallback={<GameLoadingScreen gameName={gameName} />}>
          {gameId === 'space-shooter' && <SpaceShooterGame onGameEnd={onScoreUpdate} fullscreen />}
          {gameId === 'neon-flip' && <NeonFlipGame onGameEnd={onScoreUpdate} fullscreen />}
          {gameId === 'tic-tac-toe' && <TicTacToeGame onGameEnd={onScoreUpdate} fullscreen />}
          {gameId === 'snake' && <SnakeGame onGameEnd={onScoreUpdate} fullscreen />}
          {gameId === 'game-2048' && <Game2048 onGameEnd={onScoreUpdate} fullscreen />}
          {gameId === 'brick-breaker' && <BrickBreakerGame onGameEnd={onScoreUpdate} fullscreen />}
        </Suspense>
      </div>
    </div>
  );
}

interface GameCardProps {
  game: GameConfig;
  highScore: number;
  onClick: () => void;
}

function GameCard({ game, highScore, onClick }: GameCardProps) {
  const { t } = useI18n();
  const Icon = game.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-full flex-col items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left sm:p-5',
        'transition-colors duration-150 hover:border-border-strong hover:bg-surface-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page'
      )}
    >
      <Icon size={28} className="text-ink-secondary" />
      <div className="min-w-0 flex-1 space-y-1">
        <h2 className="font-heading text-base font-bold leading-tight text-ink" suppressHydrationWarning>
          {t(`entertainment.games.${game.translationKey}.title`)}
        </h2>
        <p className="line-clamp-3 text-[0.8125rem] leading-snug text-ink-muted" suppressHydrationWarning>
          {t(`entertainment.games.${game.translationKey}.description`)}
        </p>
      </div>
      {highScore > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-ink-secondary" suppressHydrationWarning>
          <Trophy size={12} weight="fill" className="text-gold" />
          {t('arcadeUi.best', { score: highScore.toLocaleString() })}
        </span>
      )}
    </button>
  );
}

export default function EntertainmentPage() {
  const [selectedGame, setSelectedGame] = useState<GameId>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [playingGame, setPlayingGame] = useState<GameId>(null);
  const { t } = useI18n();
  const isFocusRunning = useTimerStore((s) => s.isRunning && s.mode === 'work');

  // Game scores hooks
  const [spaceShooterScores, updateSpaceShooterScore] = useGameScores('space-shooter-scores');
  const [memoryMatchScores, updateMemoryMatchScore] = useGameScores('memory-match-scores');
  const [ticTacToeScores, updateTicTacToeScore] = useGameScores('tic-tac-toe-scores');
  const [snakeScores, updateSnakeScore] = useGameScores('snake-scores');
  const [game2048Scores, updateGame2048Score] = useGameScores('game-2048-scores');
  const [brickBreakerScores, updateBrickBreakerScore] = useGameScores('brick-breaker-scores');

  const handleGameClick = useCallback((gameId: NonNullable<GameId>) => {
    setSelectedGame(gameId);
    setShowInstructions(true);
  }, []);

  const handleStartGame = useCallback(() => {
    setShowInstructions(false);
    setPlayingGame(selectedGame);
  }, [selectedGame]);

  const handleCloseInstructions = useCallback(() => {
    setShowInstructions(false);
    setSelectedGame(null);
  }, []);

  const handleCloseGame = useCallback(() => {
    setPlayingGame(null);
    setSelectedGame(null);
  }, []);

  const handleScoreUpdate = useCallback((gameId: GameId, score: number) => {
    switch (gameId) {
      case 'space-shooter': updateSpaceShooterScore(score); break;
      case 'neon-flip': updateMemoryMatchScore(score); break;
      case 'tic-tac-toe': updateTicTacToeScore(score); break;
      case 'snake': updateSnakeScore(score); break;
      case 'game-2048': updateGame2048Score(score); break;
      case 'brick-breaker': updateBrickBreakerScore(score); break;
    }
  }, [updateSpaceShooterScore, updateMemoryMatchScore, updateTicTacToeScore, updateSnakeScore, updateGame2048Score, updateBrickBreakerScore]);

  const getHighScore = (gameId: GameId): number => {
    switch (gameId) {
      case 'space-shooter': return spaceShooterScores.highScore;
      case 'neon-flip': return memoryMatchScores.highScore;
      case 'tic-tac-toe': return ticTacToeScores.highScore;
      case 'snake': return snakeScores.highScore;
      case 'game-2048': return game2048Scores.highScore;
      case 'brick-breaker': return brickBreakerScores.highScore;
      default: return 0;
    }
  };

  if (playingGame) {
    return (
      <FullscreenGame
        gameId={playingGame}
        onClose={handleCloseGame}
        onScoreUpdate={(score) => handleScoreUpdate(playingGame, score)}
      />
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={<span suppressHydrationWarning>{t('arcadeUi.title')}</span>}
        description={<span suppressHydrationWarning>{t('arcadeUi.description')}</span>}
      />

      {isFocusRunning && (
        <p
          className="mb-5 flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink-secondary"
          suppressHydrationWarning
        >
          <Info size={16} className="shrink-0 text-ink-muted" />
          {t('arcadeUi.runningNote')}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            highScore={getHighScore(game.id)}
            onClick={() => handleGameClick(game.id)}
          />
        ))}
      </div>

      {/* Instruction Popup */}
      <AnimatePresence>
        {showInstructions && selectedGame && (
          <GameInstructionPopup
            game={games.find(g => g.id === selectedGame)!}
            highScore={getHighScore(selectedGame)}
            onStart={handleStartGame}
            onClose={handleCloseInstructions}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
