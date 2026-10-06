'use client';

import { useEffect, useRef, useState } from 'react';
import { Anchor, Bell, Cat, Cloud, Fire, Heart, Leaf, Lightning, Moon, Planet, Star, Stack, Sun } from '@phosphor-icons/react/dist/ssr';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { GameFrame, OptionPills, SummaryRow } from './game-overlay';
import { formatClock, useGameSession, type GameProps } from './game-kit';

type Difficulty = 'easy' | 'medium' | 'hard';

const GRIDS: Record<Difficulty, { cols: number; pairs: number }> = {
  easy: { cols: 4, pairs: 6 },
  medium: { cols: 4, pairs: 8 },
  hard: { cols: 4, pairs: 10 },
};

const FACES: { icon: PhosphorIcon; color: string }[] = [
  { icon: Heart, color: 'var(--rose-solid)' },
  { icon: Star, color: 'var(--amber-solid)' },
  { icon: Moon, color: 'var(--purple-solid)' },
  { icon: Cloud, color: 'var(--blue-solid)' },
  { icon: Leaf, color: 'var(--green-solid)' },
  { icon: Fire, color: 'var(--accent-solid)' },
  { icon: Lightning, color: 'var(--cyan-solid)' },
  { icon: Cat, color: 'var(--pink-solid)' },
  { icon: Planet, color: 'var(--purple-solid)' },
  { icon: Sun, color: 'var(--amber-solid)' },
  { icon: Anchor, color: 'var(--blue-solid)' },
  { icon: Bell, color: 'var(--green-solid)' },
];

interface Card {
  uid: number;
  face: number;
}

/** Fewer moves and less time score higher; bigger boards are worth more. */
export function memoryScore(pairs: number, moves: number, seconds: number): number {
  return Math.max(pairs * 20, Math.round(pairs * 150 - moves * 10 - seconds * 3));
}

function deal(pairs: number): Card[] {
  const cards: Card[] = [];
  for (let face = 0; face < pairs; face++) {
    cards.push({ uid: face * 2, face }, { uid: face * 2 + 1, face });
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function NeonFlipGame(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession(props);
  const { status, statusRef, setScore, finish } = session;
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<Card[]>(() => deal(GRIDS.medium.pairs));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const lock = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const elapsed = useRef(0);
  const pairs = GRIDS[difficulty].pairs;

  useEffect(() => () => clearTimeout(timeout.current), []);

  useEffect(() => {
    if (status !== 'playing') return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      elapsed.current += now - last;
      last = now;
      setSeconds(Math.floor(elapsed.current / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [status]);

  const begin = () => {
    clearTimeout(timeout.current);
    lock.current = false;
    elapsed.current = 0;
    setCards(deal(pairs));
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setSeconds(0);
    setScore(0);
    session.start();
  };

  const flip = (index: number) => {
    if (statusRef.current !== 'playing' || lock.current || open.includes(index) || matched.has(index)) return;
    const nextOpen = [...open, index];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    const [a, b] = nextOpen;
    if (cards[a].face === cards[b].face) {
      const nextMatched = new Set(matched).add(a).add(b);
      setMatched(nextMatched);
      setOpen([]);
      if (nextMatched.size === cards.length) {
        const final = memoryScore(pairs, nextMoves, Math.floor(elapsed.current / 1000));
        setScore(final);
        finish(final);
      }
      return;
    }
    lock.current = true;
    timeout.current = setTimeout(() => {
      setOpen([]);
      lock.current = false;
    }, 750);
  };

  const options: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: t('arcadeGames.memoryMatch.easy') },
    { value: 'medium', label: t('arcadeGames.memoryMatch.medium') },
    { value: 'hard', label: t('arcadeGames.memoryMatch.hard') },
  ];

  const pickDifficulty = (value: Difficulty) => {
    setDifficulty(value);
    setCards(deal(GRIDS[value].pairs));
    setOpen([]);
    setMatched(new Set());
  };

  return (
    <GameFrame
      title={t('arcadeGames.memoryMatch.title')}
      icon={Stack}
      description={t('arcadeGames.memoryMatch.instructions')}
      hint={t('arcadeGames.memoryMatch.hint')}
      session={session}
      onRestart={begin}
      onStart={begin}
      stats={[
        { label: t('arcadeKit.moves'), value: moves },
        { label: t('arcadeKit.time'), value: formatClock(seconds * 1000) },
      ]}
      readyExtras={<OptionPills label={t('arcadeKit.difficulty')} value={difficulty} options={options} onChange={pickDifficulty} />}
      overTitle={t('arcadeGames.memoryMatch.cleared')}
      overSummary={
        <SummaryRow
          items={[
            { label: t('arcadeKit.moves'), value: moves },
            { label: t('arcadeKit.time'), value: formatClock(seconds * 1000) },
          ]}
        />
      }
    >
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <div
          className="grid w-full grid-cols-4 gap-2 sm:gap-3"
          style={{ maxWidth: `min(440px, calc((100dvh - 200px) * ${GRIDS[difficulty].cols} / ${Math.ceil((pairs * 2) / GRIDS[difficulty].cols)}))` }}
        >
          {cards.map((card, index) => {
            const face = FACES[card.face];
            const Icon = face.icon;
            const isMatched = matched.has(index);
            const isOpen = isMatched || open.includes(index);
            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => flip(index)}
                aria-label={isOpen ? t('arcadeGames.memoryMatch.cardFace', { n: card.face + 1 }) : t('arcadeGames.memoryMatch.cardBack')}
                aria-pressed={isOpen}
                className="group aspect-square [perspective:700px] focus-visible:outline-hidden"
              >
                <span
                  className={cn(
                    'relative block size-full [transform-style:preserve-3d] motion-safe:transition-transform motion-safe:duration-300',
                    isOpen && '[transform:rotateY(180deg)]',
                  )}
                >
                  <span className="absolute inset-0 flex items-center justify-center rounded-lg border border-border bg-surface-raised [backface-visibility:hidden] group-hover:bg-surface-hover group-focus-visible:ring-2 group-focus-visible:ring-brand">
                    <Stack size={22} className="text-ink-faint" />
                  </span>
                  <span
                    className={cn(
                      'absolute inset-0 flex items-center justify-center rounded-lg border bg-surface [backface-visibility:hidden] [transform:rotateY(180deg)]',
                      isMatched ? 'border-success' : 'border-border-strong',
                    )}
                  >
                    <Icon size={34} weight="fill" style={{ color: face.color }} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </GameFrame>
  );
}
