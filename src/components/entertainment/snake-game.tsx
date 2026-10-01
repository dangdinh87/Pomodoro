'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Lightning, Skull } from '@phosphor-icons/react/dist/ssr';
import { GameOverlay, GameStat } from './game-overlay';

interface SnakeGameProps {
  fullscreen?: boolean;
  onGameEnd?: (score: number) => void;
}

interface Point {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Bigger cells for better visibility
const CELL_SIZE = 28;
const GRID_COLS = 16;
const GRID_ROWS = 14;

// Level configuration
const LEVEL_CONFIG = [
  { speed: 180, obstacles: 0, name: 'Level 1' },
  { speed: 150, obstacles: 3, name: 'Level 2' },
  { speed: 130, obstacles: 5, name: 'Level 3' },
  { speed: 110, obstacles: 7, name: 'Level 4' },
  { speed: 90, obstacles: 10, name: 'Level 5' },
  { speed: 75, obstacles: 12, name: 'Level 6' },
  { speed: 60, obstacles: 15, name: 'MAX' },
];

const POINTS_PER_LEVEL = 50;

export const SnakeGame = memo(function SnakeGame({
  fullscreen = false,
  onGameEnd,
}: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');

  // Game state refs for performance (avoids re-renders on every tick)
  const snakeRef = useRef<Point[]>([{ x: 5, y: 7 }]);
  const foodRef = useRef<Point>({ x: 10, y: 7 });
  const obstaclesRef = useRef<Point[]>([]);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);

  // UI state
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [obstacleCount, setObstacleCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const { t } = useI18n();

  const generateFood = useCallback((currentSnake: Point[], currentObstacles: Point[]): Point => {
    const occupied = new Set([
      ...currentSnake.map(s => `${s.x}-${s.y}`),
      ...currentObstacles.map(o => `${o.x}-${o.y}`),
    ]);

    let newFood: Point;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_COLS),
        y: Math.floor(Math.random() * GRID_ROWS),
      };
      attempts++;
    } while (occupied.has(`${newFood.x}-${newFood.y}`) && attempts < 100);

    return newFood;
  }, []);

  const generateObstacles = useCallback((count: number, currentSnake: Point[], currentFood: Point): Point[] => {
    const newObstacles: Point[] = [];
    const occupied = new Set([
      ...currentSnake.map(s => `${s.x}-${s.y}`),
      `${currentFood.x}-${currentFood.y}`,
    ]);

    // Exclude safe zone around snake head (3x3 area)
    const head = currentSnake[0];
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        occupied.add(`${head.x + dx}-${head.y + dy}`);
      }
    }

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let point: Point;
      do {
        point = {
          x: Math.floor(Math.random() * GRID_COLS),
          y: Math.floor(Math.random() * GRID_ROWS),
        };
        attempts++;
      } while (occupied.has(`${point.x}-${point.y}`) && attempts < 50);

      if (attempts < 50) {
        newObstacles.push(point);
        occupied.add(`${point.x}-${point.y}`);
      }
    }

    return newObstacles;
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = GRID_COLS * CELL_SIZE;
    const height = GRID_ROWS * CELL_SIZE;

    // Use refs directly for drawing
    const snake = snakeRef.current;
    const food = foodRef.current;
    const obstacles = obstaclesRef.current;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, height);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(width, y * CELL_SIZE);
      ctx.stroke();
    }

    // Draw obstacles
    obstacles.forEach(obs => {
      ctx.fillStyle = '#64748b';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#475569';

      const x = obs.x * CELL_SIZE + 3;
      const y = obs.y * CELL_SIZE + 3;
      const size = CELL_SIZE - 6;

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, 4);
      ctx.fill();

      // X pattern on obstacle
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 5);
      ctx.lineTo(x + size - 5, y + size - 5);
      ctx.moveTo(x + size - 5, y + 5);
      ctx.lineTo(x + 5, y + size - 5);
      ctx.stroke();
    });

    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const x = segment.x * CELL_SIZE + 2;
      const y = segment.y * CELL_SIZE + 2;
      const size = CELL_SIZE - 4;

      // Gradient color based on position
      const hue = 140 - (index / snake.length) * 20;
      const saturation = 70 + (index / snake.length) * 20;
      const lightness = isHead ? 55 : 45 - (index / snake.length) * 15;

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.shadowBlur = isHead ? 15 : 6;
      ctx.shadowColor = '#4ade80';

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, isHead ? 8 : 6);
      ctx.fill();

      // Draw eyes on head
      if (isHead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        const eyeSize = 4;

        let eye1X = x + size / 2;
        let eye1Y = y + size / 2;
        let eye2X = x + size / 2;
        let eye2Y = y + size / 2;

        switch (directionRef.current) {
          case 'RIGHT':
            eye1X = x + size - 8; eye1Y = y + 8;
            eye2X = x + size - 8; eye2Y = y + size - 8;
            break;
          case 'LEFT':
            eye1X = x + 8; eye1Y = y + 8;
            eye2X = x + 8; eye2Y = y + size - 8;
            break;
          case 'UP':
            eye1X = x + 8; eye1Y = y + 8;
            eye2X = x + size - 8; eye2Y = y + 8;
            break;
          case 'DOWN':
            eye1X = x + 8; eye1Y = y + size - 8;
            eye2X = x + size - 8; eye2Y = y + size - 8;
            break;
        }

        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(eye1X + 1, eye1Y + 1, 2, 0, Math.PI * 2);
        ctx.arc(eye2X + 1, eye2Y + 1, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw food with pulsing effect
    const pulse = Math.sin(Date.now() / 150) * 0.15 + 0.85;
    const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
    const foodRadius = (CELL_SIZE / 2 - 4) * pulse;

    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 20 * pulse;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    ctx.fill();

    // Apple stem
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(foodX, foodY - foodRadius + 2);
    ctx.lineTo(foodX + 3, foodY - foodRadius - 4);
    ctx.stroke();
  }, []);

  const gameLoop = useCallback(() => {
    const prevSnake = snakeRef.current;
    const obstacles = obstaclesRef.current;
    const food = foodRef.current;

    directionRef.current = nextDirectionRef.current;
    const head = { ...prevSnake[0] };

    switch (directionRef.current) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // Check collisions
    if (head.x < 0 || head.x >= GRID_COLS || head.y < 0 || head.y >= GRID_ROWS ||
        prevSnake.some(seg => seg.x === head.x && seg.y === head.y) ||
        obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {

      setIsGameOver(true);
      setIsRunning(false);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      onGameEnd?.(scoreRef.current);
      return;
    }

    const newSnake = [head, ...prevSnake];

    // Check food
    if (head.x === food.x && head.y === food.y) {
      // Score update
      const newScore = scoreRef.current + 10;
      scoreRef.current = newScore;
      setScore(newScore); // Update UI state

      const newLevel = Math.min(LEVEL_CONFIG.length, Math.floor(newScore / POINTS_PER_LEVEL) + 1);

      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
        setLevel(newLevel); // Update UI state

        const levelConfig = LEVEL_CONFIG[newLevel - 1];
        const newObstacles = generateObstacles(levelConfig.obstacles, newSnake, food);
        obstaclesRef.current = newObstacles;
        setObstacleCount(newObstacles.length); // Update UI state
      }

      foodRef.current = generateFood(newSnake, obstaclesRef.current);
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
  }, [generateFood, generateObstacles, onGameEnd]);

  const startGame = useCallback(() => {
    const initialSnake = [{ x: 3, y: Math.floor(GRID_ROWS / 2) }];
    const initialFood = generateFood(initialSnake, []);

    snakeRef.current = initialSnake;
    foodRef.current = initialFood;
    obstaclesRef.current = [];
    scoreRef.current = 0;
    levelRef.current = 1;

    setScore(0);
    setLevel(1);
    setObstacleCount(0);
    setIsGameOver(false);
    setIsRunning(true);
    setShowInstructions(false);
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
  }, [generateFood]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isRunning) return;

    const currentDir = directionRef.current;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        if (currentDir !== 'DOWN') nextDirectionRef.current = 'UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        if (currentDir !== 'UP') nextDirectionRef.current = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        if (currentDir !== 'RIGHT') nextDirectionRef.current = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (currentDir !== 'LEFT') nextDirectionRef.current = 'RIGHT';
        break;
    }
  }, [isRunning]);

  const handleDirectionButton = useCallback((direction: Direction) => {
    if (!isRunning) return;

    const currentDir = directionRef.current;
    if (
      (direction === 'UP' && currentDir !== 'DOWN') ||
      (direction === 'DOWN' && currentDir !== 'UP') ||
      (direction === 'LEFT' && currentDir !== 'RIGHT') ||
      (direction === 'RIGHT' && currentDir !== 'LEFT')
    ) {
      nextDirectionRef.current = direction;
    }
  }, [isRunning]);

  // Game loop effect
  useEffect(() => {
    if (isRunning) {
      const levelConfig = LEVEL_CONFIG[Math.min(level - 1, LEVEL_CONFIG.length - 1)];
      gameLoopRef.current = setInterval(gameLoop, levelConfig.speed);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isRunning, gameLoop, level]);

  // Continuous draw for animations
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      drawGame();
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [drawGame]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [handleKeyDown]);

  const canvasWidth = GRID_COLS * CELL_SIZE;
  const canvasHeight = GRID_ROWS * CELL_SIZE;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden",
        fullscreen ? "w-full h-full p-4" : "w-full h-[600px] rounded-lg p-4"
      )}
      style={{ background: '#0f172a' }}
    >
      {isRunning && (
        <div className="flex items-center justify-between w-full max-w-md mb-3">
          <div className="flex gap-3">
            <GameStat label={t('entertainment.games.snake.score')} value={score} />
            <GameStat label={t('entertainment.games.snake.level')} value={level} />
          </div>
          {obstacleCount > 0 && (
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <Skull size={16} />
              <span>{obstacleCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Game canvas */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700/50">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ display: 'block' }}
        />
      </div>

      {/* Mobile controls */}
      {isRunning && (
        <div className="flex flex-col items-center gap-2 mt-4">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl active:scale-95"
            onClick={() => handleDirectionButton('UP')}
            aria-label={t('entertainment.controls.up')}
          >
            <ArrowUp size={24} />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl active:scale-95"
              onClick={() => handleDirectionButton('LEFT')}
              aria-label={t('entertainment.controls.left')}
            >
              <ArrowLeft size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl active:scale-95"
              onClick={() => handleDirectionButton('DOWN')}
              aria-label={t('entertainment.controls.down')}
            >
              <ArrowDown size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl active:scale-95"
              onClick={() => handleDirectionButton('RIGHT')}
              aria-label={t('entertainment.controls.right')}
            >
              <ArrowRight size={24} />
            </Button>
          </div>
        </div>
      )}

      {!isRunning && !isGameOver && (
        <GameOverlay title={t('entertainment.games.snake.title')} description={t('entertainment.games.snake.instructions')}>
          <Button onClick={startGame} size="lg" suppressHydrationWarning>
            {t('entertainment.playNow')}
          </Button>
        </GameOverlay>
      )}

      {isGameOver && (
        <GameOverlay title={t('entertainment.gameOver')}>
          <div className="flex gap-3">
            <GameStat label={t('entertainment.games.snake.score')} value={score} />
            <GameStat label={t('entertainment.games.snake.level')} value={level} />
            <GameStat label={t('entertainment.games.snake.length')} value={snakeRef.current.length} />
          </div>
          <Button onClick={startGame} size="lg" suppressHydrationWarning>
            {t('entertainment.playAgain')}
          </Button>
        </GameOverlay>
      )}
    </div>
  );
});
