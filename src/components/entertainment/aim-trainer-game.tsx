'use client';

import { useRef, useState } from 'react';
import { Crosshair } from '@phosphor-icons/react/dist/ssr';

import { useI18n } from '@/contexts/i18n-context';
import { GameFrame, SummaryRow } from './game-overlay';
import { formatClock, useCountdown, useGameSession, useRafLoop, type GameProps } from './game-kit';

const DURATION_MS = 30_000;
const TARGET_PX = 60;

interface Target {
  id: number;
  x: number;
  y: number;
}

/** Targets stay up for less time as you land more hits, down to a floor. */
export function targetLife(hits: number): number {
  return Math.max(0.65, 1.5 - hits * 0.025);
}

/** 10 for a hit plus up to 10 for speed, plus a capped combo bonus. */
export function hitPoints(age: number, life: number, combo: number): number {
  const speed = Math.round(Math.max(0, 1 - age / life) * 10);
  return 10 + speed + Math.min(combo, 10);
}

function randomTarget(id: number, prev?: Target): Target {
  let x = 0;
  let y = 0;
  do {
    x = 10 + Math.random() * 80;
    y = 12 + Math.random() * 76;
  } while (prev && Math.hypot(x - prev.x, y - prev.y) < 20);
  return { id, x, y };
}

export function AimTrainerGame(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession(props);
  const { status, statusRef, setScore, finish } = session;
  const [target, setTarget] = useState<Target>(() => randomTarget(1));
  const [combo, setCombo] = useState(0);
  const [tally, setTally] = useState({ hits: 0, misses: 0, reaction: 0 });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const tallyRef = useRef(tally);
  const age = useRef(0);
  const idRef = useRef(1);
  const ringRef = useRef<HTMLSpanElement>(null);
  const countdown = useCountdown(DURATION_MS, status, () => finish(scoreRef.current));

  const commitTally = (next: typeof tally) => {
    tallyRef.current = next;
    setTally(next);
  };

  const spawn = (prev?: Target) => {
    age.current = 0;
    idRef.current += 1;
    setTarget(randomTarget(idRef.current, prev));
  };

  const miss = () => {
    comboRef.current = 0;
    setCombo(0);
    commitTally({ ...tallyRef.current, misses: tallyRef.current.misses + 1 });
  };

  const begin = () => {
    scoreRef.current = 0;
    comboRef.current = 0;
    setCombo(0);
    commitTally({ hits: 0, misses: 0, reaction: 0 });
    setScore(0);
    countdown.reset();
    spawn();
    session.start();
  };

  const hit = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (statusRef.current !== 'playing') return;
    const life = targetLife(tallyRef.current.hits);
    comboRef.current += 1;
    setCombo(comboRef.current);
    scoreRef.current += hitPoints(age.current, life, comboRef.current - 1);
    setScore(scoreRef.current);
    commitTally({ ...tallyRef.current, hits: tallyRef.current.hits + 1, reaction: tallyRef.current.reaction + age.current * 1000 });
    spawn(target);
  };

  useRafLoop((dt) => {
    if (statusRef.current !== 'playing') return;
    age.current += dt;
    const life = targetLife(tallyRef.current.hits);
    if (ringRef.current) ringRef.current.style.transform = `scale(${Math.max(0.15, 1 - age.current / life)})`;
    if (age.current >= life) {
      miss();
      spawn(target);
    }
  }, status === 'playing');

  const attempts = tally.hits + tally.misses;
  const accuracyPct = attempts ? Math.round((tally.hits / attempts) * 100) : 100;
  const avgReaction = tally.hits ? Math.round(tally.reaction / tally.hits) : 0;

  return (
    <GameFrame
      title={t('arcadeGames.aimTrainer.title')}
      icon={Crosshair}
      description={t('arcadeGames.aimTrainer.instructions')}
      hint={t('arcadeGames.aimTrainer.hint')}
      session={session}
      onRestart={begin}
      onStart={begin}
      stats={[
        { label: t('arcadeKit.time'), value: formatClock(countdown.left) },
        { label: t('arcadeKit.combo'), value: `x${combo}` },
      ]}
      overTitle={t('arcadeGames.aimTrainer.timeUp')}
      overSummary={
        <SummaryRow
          items={[
            { label: t('arcadeGames.aimTrainer.hits'), value: tally.hits },
            { label: t('arcadeGames.aimTrainer.accuracy'), value: `${accuracyPct}%` },
            { label: t('arcadeGames.aimTrainer.reaction'), value: `${avgReaction} ms` },
          ]}
        />
      }
    >
      <div
        className="relative min-h-0 flex-1 touch-none select-none overflow-hidden bg-surface"
        onPointerDown={() => {
          if (statusRef.current === 'playing') miss();
        }}
      >
        <button
          key={target.id}
          type="button"
          onPointerDown={hit}
          aria-label={t('arcadeGames.aimTrainer.target')}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
          style={{ left: `${target.x}%`, top: `${target.y}%`, width: TARGET_PX, height: TARGET_PX }}
        >
          <span ref={ringRef} className="absolute -inset-4 rounded-full border-2 border-brand/50" />
          <span className="absolute inset-[10px] rounded-full bg-brand" />
          <span className="absolute inset-[24px] rounded-full bg-surface" />
        </button>
      </div>
    </GameFrame>
  );
}
