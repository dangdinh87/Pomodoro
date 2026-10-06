'use client';

import { useRef, useState } from 'react';
import { Rocket } from '@phosphor-icons/react/dist/ssr';

import { useI18n } from '@/contexts/i18n-context';
import { GameCanvas, GameFrame } from './game-overlay';
import { prefersReducedMotion, useCanvasStage, useGamePalette, useGameSession, useHeldKeys, useRafLoop, type GameProps, type GamePalette } from './game-kit';

const W = 360;
const H = 540;
const START_LIVES = 3;
const KEYS: Record<string, string> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down',
};

type EnemyType = 'drone' | 'zigzag' | 'tank' | 'dasher';
type PowerType = 'rapid' | 'spread' | 'shield';

interface Enemy {
  type: EnemyType;
  x: number;
  y: number;
  baseX: number;
  hp: number;
  maxHp: number;
  r: number;
  t: number;
  fire: number;
}
interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
interface Pickup {
  x: number;
  y: number;
  type: PowerType;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: keyof GamePalette;
}

const ENEMY_STATS: Record<EnemyType, { hp: number; r: number; points: number; color: keyof GamePalette }> = {
  drone: { hp: 1, r: 12, points: 10, color: 'rose' },
  zigzag: { hp: 1, r: 12, points: 15, color: 'amber' },
  tank: { hp: 4, r: 17, points: 40, color: 'purple' },
  dasher: { hp: 2, r: 11, points: 25, color: 'pink' },
};

const POWER_COLORS: Record<PowerType, keyof GamePalette> = { rapid: 'blue', spread: 'purple', shield: 'green' };

/** Level rises every 400 points; spawns get denser and enemy mix gets harder. */
export function levelFor(score: number): number {
  return 1 + Math.floor(score / 400);
}

export function spawnInterval(level: number): number {
  return Math.max(0.42, 1.25 - level * 0.09);
}

function pickEnemyType(level: number): EnemyType {
  const roll = Math.random();
  if (level >= 3 && roll < 0.16) return 'dasher';
  if (level >= 2 && roll < 0.34) return 'tank';
  if (roll < 0.62) return 'zigzag';
  return 'drone';
}

function newGame() {
  return {
    x: W / 2,
    y: H - 80,
    tx: W / 2,
    ty: H - 80,
    invuln: 0,
    lives: START_LIVES,
    score: 0,
    time: 0,
    spawn: 0.6,
    fire: 0,
    rapid: 0,
    spread: 0,
    shield: 0,
    shots: [] as Shot[],
    foeShots: [] as Shot[],
    enemies: [] as Enemy[],
    pickups: [] as Pickup[],
    sparks: [] as Spark[],
    stars: Array.from({ length: 36 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.5 + Math.random() * 1.5 })),
  };
}

export function SpaceShooterGame(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession(props);
  const { statusRef, setScore, finish } = session;
  const stage = useCanvasStage(W, H);
  const palette = useGamePalette();
  const held = useHeldKeys(KEYS);
  const g = useRef(newGame());
  const drag = useRef<{ sx: number; sy: number; tx: number; ty: number } | null>(null);
  const reduced = useRef(false);
  const [hud, setHud] = useState({ lives: START_LIVES, level: 1 });

  const sync = () => setHud({ lives: g.current.lives, level: levelFor(g.current.score) });

  const begin = () => {
    g.current = newGame();
    reduced.current = prefersReducedMotion();
    setScore(0);
    sync();
    session.start();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const s = g.current;
    if (e.pointerType === 'mouse') {
      const p = stage.toLogical(e.clientX, e.clientY);
      s.tx = p.x;
      s.ty = p.y;
    } else drag.current = { sx: e.clientX, sy: e.clientY, tx: s.tx, ty: s.ty };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (statusRef.current !== 'playing') return;
    const s = g.current;
    if (e.pointerType === 'mouse') {
      const p = stage.toLogical(e.clientX, e.clientY);
      s.tx = p.x;
      s.ty = p.y - 20;
    } else if (drag.current) {
      const k = W / (stage.canvasRef.current?.getBoundingClientRect().width || W);
      s.tx = drag.current.tx + (e.clientX - drag.current.sx) * k;
      s.ty = drag.current.ty + (e.clientY - drag.current.sy) * k;
    }
  };
  const clearDrag = () => {
    drag.current = null;
  };

  const burst = (s: ReturnType<typeof newGame>, x: number, y: number, color: keyof GamePalette, n: number) => {
    if (reduced.current) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 40 + Math.random() * 110;
      s.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.45, color });
    }
  };

  useRafLoop((dt) => {
    const s = g.current;
    const playing = statusRef.current === 'playing';
    const level = levelFor(s.score);

    if (playing) {
      s.time += dt;
      s.invuln = Math.max(0, s.invuln - dt);
      s.rapid = Math.max(0, s.rapid - dt);
      s.spread = Math.max(0, s.spread - dt);
      s.shield = Math.max(0, s.shield - dt);

      const kx = (held.current.has('right') ? 1 : 0) - (held.current.has('left') ? 1 : 0);
      const ky = (held.current.has('down') ? 1 : 0) - (held.current.has('up') ? 1 : 0);
      if (kx || ky) {
        s.tx = Math.max(16, Math.min(W - 16, s.tx + kx * 330 * dt));
        s.ty = Math.max(40, Math.min(H - 24, s.ty + ky * 330 * dt));
      }
      s.tx = Math.max(16, Math.min(W - 16, s.tx));
      s.ty = Math.max(40, Math.min(H - 24, s.ty));
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;
      const dist = Math.hypot(dx, dy);
      const step = Math.min(dist, 620 * dt);
      if (dist > 0.01) {
        s.x += (dx / dist) * step;
        s.y += (dy / dist) * step;
      }

      s.fire -= dt;
      if (s.fire <= 0) {
        s.fire = s.rapid > 0 ? 0.1 : 0.21;
        s.shots.push({ x: s.x, y: s.y - 14, vx: 0, vy: -520 });
        if (s.spread > 0) {
          s.shots.push({ x: s.x - 8, y: s.y - 8, vx: -120, vy: -500 });
          s.shots.push({ x: s.x + 8, y: s.y - 8, vx: 120, vy: -500 });
        }
      }

      s.spawn -= dt;
      if (s.spawn <= 0) {
        s.spawn = spawnInterval(level) * (0.8 + Math.random() * 0.5);
        const type = pickEnemyType(level);
        const st = ENEMY_STATS[type];
        const x = 24 + Math.random() * (W - 48);
        s.enemies.push({ type, x, baseX: x, y: -20, hp: st.hp, maxHp: st.hp, r: st.r, t: Math.random() * 6, fire: 1 + Math.random() });
      }

      for (const e of s.enemies) {
        e.t += dt;
        const speedBoost = 1 + level * 0.06;
        if (e.type === 'drone') e.y += 80 * speedBoost * dt;
        else if (e.type === 'zigzag') {
          e.y += 70 * speedBoost * dt;
          e.x = Math.max(16, Math.min(W - 16, e.baseX + Math.sin(e.t * 2.4) * 54));
        } else if (e.type === 'tank') {
          e.y += 38 * speedBoost * dt;
          e.fire -= dt;
          if (e.fire <= 0) {
            e.fire = Math.max(0.9, 1.9 - level * 0.1);
            const ang = Math.atan2(s.y - e.y, s.x - e.x);
            s.foeShots.push({ x: e.x, y: e.y + e.r, vx: Math.cos(ang) * 150, vy: Math.sin(ang) * 150 });
          }
        } else e.y += (e.y < 140 ? 70 : 230) * dt;
      }
      s.enemies = s.enemies.filter((e) => e.y < H + 30);

      for (const b of s.shots) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
      for (const b of s.foeShots) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
      s.shots = s.shots.filter((b) => b.y > -10 && b.x > -10 && b.x < W + 10);
      s.foeShots = s.foeShots.filter((b) => b.y < H + 10 && b.y > -10 && b.x > -10 && b.x < W + 10);

      for (const b of s.shots) {
        const e = s.enemies.find((en) => Math.hypot(en.x - b.x, en.y - b.y) < en.r + 3);
        if (!e) continue;
        b.y = -100;
        e.hp -= 1;
        if (e.hp <= 0) {
          const st = ENEMY_STATS[e.type];
          s.score += st.points;
          burst(s, e.x, e.y, st.color, 10);
          if (Math.random() < 0.1) {
            const types: PowerType[] = ['rapid', 'spread', 'shield'];
            s.pickups.push({ x: e.x, y: e.y, type: types[Math.floor(Math.random() * types.length)] });
          }
          e.y = H + 100;
          setScore(s.score);
          if (levelFor(s.score) !== level) sync();
        }
      }
      s.enemies = s.enemies.filter((e) => e.y <= H + 30);

      for (const p of s.pickups) p.y += 70 * dt;
      s.pickups = s.pickups.filter((p) => {
        if (p.y > H + 20) return false;
        if (Math.hypot(p.x - s.x, p.y - s.y) < 22) {
          s[p.type] = 8;
          return false;
        }
        return true;
      });

      const hurt = () => {
        if (s.invuln > 0) return;
        if (s.shield > 0) {
          s.shield = 0;
          s.invuln = 0.8;
          return;
        }
        s.lives -= 1;
        s.invuln = 1.6;
        burst(s, s.x, s.y, 'accent', 16);
        sync();
        if (s.lives <= 0) finish(s.score);
      };
      for (const e of s.enemies) {
        if (Math.hypot(e.x - s.x, e.y - s.y) < e.r + 10) {
          hurt();
          if (e.type !== 'tank') e.y = H + 100;
        }
      }
      for (const b of s.foeShots) {
        if (Math.hypot(b.x - s.x, b.y - s.y) < 12) {
          b.y = H + 100;
          hurt();
        }
      }
    }

    for (const sp of s.sparks) {
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt;
    }
    s.sparks = s.sparks.filter((sp) => sp.life > 0);
    if (!reduced.current) for (const st of s.stars) st.y = (st.y + st.s * 18 * dt * (playing ? 1 : 0)) % H;

    const ctx = stage.getCtx();
    if (!ctx) return;
    const p = palette.current;
    ctx.fillStyle = p.raised;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = p.inkFaint;
    ctx.globalAlpha = 0.6;
    for (const st of s.stars) ctx.fillRect(st.x, st.y, st.s, st.s);
    ctx.globalAlpha = 1;

    for (const pk of s.pickups) {
      ctx.fillStyle = p[POWER_COLORS[pk.type]];
      ctx.beginPath();
      ctx.arc(pk.x, pk.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 11px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pk.type === 'rapid' ? 'R' : pk.type === 'spread' ? '3' : 'S', pk.x, pk.y + 4);
    }

    for (const e of s.enemies) {
      const st = ENEMY_STATS[e.type];
      ctx.fillStyle = p[st.color];
      ctx.beginPath();
      if (e.type === 'drone') {
        ctx.moveTo(e.x - e.r, e.y - e.r * 0.7);
        ctx.lineTo(e.x + e.r, e.y - e.r * 0.7);
        ctx.lineTo(e.x, e.y + e.r);
      } else if (e.type === 'zigzag') {
        ctx.moveTo(e.x, e.y - e.r);
        ctx.lineTo(e.x + e.r, e.y);
        ctx.lineTo(e.x, e.y + e.r);
        ctx.lineTo(e.x - e.r, e.y);
      } else if (e.type === 'tank') {
        ctx.roundRect(e.x - e.r, e.y - e.r * 0.8, e.r * 2, e.r * 1.6, 6);
      } else {
        ctx.moveTo(e.x, e.y + e.r);
        ctx.lineTo(e.x + e.r, e.y - e.r);
        ctx.lineTo(e.x, e.y - e.r * 0.4);
        ctx.lineTo(e.x - e.r, e.y - e.r);
      }
      ctx.closePath();
      ctx.fill();
      if (e.maxHp > 1) {
        ctx.fillStyle = p.surface;
        ctx.fillRect(e.x - 10, e.y - e.r - 7, 20, 3);
        ctx.fillStyle = p.ink;
        ctx.fillRect(e.x - 10, e.y - e.r - 7, (20 * e.hp) / e.maxHp, 3);
      }
    }

    ctx.fillStyle = p.ink;
    for (const b of s.shots) ctx.fillRect(b.x - 1.5, b.y - 6, 3, 10);
    ctx.fillStyle = p.rose;
    for (const b of s.foeShots) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const visible = s.invuln <= 0 || Math.floor(s.invuln * 10) % 2 === 0;
    if (visible && s.lives > 0) {
      ctx.fillStyle = p.accent;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - 16);
      ctx.lineTo(s.x + 13, s.y + 12);
      ctx.lineTo(s.x, s.y + 6);
      ctx.lineTo(s.x - 13, s.y + 12);
      ctx.closePath();
      ctx.fill();
      if (s.shield > 0) {
        ctx.strokeStyle = p.green;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 22, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    for (const sp of s.sparks) {
      ctx.globalAlpha = Math.max(0, sp.life / 0.45);
      ctx.fillStyle = p[sp.color];
      ctx.fillRect(sp.x - 1.5, sp.y - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;

    let slot = 0;
    for (const [key, color, label] of [
      ['rapid', 'blue', 'R'],
      ['spread', 'purple', '3'],
      ['shield', 'green', 'S'],
    ] as const) {
      if (s[key] > 0) {
        ctx.fillStyle = p[color];
        ctx.fillRect(10 + slot * 54, 10, 46 * Math.min(1, s[key] / 8), 5);
        ctx.fillStyle = p.inkMuted;
        ctx.font = '600 10px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, 10 + slot * 54, 28);
        slot++;
      }
    }
  });

  return (
    <GameFrame
      title={t('arcadeGames.spaceShooter.title')}
      icon={Rocket}
      description={t('arcadeGames.spaceShooter.instructions')}
      hint={t('arcadeGames.spaceShooter.hint')}
      session={session}
      onRestart={begin}
      onStart={begin}
      stats={[
        { label: t('arcadeKit.level'), value: hud.level },
        { label: t('arcadeKit.lives'), value: hud.lives },
      ]}
      overSummary={
        <p className="text-sm text-ink-secondary" suppressHydrationWarning>
          {t('arcadeGames.spaceShooter.summary', { level: hud.level })}
        </p>
      }
    >
      <GameCanvas stage={stage} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={clearDrag} onPointerCancel={clearDrag} />
    </GameFrame>
  );
}
