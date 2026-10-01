'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightning } from '@phosphor-icons/react/dist/ssr';

import { useI18n } from '@/contexts/i18n-context';
import { GameCanvas, GameFrame } from './game-overlay';
import { useCanvasStage, useGamePalette, useGameSession, useRafLoop, useSwipe, type GameProps, type SwipeDir } from './game-kit';

const COLS = 16;
const ROWS = 16;
const CELL = 24;
const W = COLS * CELL;
const H = ROWS * CELL;

interface Pt {
  x: number;
  y: number;
}

const VECTORS: Record<SwipeDir, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const KEY_DIRS: Record<string, SwipeDir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
};

/** Speeds up as the snake grows, with a floor so it stays playable on a phone. */
export function tickInterval(eaten: number): number {
  return Math.max(75, 150 - eaten * 3);
}

function placeFood(snake: Pt[]): Pt {
  const free: Pt[] = [];
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++) if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

function newState() {
  const snake: Pt[] = [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ];
  return {
    snake,
    prev: snake.map((s) => ({ ...s })),
    dir: 'right' as SwipeDir,
    queue: [] as SwipeDir[],
    food: placeFood(snake),
    acc: 0,
    eaten: 0,
  };
}

const OPPOSITE: Record<SwipeDir, SwipeDir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

export function SnakeGame(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession(props);
  const { statusRef, setScore, finish } = session;
  const stage = useCanvasStage(W, H);
  const palette = useGamePalette();
  const game = useRef(newState());
  const [length, setLength] = useState(3);

  const turn = useCallback(
    (dir: SwipeDir) => {
      if (statusRef.current !== 'playing') return;
      const g = game.current;
      const last = g.queue[g.queue.length - 1] ?? g.dir;
      if (dir === last || dir === OPPOSITE[last] || g.queue.length >= 2) return;
      g.queue.push(dir);
    },
    [statusRef],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIRS[e.key];
      if (!dir || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      turn(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  useSwipe(stage.containerRef, turn, 22);

  const begin = () => {
    game.current = newState();
    setScore(0);
    setLength(3);
    session.start();
  };

  useRafLoop((dt) => {
    const g = game.current;
    if (statusRef.current === 'playing') {
      g.acc += dt * 1000;
      const interval = tickInterval(g.eaten);
      while (g.acc >= interval && statusRef.current === 'playing') {
        g.acc -= interval;
        const next = g.queue.shift();
        if (next) g.dir = next;
        const v = VECTORS[g.dir];
        const head = { x: g.snake[0].x + v.x, y: g.snake[0].y + v.y };
        const ate = head.x === g.food.x && head.y === g.food.y;
        const body = ate ? g.snake : g.snake.slice(0, -1);
        const hit = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || body.some((s) => s.x === head.x && s.y === head.y);
        if (hit) {
          g.acc = 0;
          finish(g.eaten * 10);
          break;
        }
        g.prev = g.snake.map((s) => ({ ...s }));
        g.snake.unshift(head);
        if (ate) {
          g.eaten += 1;
          g.food = placeFood(g.snake);
          setScore(g.eaten * 10);
          setLength(g.snake.length);
        } else {
          g.snake.pop();
        }
      }
    }

    const ctx = stage.getCtx();
    if (!ctx) return;
    const p = palette.current;
    const interval = tickInterval(g.eaten);
    const alpha = statusRef.current === 'playing' ? Math.min(1, g.acc / interval) : 1;

    ctx.fillStyle = p.surface;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = p.raised;
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++) if ((x + y) % 2 === 1) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);

    ctx.fillStyle = p.rose;
    ctx.beginPath();
    ctx.arc(g.food.x * CELL + CELL / 2, g.food.y * CELL + CELL / 2, CELL * 0.34, 0, Math.PI * 2);
    ctx.fill();

    const inset = 2;
    for (let i = g.snake.length - 1; i >= 0; i--) {
      const cur = g.snake[i];
      const prev = g.prev[i] ?? cur;
      const x = (prev.x + (cur.x - prev.x) * alpha) * CELL;
      const y = (prev.y + (cur.y - prev.y) * alpha) * CELL;
      ctx.fillStyle = i === 0 ? p.accent : p.accentSolid;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, CELL - inset * 2, CELL - inset * 2, i === 0 ? 8 : 6);
      ctx.fill();
      if (i === 0) {
        const v = VECTORS[g.dir];
        const cx = x + CELL / 2;
        const cy = y + CELL / 2;
        const px = -v.y;
        const py = v.x;
        ctx.fillStyle = p.surface;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(cx + v.x * 4 + px * side * 4.5, cy + v.y * 4 + py * side * 4.5, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  });

  return (
    <GameFrame
      title={t('arcadeGames.snake.title')}
      icon={Lightning}
      description={t('arcadeGames.snake.instructions')}
      hint={t('arcadeGames.snake.hint')}
      session={session}
      onRestart={begin}
      onStart={begin}
      stats={[{ label: t('arcadeGames.snake.length'), value: length }]}
      overSummary={
        <p className="text-sm text-ink-secondary" suppressHydrationWarning>
          {t('arcadeGames.snake.summary', { length })}
        </p>
      }
    >
      <GameCanvas stage={stage} />
    </GameFrame>
  );
}
