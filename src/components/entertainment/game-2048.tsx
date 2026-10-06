'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Hash } from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { GameFrame, GameOverlay } from './game-overlay';
import { useGameSession, useSwipe, type GameProps } from './game-kit';
import { canMove, moveTiles, spawnTile, SIZE, type Dir, type Tile } from './game-2048-logic';

const KEY_DIRS: Record<string, Dir> = {
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

const SLIDE_MS = 110;

const TILE_COLORS: Record<number, CSSProperties> = {
  2: { background: 'var(--surface-raised)', color: 'var(--ink)' },
  4: { background: 'var(--surface-hover)', color: 'var(--ink)' },
  8: { background: 'var(--cyan-solid)', color: '#fff' },
  16: { background: 'var(--blue-solid)', color: '#fff' },
  32: { background: 'var(--purple-solid)', color: '#fff' },
  64: { background: 'var(--pink-solid)', color: '#fff' },
  128: { background: 'var(--amber-solid)', color: '#fff' },
  256: { background: 'var(--green-solid)', color: '#fff' },
  512: { background: 'var(--rose-solid)', color: '#fff' },
  1024: { background: 'var(--accent-solid)', color: '#fff' },
  2048: { background: 'var(--gold)', color: '#1a1a1a' },
};

function tileStyle(value: number): CSSProperties {
  return TILE_COLORS[value] ?? { background: 'var(--ink)', color: 'var(--surface)' };
}

function fontSize(value: number): string {
  if (value < 100) return 'clamp(1.25rem, 8cqw, 2.25rem)';
  if (value < 1000) return 'clamp(1.1rem, 6.5cqw, 1.9rem)';
  return 'clamp(0.95rem, 5.2cqw, 1.5rem)';
}

function freshBoard(): Tile[] {
  return spawnTile(spawnTile([], 1), 2);
}

export function Game2048(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession({ ...props, initial: 'playing' });
  const { status, statusRef, setScore, finish, report } = session;
  const idRef = useRef(3);
  const [tiles, setTiles] = useState<Tile[]>(freshBoard);
  const [ghosts, setGhosts] = useState<Tile[]>([]);
  const [won, setWon] = useState(false);
  const [keepGoing, setKeepGoing] = useState(false);
  const scoreRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const ghostTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(ghostTimer.current), []);

  const handleMove = useCallback(
    (dir: Dir) => {
      if (statusRef.current !== 'playing' || (won && !keepGoing)) return;
      const res = moveTiles(tiles, dir);
      if (!res.moved) return;
      const next = spawnTile(res.tiles, idRef.current++);
      setTiles(next);
      setGhosts(res.ghosts);
      clearTimeout(ghostTimer.current);
      if (res.ghosts.length) ghostTimer.current = setTimeout(() => setGhosts([]), SLIDE_MS + 40);
      if (res.gained) {
        scoreRef.current += res.gained;
        setScore(scoreRef.current);
        report(scoreRef.current);
      }
      if (!keepGoing && next.some((tile) => tile.value >= 2048)) {
        setWon(true);
        return;
      }
      if (!canMove(next)) finish(scoreRef.current);
    },
    [tiles, won, keepGoing, statusRef, setScore, report, finish],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIRS[e.key];
      if (!dir || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      handleMove(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleMove]);

  useSwipe(boardRef, handleMove, 28);

  const restart = () => {
    clearTimeout(ghostTimer.current);
    idRef.current = 3;
    scoreRef.current = 0;
    setScore(0);
    setTiles(freshBoard());
    setGhosts([]);
    setWon(false);
    setKeepGoing(false);
    session.start();
  };

  const maxTile = tiles.reduce((m, tile) => Math.max(m, tile.value), 0);

  return (
    <GameFrame
      title={t('arcadeGames.game2048.title')}
      icon={Hash}
      description={t('arcadeGames.game2048.instructions')}
      hint={t('arcadeGames.game2048.hint')}
      session={session}
      onRestart={restart}
      overSummary={
        <p className="text-sm text-ink-secondary" suppressHydrationWarning>
          {t('arcadeGames.game2048.highestTile', { tile: maxTile })}
        </p>
      }
    >
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <div
          ref={boardRef}
          className="relative aspect-square touch-none select-none rounded-lg border border-border bg-surface p-2 [container-type:inline-size]"
          style={{ width: 'min(100%, 440px, calc(100dvh - 200px))' }}
          role="application"
          aria-label={t('arcadeGames.game2048.title')}
        >
          <div className="relative size-full">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
              {Array.from({ length: SIZE * SIZE }, (_, i) => (
                <div key={i} className="p-1">
                  <div className="size-full rounded bg-surface-raised/60" />
                </div>
              ))}
            </div>
            {[...ghosts, ...tiles].map((tile) => (
              <div
                key={tile.id}
                className="absolute left-0 top-0 size-1/4 p-1 motion-safe:transition-transform motion-safe:ease-out"
                style={{
                  transform: `translate(${tile.c * 100}%, ${tile.r * 100}%)`,
                  transitionDuration: `${SLIDE_MS}ms`,
                  zIndex: ghosts.includes(tile) ? 1 : 2,
                }}
              >
                <div
                  className={cn(
                    'flex size-full items-center justify-center rounded font-heading font-bold tabular-nums',
                    tile.isNew && 'motion-safe:animate-[tile-pop_160ms_ease-out]',
                    tile.merged && 'motion-safe:animate-[tile-pop_160ms_ease-out]',
                  )}
                  style={{ ...tileStyle(tile.value), fontSize: fontSize(tile.value) }}
                >
                  {tile.value}
                </div>
              </div>
            ))}
          </div>

          {won && !keepGoing && status === 'playing' && (
            <GameOverlay title={t('arcadeGames.game2048.reached')} description={t('arcadeGames.game2048.reachedHint')} className="rounded-lg">
              <div className="flex flex-wrap justify-center gap-2">
                <Button autoFocus onClick={() => setKeepGoing(true)}>
                  {t('arcadeGames.game2048.keepGoing')}
                </Button>
                <Button variant="secondary" onClick={() => finish(scoreRef.current)}>
                  {t('arcadeGames.game2048.finish')}
                </Button>
              </div>
            </GameOverlay>
          )}
        </div>
      </div>
      <style>{`@keyframes tile-pop{0%{transform:scale(.6)}60%{transform:scale(1.08)}100%{transform:scale(1)}}`}</style>
    </GameFrame>
  );
}
