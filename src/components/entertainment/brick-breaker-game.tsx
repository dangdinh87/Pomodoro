'use client';

import { useEffect, useRef, useState } from 'react';
import { Wall } from '@phosphor-icons/react/dist/ssr';

import { useI18n } from '@/contexts/i18n-context';
import { GameCanvas, GameFrame } from './game-overlay';
import { useCanvasStage, useGamePalette, useGameSession, useHeldKeys, useRafLoop, type GameProps, type GamePalette } from './game-kit';

const W = 360;
const H = 520;
const PADDLE_W = 68;
const PADDLE_H = 10;
const PADDLE_Y = H - 36;
const BALL_R = 6;
const COLS = 8;
const BRICK_GAP = 3;
const BRICK_H = 18;
const FIELD_X = 16;
const BRICK_W = (W - FIELD_X * 2 - BRICK_GAP * (COLS - 1)) / COLS;
const TOP = 60;
const MAX_LIVES = 3;

const KEYS: Record<string, string> = { ArrowLeft: 'left', ArrowRight: 'right', a: 'left', d: 'right' };
const ROW_COLORS: (keyof GamePalette)[] = ['rose', 'amber', 'green', 'cyan', 'blue', 'purple'];

interface Brick {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  color: keyof GamePalette;
}

export function ballSpeed(level: number): number {
  return Math.min(470, 290 + (level - 1) * 22);
}

/** Level layouts: a different silhouette every level, tougher bricks as you climb. */
export function buildLevel(level: number): Brick[] {
  const rows = Math.min(3 + level, 8);
  const bricks: Brick[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      const pattern = (level - 1) % 4;
      if (pattern === 1 && (r + c) % 2 === 1) continue;
      if (pattern === 2 && (c < r - 2 || c > COLS - 1 - (r - 2)) && r > 2) continue;
      if (pattern === 3 && r % 2 === 1 && (c === 0 || c === COLS - 1)) continue;
      const maxHp = level >= 6 ? (r < 2 ? 3 : 2) : level >= 3 && r < Math.ceil(level / 2) ? 2 : 1;
      bricks.push({
        x: FIELD_X + c * (BRICK_W + BRICK_GAP),
        y: TOP + r * (BRICK_H + BRICK_GAP),
        hp: maxHp,
        maxHp,
        color: ROW_COLORS[r % ROW_COLORS.length],
      });
    }
  }
  return bricks;
}

function newGame() {
  return {
    paddleX: W / 2,
    ball: { x: W / 2, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0 },
    serving: true,
    bricks: buildLevel(1),
    level: 1,
    lives: MAX_LIVES,
    combo: 0,
    score: 0,
    banner: { text: '', left: 0 },
  };
}

export function BrickBreakerGame(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession(props);
  const { statusRef, setScore, finish } = session;
  const stage = useCanvasStage(W, H);
  const palette = useGamePalette();
  const held = useHeldKeys(KEYS);
  const g = useRef(newGame());
  const drag = useRef<{ startX: number; startPaddle: number } | null>(null);
  const [hud, setHud] = useState({ lives: MAX_LIVES, level: 1 });
  const levelLabel = t('arcadeKit.level');

  const sync = () => setHud({ lives: g.current.lives, level: g.current.level });

  const launch = () => {
    const s = g.current;
    if (!s.serving || statusRef.current !== 'playing') return;
    s.serving = false;
    const speed = ballSpeed(s.level);
    const angle = (Math.random() * 0.5 - 0.25) * Math.PI * 0.5;
    s.ball.vx = Math.sin(angle) * speed;
    s.ball.vy = -Math.cos(angle) * speed;
  };

  const begin = () => {
    g.current = newGame();
    g.current.banner = { text: `${levelLabel} 1`, left: 1.2 };
    setScore(0);
    sync();
    session.start();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const s = g.current;
    if (e.pointerType === 'mouse') s.paddleX = stage.toLogical(e.clientX, e.clientY).x;
    else drag.current = { startX: e.clientX, startPaddle: s.paddleX };
    launch();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (statusRef.current !== 'playing') return;
    const s = g.current;
    if (e.pointerType === 'mouse') {
      s.paddleX = stage.toLogical(e.clientX, e.clientY).x;
    } else if (drag.current) {
      const scale = W / (stage.canvasRef.current?.getBoundingClientRect().width || W);
      s.paddleX = drag.current.startPaddle + (e.clientX - drag.current.startX) * scale;
    }
  };
  const clearDrag = () => {
    drag.current = null;
  };

  // Space launches; kept on window so it works wherever focus is.
  const launchRef = useRef(launch);
  useEffect(() => {
    launchRef.current = launch;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'ArrowUp') && statusRef.current === 'playing') {
        e.preventDefault();
        launchRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [statusRef]);

  useRafLoop((dt) => {
    const s = g.current;
    const playing = statusRef.current === 'playing';
    if (playing) {
      if (s.banner.left > 0) s.banner.left -= dt;
      const dir = (held.current.has('right') ? 1 : 0) - (held.current.has('left') ? 1 : 0);
      if (dir) s.paddleX += dir * 430 * dt;
      s.paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, s.paddleX));

      if (s.serving) {
        s.ball.x = s.paddleX;
        s.ball.y = PADDLE_Y - BALL_R - 1;
      } else {
        const speed = Math.hypot(s.ball.vx, s.ball.vy);
        const steps = Math.max(1, Math.ceil((speed * dt) / 4));
        const sub = dt / steps;
        for (let i = 0; i < steps; i++) {
          const b = s.ball;
          b.x += b.vx * sub;
          b.y += b.vy * sub;
          if (b.x < BALL_R) {
            b.x = BALL_R;
            b.vx = Math.abs(b.vx);
          } else if (b.x > W - BALL_R) {
            b.x = W - BALL_R;
            b.vx = -Math.abs(b.vx);
          }
          if (b.y < BALL_R) {
            b.y = BALL_R;
            b.vy = Math.abs(b.vy);
          }

          if (b.vy > 0 && b.y + BALL_R >= PADDLE_Y && b.y + BALL_R <= PADDLE_Y + PADDLE_H + 6 && Math.abs(b.x - s.paddleX) <= PADDLE_W / 2 + BALL_R) {
            const offset = Math.max(-1, Math.min(1, (b.x - s.paddleX) / (PADDLE_W / 2)));
            const angle = offset * (Math.PI / 3);
            const sp = ballSpeed(s.level);
            b.vx = Math.sin(angle) * sp;
            b.vy = -Math.cos(angle) * sp;
            b.y = PADDLE_Y - BALL_R;
            s.combo = 0;
          }

          const hit = s.bricks.find(
            (br) => b.x + BALL_R > br.x && b.x - BALL_R < br.x + BRICK_W && b.y + BALL_R > br.y && b.y - BALL_R < br.y + BRICK_H,
          );
          if (hit) {
            const ox = BRICK_W / 2 + BALL_R - Math.abs(b.x - (hit.x + BRICK_W / 2));
            const oy = BRICK_H / 2 + BALL_R - Math.abs(b.y - (hit.y + BRICK_H / 2));
            if (ox < oy) {
              b.vx = b.x < hit.x + BRICK_W / 2 ? -Math.abs(b.vx) : Math.abs(b.vx);
              b.x += b.x < hit.x + BRICK_W / 2 ? -ox : ox;
            } else {
              b.vy = b.y < hit.y + BRICK_H / 2 ? -Math.abs(b.vy) : Math.abs(b.vy);
              b.y += b.y < hit.y + BRICK_H / 2 ? -oy : oy;
            }
            hit.hp -= 1;
            s.combo += 1;
            s.score += hit.hp <= 0 ? 10 + 5 * Math.min(s.combo - 1, 10) : 5;
            if (hit.hp <= 0) s.bricks = s.bricks.filter((br) => br !== hit);
            setScore(s.score);
            break;
          }
        }

        if (s.bricks.length === 0) {
          s.level += 1;
          s.score += 100;
          s.bricks = buildLevel(s.level);
          s.serving = true;
          s.combo = 0;
          s.banner = { text: `${levelLabel} ${s.level}`, left: 1.4 };
          setScore(s.score);
          sync();
        } else if (s.ball.y - BALL_R > H) {
          s.lives -= 1;
          s.combo = 0;
          sync();
          if (s.lives <= 0) finish(s.score);
          else {
            s.serving = true;
            s.ball.vx = 0;
            s.ball.vy = 0;
          }
        }
      }
    }

    const ctx = stage.getCtx();
    if (!ctx) return;
    const p = palette.current;
    ctx.fillStyle = p.surface;
    ctx.fillRect(0, 0, W, H);

    ctx.lineWidth = 1;
    ctx.strokeStyle = p.border;
    ctx.beginPath();
    ctx.moveTo(0, PADDLE_Y + 22);
    ctx.lineTo(W, PADDLE_Y + 22);
    ctx.stroke();

    for (const br of s.bricks) {
      ctx.globalAlpha = 0.45 + 0.55 * (br.hp / br.maxHp);
      ctx.fillStyle = p[br.color];
      ctx.beginPath();
      ctx.roundRect(br.x, br.y, BRICK_W, BRICK_H, 4);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = p.ink;
    ctx.beginPath();
    ctx.roundRect(s.paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H, 5);
    ctx.fill();

    ctx.fillStyle = p.accent;
    ctx.beginPath();
    ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'center';
    if (s.banner.left > 0) {
      ctx.fillStyle = p.ink;
      ctx.font = '700 26px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(s.banner.text, W / 2, H / 2 + 20);
    } else if (s.serving && playing) {
      ctx.fillStyle = p.inkMuted;
      ctx.font = '500 14px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(t('arcadeGames.brickBreaker.launch'), W / 2, PADDLE_Y - 40);
    }
    if (s.combo >= 3 && !s.serving) {
      ctx.fillStyle = p.gold;
      ctx.font = '700 14px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`x${s.combo}`, W / 2, H - 8);
    }
  });

  return (
    <GameFrame
      title={t('arcadeGames.brickBreaker.title')}
      icon={Wall}
      description={t('arcadeGames.brickBreaker.instructions')}
      hint={t('arcadeGames.brickBreaker.hint')}
      session={session}
      onRestart={begin}
      onStart={begin}
      stats={[
        { label: t('arcadeKit.level'), value: hud.level },
        { label: t('arcadeKit.lives'), value: hud.lives },
      ]}
      overSummary={
        <p className="text-sm text-ink-secondary" suppressHydrationWarning>
          {t('arcadeGames.brickBreaker.summary', { level: hud.level })}
        </p>
      }
    >
      <GameCanvas stage={stage} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={clearDrag} onPointerCancel={clearDrag} />
    </GameFrame>
  );
}
