'use client';

import { useState, useCallback, useEffect, memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { ArrowCounterClockwise, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { GameOverlay, GameStat } from './game-overlay';

interface Game2048Props {
  fullscreen?: boolean;
  onGameEnd?: (score: number) => void;
}

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

const GRID_SIZE = 4;
const TILE_SIZE = 80; // px for desktop
const GAP_SIZE = 8;

const TILE_COLORS: Record<number, { bg: string; text: string; glow?: string }> = {
  2: { bg: '#e2e8f0', text: '#1e293b' },
  4: { bg: '#cbd5e1', text: '#1e293b' },
  8: { bg: '#fdba74', text: '#ffffff', glow: '#fb923c' },
  16: { bg: '#fb923c', text: '#ffffff', glow: '#f97316' },
  32: { bg: '#f97316', text: '#ffffff', glow: '#ea580c' },
  64: { bg: '#ea580c', text: '#ffffff', glow: '#c2410c' },
  128: { bg: '#fbbf24', text: '#ffffff', glow: '#f59e0b' },
  256: { bg: '#f59e0b', text: '#ffffff', glow: '#d97706' },
  512: { bg: '#d97706', text: '#ffffff', glow: '#b45309' },
  1024: { bg: '#f59e0b', text: '#ffffff', glow: '#d97706' },
  2048: { bg: '#fbbf24', text: '#ffffff', glow: '#f59e0b' },
};

const getTileStyle = (value: number) => {
  if (TILE_COLORS[value]) return TILE_COLORS[value];
  return { bg: '#9333ea', text: '#ffffff', glow: '#7c3aed' };
};

let tileIdCounter = 0;
const getNextTileId = () => ++tileIdCounter;

export const Game2048 = memo(function Game2048({
  fullscreen = false,
  onGameEnd,
}: Game2048Props) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { t } = useI18n();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('game-2048-best');
      if (saved) setBestScore(parseInt(saved, 10));
    } catch {
      // Ignore
    }
  }, []);

  const getEmptyCells = useCallback((currentTiles: Tile[]): { row: number; col: number }[] => {
    const occupied = new Set(currentTiles.map(t => `${t.row}-${t.col}`));
    const empty: { row: number; col: number }[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!occupied.has(`${row}-${col}`)) {
          empty.push({ row, col });
        }
      }
    }
    return empty;
  }, []);

  const addRandomTile = useCallback((currentTiles: Tile[]): Tile[] => {
    const empty = getEmptyCells(currentTiles);
    if (empty.length === 0) return currentTiles;

    const { row, col } = empty[Math.floor(Math.random() * empty.length)];
    const newTile: Tile = {
      id: getNextTileId(),
      value: Math.random() < 0.9 ? 2 : 4,
      row,
      col,
      isNew: true,
    };

    return [...currentTiles, newTile];
  }, [getEmptyCells]);

  const initGame = useCallback(() => {
    tileIdCounter = 0;
    let newTiles: Tile[] = [];
    newTiles = addRandomTile(newTiles);
    newTiles = addRandomTile(newTiles);
    setTiles(newTiles);
    setScore(0);
    setIsGameOver(false);
    setIsWon(false);
    setIsStarted(true);
  }, [addRandomTile]);

  const checkWin = useCallback((currentTiles: Tile[]): boolean => {
    return currentTiles.some(t => t.value === 2048);
  }, []);

  const checkGameOver = useCallback((currentTiles: Tile[]): boolean => {
    if (getEmptyCells(currentTiles).length > 0) return false;

    // Check for possible merges
    for (const tile of currentTiles) {
      const neighbors = currentTiles.filter(
        t => (Math.abs(t.row - tile.row) === 1 && t.col === tile.col) ||
             (Math.abs(t.col - tile.col) === 1 && t.row === tile.row)
      );
      if (neighbors.some(n => n.value === tile.value)) return false;
    }

    return true;
  }, [getEmptyCells]);

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver || isAnimating) return;

    setIsAnimating(true);

    setTiles(prevTiles => {
      // Clear animation flags
      let currentTiles = prevTiles.map(t => ({ ...t, isNew: false, isMerged: false }));

      // Get direction vectors
      const vectors: Record<string, { row: number; col: number }> = {
        left: { row: 0, col: -1 },
        right: { row: 0, col: 1 },
        up: { row: -1, col: 0 },
        down: { row: 1, col: 0 },
      };
      const vector = vectors[direction];

      // Determine traversal order
      const rowOrder = direction === 'down' ? [3, 2, 1, 0] : [0, 1, 2, 3];
      const colOrder = direction === 'right' ? [3, 2, 1, 0] : [0, 1, 2, 3];

      let moved = false;
      let totalPoints = 0;
      const mergedPositions = new Set<string>();

      // Process each cell in order
      for (const row of rowOrder) {
        for (const col of colOrder) {
          const tile = currentTiles.find(t => t.row === row && t.col === col);
          if (!tile) continue;

          // Find farthest position
          let newRow = row;
          let newCol = col;

          while (true) {
            const nextRow = newRow + vector.row;
            const nextCol = newCol + vector.col;

            // Check bounds
            if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) break;

            // Check if occupied
            const blocking = currentTiles.find(t => t.row === nextRow && t.col === nextCol && t.id !== tile.id);

            if (!blocking) {
              newRow = nextRow;
              newCol = nextCol;
            } else if (blocking.value === tile.value && !mergedPositions.has(`${nextRow}-${nextCol}`)) {
              // Merge!
              newRow = nextRow;
              newCol = nextCol;
              break;
            } else {
              break;
            }
          }

          if (newRow !== row || newCol !== col) {
            moved = true;

            // Check if merging with another tile
            const targetTile = currentTiles.find(t => t.row === newRow && t.col === newCol && t.id !== tile.id);

            if (targetTile && targetTile.value === tile.value) {
              // Merge
              totalPoints += tile.value * 2;
              mergedPositions.add(`${newRow}-${newCol}`);

              // Remove both tiles, create new merged tile
              currentTiles = currentTiles.filter(t => t.id !== tile.id && t.id !== targetTile.id);
              currentTiles.push({
                id: getNextTileId(),
                value: tile.value * 2,
                row: newRow,
                col: newCol,
                isNew: false,
                isMerged: true,
              });
            } else {
              // Just move
              tile.row = newRow;
              tile.col = newCol;
            }
          }
        }
      }

      if (!moved) {
        setTimeout(() => setIsAnimating(false), 50);
        return prevTiles;
      }

      // Add new tile after animation
      setTimeout(() => {
        setTiles(current => {
          const withNew = addRandomTile(current.map(t => ({ ...t, isNew: false, isMerged: false })));

          // Check game state
          if (!isWon && checkWin(withNew)) {
            setIsWon(true);
          }
          if (checkGameOver(withNew)) {
            setIsGameOver(true);
            onGameEnd?.(score + totalPoints);
          }

          setIsAnimating(false);
          return withNew;
        });
      }, 150);

      // Update score
      if (totalPoints > 0) {
        setScore(prev => {
          const newScore = prev + totalPoints;
          if (newScore > bestScore) {
            setBestScore(newScore);
            try {
              localStorage.setItem('game-2048-best', newScore.toString());
            } catch {
              // Ignore
            }
          }
          return newScore;
        });
      }

      return currentTiles;
    });
  }, [isGameOver, isAnimating, isWon, addRandomTile, checkWin, checkGameOver, bestScore, onGameEnd, score]);

  // Keyboard controls
  useEffect(() => {
    if (!isStarted || isGameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          move('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          move('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, isGameOver, move]);

  // Touch controls
  useEffect(() => {
    if (!isStarted || isGameOver) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      const minSwipeDistance = 50;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) move('right');
          else move('left');
        }
      } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) move('down');
          else move('up');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isStarted, isGameOver, move]);

  const tileSize = fullscreen ? 72 : 64;
  const gapSize = 8;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden",
        fullscreen ? "w-full h-full p-4" : "w-full h-[600px] rounded-lg p-4"
      )}
      style={{ background: '#16213e' }}
    >
      {!isStarted && (
        <GameOverlay title="2048" description={t('entertainment.games.game2048.instructions')}>
          <Button onClick={initGame} size="lg" suppressHydrationWarning>
            {t('entertainment.playNow')}
          </Button>
        </GameOverlay>
      )}

      {isStarted && (
        <>
          {/* Score display */}
          <div className={cn(
            "w-full max-w-md flex justify-between items-center mb-4",
            fullscreen ? "px-4" : ""
          )}>
            <div className="flex gap-3">
              <GameStat label={t('entertainment.games.game2048.score')} value={score} />
              <GameStat label={t('entertainment.games.game2048.best')} value={bestScore} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={initGame}
              className="border border-white/10 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white rounded-md w-9 h-9"
              aria-label={t('entertainment.controls.restart')}
            >
              <ArrowCounterClockwise size={16} />
            </Button>
          </div>

          {/* Game grid */}
          <div
            ref={containerRef}
            className="relative bg-gray-900/80 p-2 rounded-xl shadow-2xl"
            style={{
              width: GRID_SIZE * tileSize + (GRID_SIZE + 1) * gapSize,
              height: GRID_SIZE * tileSize + (GRID_SIZE + 1) * gapSize,
            }}
          >
            {/* Background grid cells */}
            {Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, i) => (
              <div
                key={i}
                className="absolute bg-gray-800/50 rounded-lg"
                style={{
                  width: tileSize,
                  height: tileSize,
                  left: gapSize + (i % GRID_SIZE) * (tileSize + gapSize),
                  top: gapSize + Math.floor(i / GRID_SIZE) * (tileSize + gapSize),
                }}
              />
            ))}

            {/* Animated tiles */}
            {tiles.map(tile => {
              const style = getTileStyle(tile.value);
              return (
                <div
                  key={tile.id}
                  className={cn(
                    "absolute rounded-lg flex items-center justify-center font-bold transition-all duration-150 ease-out",
                    tile.isNew && "animate-pop",
                    tile.isMerged && "animate-merge"
                  )}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    left: gapSize + tile.col * (tileSize + gapSize),
                    top: gapSize + tile.row * (tileSize + gapSize),
                    backgroundColor: style.bg,
                    color: style.text,
                    fontSize: tile.value >= 1000 ? '1.1rem' : tile.value >= 100 ? '1.4rem' : '1.6rem',
                    boxShadow: style.glow ? `0 0 20px ${style.glow}40` : undefined,
                    zIndex: tile.isMerged ? 10 : 1,
                  }}
                >
                  {tile.value}
                </div>
              );
            })}
          </div>

          {/* Mobile controls */}
          <div className={cn(
            "flex flex-col items-center gap-2 mt-4",
            fullscreen ? "" : "md:hidden"
          )}>
            <Button
              variant="ghost"
              size="icon"
              className="w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-xl"
              onClick={() => move('up')}
              aria-label={t('entertainment.controls.up')}
            >
              <ArrowUp size={20} />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                onClick={() => move('left')}
                aria-label={t('entertainment.controls.left')}
              >
                <ArrowLeft size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                onClick={() => move('down')}
                aria-label={t('entertainment.controls.down')}
              >
                <ArrowDown size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                onClick={() => move('right')}
                aria-label={t('entertainment.controls.right')}
              >
                <ArrowRight size={20} />
              </Button>
            </div>
          </div>

          {isWon && !isGameOver && (
            <GameOverlay title={t('entertainment.games.game2048.youWin')} description={t('entertainment.games.game2048.keepGoing')}>
              <div className="flex gap-3">
                <Button onClick={() => setIsWon(false)} size="lg">
                  {t('entertainment.games.game2048.continue')}
                </Button>
                <Button variant="outline" onClick={initGame} size="lg">
                  {t('entertainment.games.game2048.newGame')}
                </Button>
              </div>
            </GameOverlay>
          )}

          {isGameOver && (
            <GameOverlay title={t('entertainment.gameOver')}>
              <GameStat label={t('entertainment.games.game2048.score')} value={score} className="min-w-[120px] py-3" />
              <Button onClick={initGame} size="lg">
                {t('entertainment.games.game2048.newGame')}
              </Button>
            </GameOverlay>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes merge {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.2s ease-out;
        }
        .animate-merge {
          animation: merge 0.2s ease-out;
        }
      `}</style>
    </div>
  );
});
