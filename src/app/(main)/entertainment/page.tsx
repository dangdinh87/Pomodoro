'use client';

import { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { X, Rocket, Gamepad2, Trophy, Layers, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy load game components to reduce initial bundle size
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

type GameId = 'space-shooter' | 'neon-flip' | 'tic-tac-toe' | null;

const games = [
  {
    id: 'space-shooter' as const,
    icon: Rocket,
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
    storageKey: 'space-shooter-scores',
    translationKey: 'spaceShooter',
  },
  {
    id: 'neon-flip' as const,
    icon: Layers,
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    bgPattern: 'radial-gradient(circle at 30% 70%, rgba(251, 191, 36, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)',
    storageKey: 'memory-match-scores',
    translationKey: 'memoryMatch',
  },
  {
    id: 'tic-tac-toe' as const,
    icon: Grid3X3,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    bgPattern: 'radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)',
    storageKey: 'tic-tac-toe-scores',
    translationKey: 'ticTacToe',
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

function FullscreenGameLoader() {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-cyan-900/20" />
        {/* Animated stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${(i * 0.1) % 2}s`,
              opacity: 0.3 + (i % 5) * 0.1,
            }}
          />
        ))}
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50 animate-pulse" />
          <Rocket className="relative w-20 h-20 text-cyan-400 animate-bounce" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 bg-fuchsia-400 rounded-full animate-bounce" />
          </div>
          <p className="text-gray-400 text-lg" suppressHydrationWarning>
            {t('entertainment.loading')}
          </p>
        </div>
      </div>
    </div>
  );
}

interface FullscreenGameProps {
  gameId: 'space-shooter' | 'neon-flip' | 'tic-tac-toe';
  onClose: () => void;
  onScoreUpdate: (score: number) => void;
}

function FullscreenGame({ gameId, onClose, onScoreUpdate }: FullscreenGameProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate minimum loading time for smooth transition
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return <FullscreenGameLoader />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 backdrop-blur-sm border border-white/10"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Game container */}
      <div className="w-full h-full">
        <Suspense fallback={<FullscreenGameLoader />}>
          {gameId === 'space-shooter' && (
            <SpaceShooterGame onGameEnd={onScoreUpdate} fullscreen />
          )}
          {gameId === 'neon-flip' && (
            <NeonFlipGame onGameEnd={onScoreUpdate} fullscreen />
          )}
          {gameId === 'tic-tac-toe' && (
            <TicTacToeGame onGameEnd={onScoreUpdate} fullscreen />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default function EntertainmentPage() {
  const [selectedGame, setSelectedGame] = useState<GameId>(null);
  const { t } = useI18n();
  const [spaceShooterScores, updateSpaceShooterScore] = useGameScores('space-shooter-scores');
  const [memoryMatchScores, updateMemoryMatchScore] = useGameScores('memory-match-scores');
  const [ticTacToeScores, updateTicTacToeScore] = useGameScores('tic-tac-toe-scores');

  const handleCloseGame = useCallback(() => {
    setSelectedGame(null);
  }, []);

  const handleScoreUpdate = useCallback((gameId: GameId, score: number) => {
    if (gameId === 'space-shooter') {
      updateSpaceShooterScore(score);
    } else if (gameId === 'neon-flip') {
      updateMemoryMatchScore(score);
    } else if (gameId === 'tic-tac-toe') {
      updateTicTacToeScore(score);
    }
  }, [updateSpaceShooterScore, updateMemoryMatchScore, updateTicTacToeScore]);

  // Fullscreen game mode
  if (selectedGame) {
    return (
      <FullscreenGame
        gameId={selectedGame}
        onClose={handleCloseGame}
        onScoreUpdate={(score) => handleScoreUpdate(selectedGame, score)}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Gamepad2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold" suppressHydrationWarning>
            {t('entertainment.title')}
          </h1>
        </div>
        <p className="text-muted-foreground" suppressHydrationWarning>
          {t('entertainment.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const Icon = game.icon;
          const scores = game.id === 'space-shooter'
            ? spaceShooterScores
            : game.id === 'neon-flip'
              ? memoryMatchScores
              : game.id === 'tic-tac-toe'
                ? ticTacToeScores
                : { highScore: 0, lastScore: 0 };

          return (
            <Card
              key={game.id}
              className={cn(
                "group cursor-pointer overflow-hidden border-0",
                "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
                "hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300",
                "hover:-translate-y-1"
              )}
              onClick={() => setSelectedGame(game.id)}
            >
              {/* Game Preview Area */}
              <div
                className="relative h-40 overflow-hidden"
                style={{ background: game.bgPattern }}
              >
                {/* Animated stars background */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[10%] top-[20%] opacity-60" />
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[25%] top-[60%] opacity-80 [animation-delay:0.3s]" />
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[40%] top-[30%] opacity-50 [animation-delay:0.6s]" />
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[55%] top-[70%] opacity-70 [animation-delay:0.9s]" />
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[70%] top-[15%] opacity-60 [animation-delay:1.2s]" />
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[85%] top-[45%] opacity-80 [animation-delay:1.5s]" />
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[15%] top-[80%] opacity-50 [animation-delay:0.2s]" />
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[60%] top-[40%] opacity-70 [animation-delay:0.8s]" />
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[80%] top-[75%] opacity-60 [animation-delay:1.1s]" />
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse left-[35%] top-[85%] opacity-80 [animation-delay:1.4s]" />
                </div>

                {/* Floating icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn(
                    "p-4 rounded-2xl bg-gradient-to-br",
                    game.gradient,
                    "shadow-lg shadow-purple-500/30",
                    "group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                  )}>
                    <Icon className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-white mb-1" suppressHydrationWarning>
                  {t(`entertainment.games.${game.translationKey}.title`)}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2" suppressHydrationWarning>
                  {t(`entertainment.games.${game.translationKey}.description`)}
                </p>

                {/* High Score */}
                <div className="flex items-center gap-1.5 mb-4 text-sm text-yellow-400">
                  <Trophy className="h-4 w-4" />
                  <span className="text-gray-300">{scores.highScore}</span>
                </div>

                {/* Play button with animation */}
                <Button
                  className={cn(
                    "w-full bg-gradient-to-r relative overflow-hidden text-white",
                    game.gradient,
                    "border-0 font-semibold",
                    "group-hover:shadow-lg group-hover:shadow-purple-500/30",
                    "transition-all duration-300"
                  )}
                  suppressHydrationWarning
                >
                  {/* Animated shine effect on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10">{t('entertainment.playNow')}</span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
