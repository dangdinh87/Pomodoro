'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { Play, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface BrickBreakerGameProps {
  onGameEnd?: (score: number) => void;
  fullscreen?: boolean;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  hits: number;
  color: string;
  glowColor: string;
}

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 14;
const BALL_RADIUS = 8;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_WIDTH = 54;
const BRICK_HEIGHT = 22;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;

const LEVEL_CONFIGS = [
  { speed: 10, lives: 3, brickHits: 1 },
  { speed: 12, lives: 3, brickHits: 1 },
  { speed: 14, lives: 3, brickHits: 2 },
  { speed: 16, lives: 2, brickHits: 2 },
  { speed: 18, lives: 2, brickHits: 2 },
];

const BRICK_COLORS = [
  { color: '#ef4444', glow: '#dc2626' },
  { color: '#f97316', glow: '#ea580c' },
  { color: '#eab308', glow: '#ca8a04' },
  { color: '#22c55e', glow: '#16a34a' },
  { color: '#3b82f6', glow: '#2563eb' },
  { color: '#8b5cf6', glow: '#7c3aed' },
];

export function BrickBreakerGame({ onGameEnd, fullscreen }: BrickBreakerGameProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'levelup'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);

  const ballRef = useRef<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    dx: 6,
    dy: -6,
    radius: BALL_RADIUS,
  });

  const paddleRef = useRef<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });

  const bricksRef = useRef<Brick[]>([]);
  const keysRef = useRef<Set<string>>(new Set());

  const initBricks = useCallback((levelNum: number) => {
    const bricks: Brick[] = [];
    const config = LEVEL_CONFIGS[Math.min(levelNum - 1, LEVEL_CONFIGS.length - 1)];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const colorIndex = row % BRICK_COLORS.length;
        bricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          hits: config.brickHits,
          color: BRICK_COLORS[colorIndex].color,
          glowColor: BRICK_COLORS[colorIndex].glow,
        });
      }
    }
    bricksRef.current = bricks;
  }, []);

  const resetBall = useCallback(() => {
    const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 100,
      dx: config.speed * (Math.random() > 0.5 ? 1 : -1),
      dy: -config.speed,
      radius: BALL_RADIUS,
    };
  }, [level]);

  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setLives(LEVEL_CONFIGS[0].lives);
    setCombo(0);
    initBricks(1);
    resetBall();
    paddleRef.current.x = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    setGameState('playing');
  }, [initBricks, resetBall]);

  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    setLevel(newLevel);
    const config = LEVEL_CONFIGS[Math.min(newLevel - 1, LEVEL_CONFIGS.length - 1)];
    setLives(prev => Math.min(prev + 1, config.lives));
    initBricks(newLevel);
    resetBall();
    setGameState('playing');
  }, [level, initBricks, resetBall]);

  // Touch controls
  const movePaddle = useCallback((direction: 'left' | 'right') => {
    const paddle = paddleRef.current;
    const moveSpeed = 30;
    if (direction === 'left') {
      paddle.x = Math.max(0, paddle.x - moveSpeed);
    } else {
      paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + moveSpeed);
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const ball = ballRef.current;
      const paddle = paddleRef.current;
      const bricks = bricksRef.current;

      // Handle keyboard input
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) {
        paddle.x = Math.max(0, paddle.x - 8);
      }
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) {
        paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + 8);
      }

      // Move ball
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall collision
      if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= CANVAS_WIDTH) {
        ball.dx = -ball.dx;
      }
      if (ball.y - ball.radius <= 0) {
        ball.dy = -ball.dy;
      }

      // Bottom - lose life
      if (ball.y + ball.radius >= CANVAS_HEIGHT) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('gameover');
            onGameEnd?.(score);
          } else {
            resetBall();
          }
          return newLives;
        });
        setCombo(0);
      }

      // Paddle collision
      if (
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width
      ) {
        ball.dy = -Math.abs(ball.dy);
        // Angle based on where it hit the paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 10;
      }

      // Brick collision
      let bricksRemaining = 0;
      for (const brick of bricks) {
        if (brick.hits <= 0) continue;
        bricksRemaining++;

        if (
          ball.x + ball.radius >= brick.x &&
          ball.x - ball.radius <= brick.x + brick.width &&
          ball.y + ball.radius >= brick.y &&
          ball.y - ball.radius <= brick.y + brick.height
        ) {
          brick.hits--;
          ball.dy = -ball.dy;

          if (brick.hits <= 0) {
            setCombo(prev => prev + 1);
            setScore(prev => {
              const comboBonus = Math.floor(combo / 3) * 10;
              return prev + 10 + comboBonus;
            });
          }
          break;
        }
      }

      // Check level complete
      if (bricksRemaining === 0) {
        setGameState('levelup');
        return;
      }

      // Draw
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw grid pattern
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_WIDTH; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_WIDTH, i);
        ctx.stroke();
      }

      // Draw bricks
      for (const brick of bricks) {
        if (brick.hits <= 0) continue;

        // Glow effect
        ctx.shadowColor = brick.glowColor;
        ctx.shadowBlur = 10;

        // Brick
        const opacity = brick.hits === 1 ? 1 : 0.7;
        ctx.fillStyle = brick.color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.shadowBlur = 0;
      }

      // Draw paddle with glow
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      const paddleGradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y);
      paddleGradient.addColorStop(0, '#06b6d4');
      paddleGradient.addColorStop(0.5, '#22d3ee');
      paddleGradient.addColorStop(1, '#06b6d4');
      ctx.fillStyle = paddleGradient;
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 7);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw ball with glow
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 20;
      const ballGradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
      ballGradient.addColorStop(0, '#fdf4ff');
      ballGradient.addColorStop(0.5, '#f472b6');
      ballGradient.addColorStop(1, '#db2777');
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw HUD
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`Level ${level}`, 10, 25);
      ctx.textAlign = 'center';
      ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, 25);
      ctx.textAlign = 'right';
      ctx.fillText(`❤️ ${lives}`, CANVAS_WIDTH - 10, 25);

      if (combo >= 3) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`🔥 x${combo} Combo!`, CANVAS_WIDTH / 2, 45);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, level, score, combo, onGameEnd, resetBall]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
      if (e.key === ' ' && gameState === 'menu') {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, startGame]);

  // Mouse/Touch paddle control
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const x = (clientX - rect.left) * scaleX;
      paddleRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (gameState === 'playing') {
        handleMove(e.clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameState === 'playing' && e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState]);

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullscreen ? 'h-full bg-slate-950' : ''}`}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] max-w-full"
          style={{ maxHeight: fullscreen ? '75vh' : '60vh', width: 'auto' }}
        />

        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-xl backdrop-blur-sm">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-2">
              {t('entertainment.games.brickBreaker.title')}
            </h2>
            <p className="text-slate-400 text-sm mb-6 text-center max-w-xs px-4">
              {t('entertainment.games.brickBreaker.instructions')}
            </p>
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              {t('entertainment.games.brickBreaker.start')}
            </Button>
          </div>
        )}

        {/* Level Up Overlay */}
        {gameState === 'levelup' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-green-400 mb-2">
              {t('entertainment.games.brickBreaker.levelComplete')}
            </h2>
            <p className="text-slate-400 mb-4">{t('entertainment.games.brickBreaker.score')}: {score}</p>
            <Button
              onClick={nextLevel}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-3"
            >
              {t('entertainment.games.brickBreaker.nextLevel')} {level + 1}
            </Button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-500 mb-2">
              {t('entertainment.games.brickBreaker.gameOver')}
            </h2>
            <p className="text-slate-400 mb-1">{t('entertainment.games.brickBreaker.finalScore')}: {score}</p>
            <p className="text-slate-500 text-sm mb-4">{t('entertainment.games.brickBreaker.reachedLevel')} {level}</p>
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold px-8 py-3"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {t('entertainment.games.brickBreaker.playAgain')}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile touch controls */}
      {gameState === 'playing' && (
        <div className="flex gap-4 md:hidden">
          <Button
            variant="outline"
            size="lg"
            className="w-20 h-14 border-cyan-500/50 text-cyan-400"
            onTouchStart={() => movePaddle('left')}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-20 h-14 border-cyan-500/50 text-cyan-400"
            onTouchStart={() => movePaddle('right')}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>
      )}
    </div>
  );
}
