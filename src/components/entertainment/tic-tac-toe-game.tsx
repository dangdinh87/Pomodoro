'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, GridNine, X } from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { GameFrame, OptionPills, SummaryRow } from './game-overlay';
import { useGameSession, type GameProps } from './game-kit';
import { chooseAiMove, findWinner, isFull, winLines, type Board, type Mark } from './tic-tac-toe-logic';

type Level = 'easy' | 'hard';
type Size = 3 | 4;
type RoundResult = 'win' | 'loss' | 'draw' | null;

const ROUNDS = 5;
const BLUNDER: Record<Level, number> = { easy: 0.35, hard: 0 };
const HUMAN: Mark = 'X';
const AI: Mark = 'O';

/** Win 3, draw 1. Hard and 4x4 each double the stakes. */
export function roundPoints(result: RoundResult, level: Level, size: Size): number {
  const base = result === 'win' ? 3 : result === 'draw' ? 1 : 0;
  return base * (level === 'hard' ? 2 : 1) * (size === 4 ? 2 : 1);
}

function emptyBoard(size: Size): Board {
  return Array<Mark | null>(size * size).fill(null);
}

export function TicTacToeGame(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession(props);
  const { status, statusRef, setScore, finish } = session;
  const [level, setLevel] = useState<Level>('easy');
  const [size, setSize] = useState<Size>(3);
  const [board, setBoard] = useState<Board>(() => emptyBoard(3));
  const [round, setRound] = useState(1);
  const [points, setPoints] = useState(0);
  const [tally, setTally] = useState({ win: 0, draw: 0, loss: 0 });
  const [turn, setTurn] = useState<Mark>(HUMAN);
  const [result, setResult] = useState<RoundResult>(null);
  const [winLine, setWinLine] = useState<number[]>([]);
  const pointsRef = useRef(0);

  const lines = useMemo(() => winLines(size, size), [size]);

  const humanStarts = (r: number) => r % 2 === 1;

  const settle = (next: Board, mover: Mark) => {
    const win = findWinner(next, lines);
    if (!win && !isFull(next)) {
      setTurn(mover === HUMAN ? AI : HUMAN);
      return;
    }
    const outcome: RoundResult = win ? (win.mark === HUMAN ? 'win' : 'loss') : 'draw';
    setResult(outcome);
    setWinLine(win?.line ?? []);
    setTally((prev) => ({ ...prev, [outcome as 'win' | 'draw' | 'loss']: prev[outcome as 'win' | 'draw' | 'loss'] + 1 }));
    pointsRef.current += roundPoints(outcome, level, size);
    setPoints(pointsRef.current);
    setScore(pointsRef.current);
  };

  const place = (index: number, mark: Mark) => {
    const next = board.map((c, i) => (i === index ? mark : c));
    setBoard(next);
    settle(next, mark);
  };

  useEffect(() => {
    if (status !== 'playing' || result || turn !== AI) return;
    const id = setTimeout(() => {
      place(chooseAiMove(board, AI, { size, need: size, blunder: BLUNDER[level] }), AI);
    }, 450);
    return () => clearTimeout(id);
    // place/settle close over the latest board; re-arming on these deps is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, result, turn, board]);

  const onCell = (index: number) => {
    if (statusRef.current !== 'playing' || result || turn !== HUMAN || board[index]) return;
    place(index, HUMAN);
  };

  const startRound = (nextRound: number) => {
    setBoard(emptyBoard(size));
    setResult(null);
    setWinLine([]);
    setRound(nextRound);
    setTurn(humanStarts(nextRound) ? HUMAN : AI);
  };

  const begin = () => {
    pointsRef.current = 0;
    setPoints(0);
    setScore(0);
    setTally({ win: 0, draw: 0, loss: 0 });
    startRound(1);
    session.start();
  };

  const next = () => {
    if (round >= ROUNDS) finish(pointsRef.current);
    else startRound(round + 1);
  };

  const levelOptions: { value: Level; label: string }[] = [
    { value: 'easy', label: t('arcadeGames.ticTacToe.easy') },
    { value: 'hard', label: t('arcadeGames.ticTacToe.hard') },
  ];
  const sizeOptions: { value: Size; label: string }[] = [
    { value: 3, label: '3 × 3' },
    { value: 4, label: '4 × 4' },
  ];

  const statusText = result
    ? t(result === 'win' ? 'arcadeGames.ticTacToe.youWin' : result === 'loss' ? 'arcadeGames.ticTacToe.aiWins' : 'arcadeGames.ticTacToe.draw')
    : turn === HUMAN
      ? t('arcadeGames.ticTacToe.yourTurn')
      : t('arcadeGames.ticTacToe.aiThinking');

  return (
    <GameFrame
      title={t('arcadeGames.ticTacToe.title')}
      icon={GridNine}
      description={t('arcadeGames.ticTacToe.instructions')}
      hint={t('arcadeGames.ticTacToe.hint')}
      session={session}
      onRestart={begin}
      onStart={begin}
      stats={[{ label: t('arcadeGames.ticTacToe.round'), value: `${round}/${ROUNDS}` }]}
      overTitle={t('arcadeGames.ticTacToe.matchOver')}
      overSummary={
        <SummaryRow
          items={[
            { label: t('arcadeGames.ticTacToe.wins'), value: tally.win },
            { label: t('arcadeGames.ticTacToe.draws'), value: tally.draw },
            { label: t('arcadeGames.ticTacToe.losses'), value: tally.loss },
          ]}
        />
      }
      readyExtras={
        <div className="flex flex-col gap-3">
          <OptionPills
            label={t('arcadeKit.difficulty')}
            value={level}
            options={levelOptions}
            onChange={(v) => {
              setLevel(v);
            }}
          />
          <OptionPills
            label={t('arcadeGames.ticTacToe.board')}
            value={size}
            options={sizeOptions}
            onChange={(v) => {
              setSize(v);
              setBoard(emptyBoard(v));
            }}
          />
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="min-h-6 text-sm font-medium text-ink-secondary" aria-live="polite" suppressHydrationWarning>
          {statusText}
        </p>
        <div
          className="grid aspect-square w-full gap-2"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            maxWidth: 'min(380px, calc(100dvh - 300px))',
          }}
        >
          {board.map((cell, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onCell(i)}
              disabled={Boolean(cell) || Boolean(result) || turn !== HUMAN || status !== 'playing'}
              aria-label={cell ? cell : t('arcadeGames.ticTacToe.emptyCell', { n: i + 1 })}
              className={cn(
                'flex items-center justify-center rounded-lg border bg-surface transition-colors duration-150',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand',
                winLine.includes(i) ? 'border-success' : 'border-border',
                !cell && !result && turn === HUMAN && 'hover:border-border-strong hover:bg-surface-hover',
              )}
            >
              {cell === 'X' && <X size={size === 3 ? 56 : 40} weight="bold" className="text-brand" />}
              {cell === 'O' && <Circle size={size === 3 ? 52 : 36} weight="bold" className="text-info-ink" />}
            </button>
          ))}
        </div>
        <div className="flex min-h-10 items-center gap-3">
          <span className="text-sm text-ink-muted tabular-nums" suppressHydrationWarning>
            {t('arcadeGames.ticTacToe.points', { points })}
          </span>
          {result && (
            <Button autoFocus onClick={next} suppressHydrationWarning>
              {round >= ROUNDS ? t('arcadeGames.ticTacToe.finish') : t('arcadeGames.ticTacToe.nextRound')}
            </Button>
          )}
        </div>
      </div>
    </GameFrame>
  );
}
