'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { ArrowCounterClockwise, Stack, Trophy } from '@phosphor-icons/react/dist/ssr';
import { GameOverlay, GameStat } from './game-overlay';

interface NeonFlipGameProps {
  fullscreen?: boolean;
  onGameEnd?: (score: number) => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['⚡', '🧬', '👾', '🌈', '🛸', '🛰️', '💎', '🍄'];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Calculate score: fewer moves and less time = higher score
function calculateScore(moves: number, timeSeconds: number, totalPairs: number): number {
  const perfectMoves = totalPairs; // Minimum possible moves
  const moveBonus = Math.max(0, (perfectMoves * 3 - moves) * 50);
  const timeBonus = Math.max(0, (120 - timeSeconds) * 5);
  const baseScore = totalPairs * 100;
  return baseScore + moveBonus + timeBonus;
}

export const NeonFlipGame = memo(function MemoryMatchGame({
  fullscreen = false,
  onGameEnd,
}: NeonFlipGameProps) {
  const { t } = useI18n();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = useCallback(() => {
    const pairs = [...EMOJIS, ...EMOJIS];
    const shuffled = shuffleArray(pairs);
    const newCards: Card[] = shuffled.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(newCards);
    setFlippedIndices([]);
    setMoves(0);
    setTimer(0);
    setIsLocked(false);
    setGameStarted(false);
    setGameWon(false);
    setShowStartScreen(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  }, []);

  const handleCardClick = useCallback((index: number) => {
    if (isLocked) return;

    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    // Start timer on first click
    if (!gameStarted) {
      setGameStarted(true);
      startTimer();
    }

    // Flip the card
    setCards(prev => prev.map((c, i) =>
      i === index ? { ...c, isFlipped: true } : c
    ));

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsLocked(true);

      const [first, second] = newFlipped;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, isMatched: true } : c
          ));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 300);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, isFlipped: false } : c
          ));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 800);
      }
    }
  }, [cards, flippedIndices, isLocked, gameStarted, startTimer]);

  // Check for win
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const finalScore = calculateScore(moves, timer, EMOJIS.length);

      setTimeout(() => {
        setGameWon(true);
        if (onGameEnd) {
          onGameEnd(finalScore);
        }
      }, 500);
    }
  }, [cards, moves, timer, onGameEnd]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden",
        fullscreen ? "w-full h-full p-4" : "w-full min-h-[600px] rounded-lg p-4"
      )}
      style={{ background: '#1c1917' }}
    >
      {showStartScreen && (
        <GameOverlay
          title={t('entertainment.games.memoryMatch.title')}
          description={t('entertainment.games.memoryMatch.instructions')}
          className="z-20 bg-black/80"
        >
          <Button onClick={initGame} size="lg" suppressHydrationWarning>
            {t('entertainment.playNow')}
          </Button>
        </GameOverlay>
      )}

      {gameWon && (
        <GameOverlay title={t('entertainment.games.memoryMatch.win')} className="z-30 bg-black/80">
          <Trophy size={40} weight="fill" className="text-gold" />
          <div className="flex gap-3">
            <GameStat label={t('entertainment.games.snake.score')} value={calculateScore(moves, timer, EMOJIS.length)} />
            <GameStat label={t('entertainment.games.memoryMatch.moves')} value={moves} />
            <GameStat label={t('entertainment.games.memoryMatch.time')} value={formatTime(timer)} />
          </div>
          <Button onClick={initGame} size="lg" suppressHydrationWarning>
            {t('entertainment.playAgain')}
          </Button>
        </GameOverlay>
      )}

      {/* Header Stats */}
      {!showStartScreen && (
        <div className={cn(
          "w-full max-w-md mb-6",
          fullscreen ? "mt-16" : ""
        )}>
          <div className="grid grid-cols-2 gap-3">
            <GameStat label={t('entertainment.games.memoryMatch.clicks')} value={moves} className="py-2" />
            <GameStat label={t('entertainment.games.memoryMatch.time')} value={formatTime(timer)} className="py-2" />
          </div>
        </div>
      )}

      {/* Game Board */}
      {!showStartScreen && (
        <div className="grid grid-cols-4 gap-2 md:gap-3 w-full max-w-md aspect-square mb-6">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="aspect-square"
              style={{ perspective: '1000px' }}
            >
              <div
                onClick={() => handleCardClick(index)}
                className={cn(
                  "relative w-full h-full cursor-pointer transition-transform duration-300",
                  card.isFlipped || card.isMatched ? "[transform:rotateY(180deg)]" : ""
                )}
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {/* Front (hidden side) */}
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                    border: '2px solid #f59e0b',
                    boxShadow: 'inset 0 0 10px rgba(245, 158, 11, 0.15)'
                  }}
                >
                  <Stack size={24} className="text-amber-500 opacity-40" />
                </div>

                {/* Back (emoji side) */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl flex items-center justify-center text-3xl md:text-4xl",
                    card.isMatched && "animate-pulse"
                  )}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: '#1c1917',
                    border: card.isMatched ? '2px solid #22c55e' : '2px solid #fb7185',
                    boxShadow: card.isMatched
                      ? '0 0 25px rgba(34, 197, 94, 0.5)'
                      : 'inset 0 0 20px rgba(251, 113, 133, 0.15)'
                  }}
                >
                  {card.emoji}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset Button */}
      {!showStartScreen && !gameWon && (
        <Button
          onClick={initGame}
          variant="secondary"
        >
          <ArrowCounterClockwise size={16} className="mr-2" />
          {t('entertainment.games.memoryMatch.reset')}
        </Button>
      )}
    </div>
  );
});
