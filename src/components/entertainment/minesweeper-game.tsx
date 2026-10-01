'use client';

import { useEffect, useRef, useState } from 'react';
import { Bomb, Flag } from '@phosphor-icons/react/dist/ssr';

import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { GameFrame, OptionPills, SummaryRow } from './game-overlay';
import { formatClock, useGameSession, type GameProps } from './game-kit';
import { createBoard, floodReveal, isWon, MINE_LEVELS, mineScore, neighbors, type Cell, type MineLevel } from './minesweeper-logic';

const NUMBER_COLORS = [
  '',
  'var(--blue-solid)',
  'var(--green-solid)',
  'var(--rose-solid)',
  'var(--purple-solid)',
  'var(--amber-solid)',
  'var(--cyan-solid)',
  'var(--ink)',
  'var(--ink-muted)',
];

const LONG_PRESS_MS = 400;

export function MinesweeperGame(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession(props);
  const { status, statusRef, setScore, finish } = session;
  const [level, setLevel] = useState<MineLevel>('easy');
  const cfg = MINE_LEVELS[level];
  const [board, setBoard] = useState<Cell[] | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [flagMode, setFlagMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [outcome, setOutcome] = useState<'won' | 'lost' | null>(null);
  const [exploded, setExploded] = useState(-1);
  const elapsed = useRef(0);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const press = useRef<{ timer?: ReturnType<typeof setTimeout>; fired: boolean }>({ fired: false });

  useEffect(
    () => () => {
      clearTimeout(finishTimer.current);
      clearTimeout(press.current.timer);
    },
    [],
  );

  useEffect(() => {
    if (status !== 'playing' || !board || outcome) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      elapsed.current += now - last;
      last = now;
      setSeconds(Math.floor(elapsed.current / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [status, board, outcome]);

  const reset = () => {
    clearTimeout(finishTimer.current);
    elapsed.current = 0;
    setBoard(null);
    setRevealed(new Set());
    setFlagged(new Set());
    setSeconds(0);
    setOutcome(null);
    setExploded(-1);
    setScore(0);
  };

  const begin = () => {
    reset();
    session.start();
  };

  const conclude = (result: 'won' | 'lost', cells: Cell[]) => {
    setOutcome(result);
    const score = result === 'won' ? mineScore(cfg.mines, Math.floor(elapsed.current / 1000)) : 0;
    if (result === 'won') setScore(score);
    if (result === 'lost') setRevealed((prev) => new Set([...prev, ...cells.flatMap((c, i) => (c.mine ? [i] : []))]));
    finishTimer.current = setTimeout(() => finish(score), result === 'won' ? 500 : 1100);
  };

  const revealFrom = (index: number, current: Cell[] | null, flags: Set<number>, already: Set<number>) => {
    const cells = current ?? createBoard(cfg, index);
    if (!current) setBoard(cells);
    if (cells[index].mine) {
      setExploded(index);
      conclude('lost', cells);
      return;
    }
    const next = floodReveal(cells, cfg.cols, cfg.rows, already, flags, index);
    setRevealed(next);
    if (isWon(cells, next)) conclude('won', cells);
  };

  const toggleFlag = (index: number) => {
    if (revealed.has(index)) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (!next.delete(index)) next.add(index);
      return next;
    });
  };

  const activate = (index: number) => {
    if (statusRef.current !== 'playing' || outcome) return;
    if (press.current.fired) {
      press.current.fired = false;
      return;
    }
    if (flagMode && !revealed.has(index)) {
      toggleFlag(index);
      return;
    }
    if (flagged.has(index)) return;
    if (revealed.has(index) && board) {
      const around = neighbors(index, cfg.cols, cfg.rows);
      if (board[index].adjacent === 0 || around.filter((n) => flagged.has(n)).length !== board[index].adjacent) return;
      let nextRevealed = revealed;
      let hit = -1;
      for (const n of around) {
        if (flagged.has(n) || nextRevealed.has(n)) continue;
        if (board[n].mine) {
          hit = n;
          break;
        }
        nextRevealed = floodReveal(board, cfg.cols, cfg.rows, nextRevealed, flagged, n);
      }
      if (hit >= 0) {
        setExploded(hit);
        conclude('lost', board);
      } else {
        setRevealed(nextRevealed);
        if (isWon(board, nextRevealed)) conclude('won', board);
      }
      return;
    }
    revealFrom(index, board, flagged, revealed);
  };

  const onPointerDown = (index: number, e: React.PointerEvent) => {
    press.current.fired = false;
    if (e.pointerType === 'mouse') return;
    clearTimeout(press.current.timer);
    press.current.timer = setTimeout(() => {
      if (statusRef.current !== 'playing' || outcome) return;
      press.current.fired = true;
      toggleFlag(index);
      navigator.vibrate?.(12);
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => clearTimeout(press.current.timer);

  const options: { value: MineLevel; label: string }[] = [
    { value: 'easy', label: t('arcadeGames.minesweeper.easy') },
    { value: 'medium', label: t('arcadeGames.minesweeper.medium') },
    { value: 'hard', label: t('arcadeGames.minesweeper.hard') },
  ];

  const lostView = outcome === 'lost';
  const cells = Array.from({ length: cfg.cols * cfg.rows }, (_, i) => i);

  return (
    <GameFrame
      title={t('arcadeGames.minesweeper.title')}
      icon={Bomb}
      description={t('arcadeGames.minesweeper.instructions')}
      hint={t('arcadeGames.minesweeper.hint')}
      session={session}
      onRestart={begin}
      onStart={begin}
      stats={[
        { label: t('arcadeGames.minesweeper.mines'), value: Math.max(0, cfg.mines - flagged.size) },
        { label: t('arcadeKit.time'), value: formatClock(seconds * 1000) },
      ]}
      readyExtras={
        <OptionPills
          label={t('arcadeKit.difficulty')}
          value={level}
          options={options}
          onChange={(v) => {
            setLevel(v);
            reset();
          }}
        />
      }
      overTitle={lostView ? t('arcadeGames.minesweeper.boom') : t('arcadeGames.minesweeper.cleared')}
      overSummary={
        <SummaryRow
          items={[
            { label: t('arcadeKit.time'), value: formatClock(seconds * 1000) },
            { label: t('arcadeGames.minesweeper.mines'), value: cfg.mines },
          ]}
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-3">
        <div
          className="grid w-full gap-[3px] rounded-lg border border-border bg-surface p-1.5"
          style={{
            gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))`,
            maxWidth: `min(440px, calc((100dvh - 230px) * ${cfg.cols} / ${cfg.rows}))`,
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {cells.map((i) => {
            const isRevealed = revealed.has(i);
            const cell = board?.[i];
            const isFlag = flagged.has(i);
            const isMine = isRevealed && cell?.mine;
            return (
              <button
                key={i}
                type="button"
                onClick={() => activate(i)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (statusRef.current === 'playing' && !outcome) toggleFlag(i);
                }}
                onPointerDown={(e) => onPointerDown(i, e)}
                onPointerUp={cancelPress}
                onPointerLeave={cancelPress}
                onPointerCancel={cancelPress}
                onKeyDown={(e) => {
                  if ((e.key === 'f' || e.key === 'F') && statusRef.current === 'playing' && !outcome) toggleFlag(i);
                }}
                aria-label={
                  isFlag
                    ? t('arcadeGames.minesweeper.cellFlag', { n: i + 1 })
                    : isRevealed
                      ? t('arcadeGames.minesweeper.cellOpen', { n: i + 1, count: cell?.adjacent ?? 0 })
                      : t('arcadeGames.minesweeper.cellHidden', { n: i + 1 })
                }
                className={cn(
                  'flex aspect-square touch-manipulation select-none items-center justify-center rounded-[5px] border font-heading text-base font-bold leading-none sm:text-lg',
                  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand',
                  isRevealed ? 'border-border bg-surface' : 'border-border bg-surface-raised hover:bg-surface-hover',
                  i === exploded && 'border-danger bg-danger-bg',
                )}
              >
                {isMine ? (
                  <Bomb size={18} weight="fill" className="text-danger-ink" />
                ) : isFlag && !isRevealed ? (
                  <Flag size={16} weight="fill" className="text-brand" />
                ) : isRevealed && cell && cell.adjacent > 0 ? (
                  <span style={{ color: NUMBER_COLORS[cell.adjacent] }}>{cell.adjacent}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-pressed={flagMode}
          onClick={() => setFlagMode((v) => !v)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page',
            flagMode ? 'border-transparent bg-primary text-primary-foreground' : 'border-border text-ink-secondary hover:bg-surface-hover',
          )}
          suppressHydrationWarning
        >
          <Flag size={16} weight={flagMode ? 'fill' : 'regular'} />
          {t('arcadeGames.minesweeper.flagMode')}
        </button>
      </div>
    </GameFrame>
  );
}
