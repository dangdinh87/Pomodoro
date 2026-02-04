'use client';

import { useState, Suspense, lazy, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import {
  X,
  Rocket,
  Gamepad2,
  Trophy,
  Layers,
  Grid3X3,
  Zap,
  Hash,
  Sparkles,
  Play,
  Keyboard,
  Mouse,
  Smartphone,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  color: string;
  storageKey: string;
  translationKey: string;
  controls: ('keyboard' | 'mouse' | 'touch')[];
}

const games: GameConfig[] = [
  {
    id: 'space-shooter',
    icon: Rocket,
    color: '#a855f7',
    storageKey: 'space-shooter-scores',
    translationKey: 'spaceShooter',
    controls: ['mouse', 'touch'],
  },
  {
    id: 'snake',
    icon: Zap,
    color: '#22c55e',
    storageKey: 'snake-scores',
    translationKey: 'snake',
    controls: ['keyboard', 'touch'],
  },
  {
    id: 'neon-flip',
    icon: Layers,
    color: '#f97316',
    storageKey: 'memory-match-scores',
    translationKey: 'memoryMatch',
    controls: ['mouse', 'touch'],
  },
  {
    id: 'game-2048',
    icon: Hash,
    color: '#f59e0b',
    storageKey: 'game-2048-scores',
    translationKey: 'game2048',
    controls: ['keyboard', 'touch'],
  },
  {
    id: 'tic-tac-toe',
    icon: Grid3X3,
    color: '#3b82f6',
    storageKey: 'tic-tac-toe-scores',
    translationKey: 'ticTacToe',
    controls: ['mouse', 'touch'],
  },
  {
    id: 'brick-breaker',
    icon: Sparkles,
    color: '#ec4899',
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
function GameLoadingScreen({ gameName, gameColor }: { gameName: string; gameColor: string }) {
  const { t } = useI18n();
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
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ backgroundColor: gameColor, left: `${particle.x}%` }}
            initial={{ y: '100vh', opacity: particle.opacity, scale: particle.scale }}
            animate={{
              y: '-10px',
              transition: { duration: particle.duration, repeat: Infinity, ease: 'linear', delay: particle.delay }
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div className="relative" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <div className="absolute inset-0 blur-2xl opacity-50" style={{ backgroundColor: gameColor }} />
          <div className="relative p-6 rounded-2xl" style={{ backgroundColor: `${gameColor}20` }}>
            <Gamepad2 className="w-16 h-16" style={{ color: gameColor }} />
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold text-white">{gameName}</h2>

        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: gameColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-white/60 text-sm" suppressHydrationWarning>
            {t(`entertainment.loadingStages.${loadingTextKey}`)}...
          </span>
          <span className="text-white font-mono text-lg">{progress}%</span>
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
    touch: { icon: Smartphone, labelKey: 'touch' },
  };

  const tips = t(`entertainment.games.${game.translationKey}.tips`);
  const hasTips = tips && !tips.includes('entertainment.games');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative w-full max-w-md bg-background backdrop-blur-md rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="relative p-5 sm:p-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: `${game.color}15` }}>
              <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: game.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate" suppressHydrationWarning>
                {t(`entertainment.games.${game.translationKey}.title`)}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1" suppressHydrationWarning>
                {t(`entertainment.games.${game.translationKey}.description`)}
              </p>
            </div>
          </div>

          {highScore > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="w-5 h-5 text-yellow-500 shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-yellow-600 dark:text-yellow-400 uppercase tracking-wide" suppressHydrationWarning>
                  {t('entertainment.yourBest')}
                </span>
                <p className="text-lg font-bold text-yellow-500">{highScore.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-4">
          {/* How to play */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wide flex items-center gap-2" suppressHydrationWarning>
              <Play className="w-4 h-4" />
              {t('entertainment.howToPlay')}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
              {t(`entertainment.games.${game.translationKey}.instructions`)}
            </p>
          </div>

          {/* Pro Tips */}
          {hasTips && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
              <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide flex items-center gap-2" suppressHydrationWarning>
                <Lightbulb className="w-4 h-4" />
                {t('entertainment.tips')}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300/80" suppressHydrationWarning>
                {tips}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide" suppressHydrationWarning>
              {t('entertainment.controls')}:
            </span>
            {game.controls.map(control => {
              const ControlIcon = controlIcons[control].icon;
              const label = t(`entertainment.controlTypes.${controlIcons[control].labelKey}`);
              return (
                <div
                  key={control}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/50"
                  title={label}
                >
                  <ControlIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground" suppressHydrationWarning>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Start button */}
          <Button
            onClick={onStart}
            className="w-full h-12 text-base font-semibold rounded-xl gap-2 mt-2"
            style={{ backgroundColor: game.color, color: 'white' }}
          >
            <Play className="w-5 h-5" />
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
    return <GameLoadingScreen gameName={gameName} gameColor={game.color} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 backdrop-blur-sm border border-white/10"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="w-full h-full">
        <Suspense fallback={<GameLoadingScreen gameName={gameName} gameColor={game.color} />}>
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

// Game card with better mobile support
interface GameCardProps {
  game: GameConfig;
  highScore: number;
  onClick: () => void;
}

function GameCard({ game, highScore, onClick }: GameCardProps) {
  const { t } = useI18n();
  const Icon = game.icon;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl",
        "border border-border/50 hover:border-border",
        "bg-card hover:bg-accent/50",
        "transition-all duration-200",
        "active:scale-95 sm:active:scale-100"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {highScore > 0 && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-yellow-500/10">
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span className="text-[10px] sm:text-xs font-medium text-yellow-500">{highScore}</span>
        </div>
      )}

      <div
        className="p-3 sm:p-4 rounded-xl mb-2 sm:mb-3 transition-transform group-hover:scale-110 duration-200"
        style={{ backgroundColor: `${game.color}15` }}
      >
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: game.color }} />
      </div>

      <span className="font-medium text-xs sm:text-sm text-center" suppressHydrationWarning>
        {t(`entertainment.games.${game.translationKey}.title`)}
      </span>
    </motion.button>
  );
}

export default function EntertainmentPage() {
  const [selectedGame, setSelectedGame] = useState<GameId>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [playingGame, setPlayingGame] = useState<GameId>(null);
  const { t } = useI18n();

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
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
            <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" suppressHydrationWarning>
              {t('entertainment.title')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground" suppressHydrationWarning>
              {t('entertainment.gamesCount', { count: games.length.toString() })}
            </p>
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
    </div>
  );
}
