'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { Delete, CornerDownLeft, Lightbulb, RotateCcw } from 'lucide-react';

interface WordleGameProps {
  fullscreen?: boolean;
  onGameEnd?: (score: number) => void;
}

// Easy common words (more recognizable)
const EASY_WORDS = [
  'APPLE', 'BEACH', 'BREAD', 'CHAIR', 'DANCE', 'DREAM', 'EARTH', 'FRUIT', 'GRAPE', 'HAPPY',
  'HEART', 'HOUSE', 'JUICE', 'LAUGH', 'LIGHT', 'MONEY', 'MUSIC', 'NIGHT', 'OCEAN', 'PARTY',
  'PEACE', 'PHONE', 'PLANT', 'QUIET', 'RIVER', 'SLEEP', 'SMILE', 'SOUND', 'SPACE', 'SUGAR',
  'SWEET', 'TABLE', 'TRAIN', 'WATER', 'WORLD', 'YOUNG', 'BRAIN', 'CHILD', 'CLOUD', 'COLOR',
  'CREAM', 'CROWN', 'EARTH', 'FLASH', 'FRESH', 'GLASS', 'GRASS', 'GREEN', 'HORSE', 'LEMON',
  'MAGIC', 'MOUSE', 'MOVIE', 'PAPER', 'PIANO', 'PIZZA', 'QUEEN', 'RADIO', 'ROUND', 'SALAD',
  'SMART', 'SNAKE', 'STORM', 'STORY', 'SUNNY', 'TIGER', 'TOWER', 'VIDEO', 'VOICE', 'WHEEL',
];

// Medium difficulty words
const MEDIUM_WORDS = [
  'ABOUT', 'AFTER', 'AGAIN', 'ALLOW', 'ALONE', 'AMONG', 'ANGRY', 'BASIC', 'BEGIN', 'BEING',
  'BELOW', 'BLACK', 'BLOOD', 'BOARD', 'BOUND', 'BRAND', 'BREAK', 'BRING', 'BROWN', 'BUILD',
  'CARRY', 'CATCH', 'CAUSE', 'CHAIN', 'CHEAP', 'CHECK', 'CHEST', 'CLEAN', 'CLEAR', 'CLIMB',
  'CLOSE', 'COAST', 'COULD', 'COUNT', 'COVER', 'CRASH', 'CROSS', 'CROWD', 'DOUBT', 'DRIVE',
  'EARLY', 'EMPTY', 'ENJOY', 'ENTER', 'EQUAL', 'EVENT', 'EVERY', 'EXTRA', 'FIELD', 'FIGHT',
  'FINAL', 'FIRST', 'FLOOR', 'FOCUS', 'FORCE', 'FOUND', 'FRAME', 'FRONT', 'GIVEN', 'GOING',
  'GRAND', 'GREAT', 'GROUP', 'GROWN', 'GUARD', 'GUIDE', 'HEAVY', 'HUMAN', 'ISSUE', 'LARGE',
  'LATER', 'LEARN', 'LEAVE', 'LEVEL', 'LIMIT', 'LOCAL', 'LOWER', 'LUNCH', 'MAJOR', 'MARCH',
  'MATCH', 'MAYBE', 'MEANT', 'METAL', 'MIGHT', 'MODEL', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT',
];

// Hard words (less common)
const HARD_WORDS = [
  'ACUTE', 'ADOPT', 'AGENT', 'ALIEN', 'ALIGN', 'ARISE', 'ARMOR', 'ASSET', 'BLEND', 'BLISS',
  'BROAD', 'CHAOS', 'CHARM', 'CIVIL', 'CLAIM', 'CRAFT', 'CRUDE', 'DEALT', 'DEBUT', 'DEPTH',
  'DRAFT', 'DWARF', 'ELITE', 'ERUPT', 'ETHOS', 'FAITH', 'FAULT', 'FEAST', 'FIBER', 'FLAME',
  'FLASK', 'FORGE', 'FRAUD', 'FROST', 'GHOST', 'GIANT', 'GLARE', 'GLEAM', 'GRAIN', 'GRASP',
  'GRIEF', 'GRIND', 'GUILD', 'HAUNT', 'HOIST', 'HORDE', 'HUMBL', 'IRONY', 'JUDGE', 'KNEEL',
  'LEASH', 'LUNAR', 'MANOR', 'MARSH', 'MERGE', 'MIDST', 'MIRTH', 'MOIST', 'MOTIF', 'MOUNT',
  'NAVAL', 'NOBLE', 'ORBIT', 'OVERT', 'PATCH', 'PIOUS', 'PLUMB', 'POUCH', 'PRANK', 'PRISM',
  'PRONE', 'PROWL', 'QUAKE', 'QUEST', 'QUOTA', 'REALM', 'RECON', 'REIGN', 'RIGID', 'RISKY',
  'ROVER', 'RURAL', 'SAINT', 'SHEER', 'SHIFT', 'SKULL', 'SLANG', 'SLOPE', 'SPAWN', 'SPITE',
];

type Difficulty = 'easy' | 'medium' | 'hard';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
];

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

interface LetterState {
  letter: string;
  status: LetterStatus;
}

const getWordList = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy': return EASY_WORDS;
    case 'medium': return MEDIUM_WORDS;
    case 'hard': return HARD_WORDS;
  }
};

export const WordleGame = memo(function WordleGame({
  fullscreen = false,
  onGameEnd,
}: WordleGameProps) {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<LetterState[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [keyboardStatus, setKeyboardStatus] = useState<Record<string, LetterStatus>>({});
  const [shake, setShake] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState<Set<number>>(new Set());

  const { t } = useI18n();

  const wordList = getWordList(difficulty);
  const maxHints = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 1 : 0;

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const words = getWordList(diff);
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess('');
    setCurrentRow(0);
    setIsGameOver(false);
    setIsWon(false);
    setIsStarted(true);
    setKeyboardStatus({});
    setHintsUsed(0);
    setRevealedLetters(new Set());
  }, []);

  const useHint = useCallback(() => {
    if (hintsUsed >= maxHints || isGameOver) return;

    // Find unrevealed positions
    const unrevealedPositions: number[] = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (!revealedLetters.has(i)) {
        // Check if this letter is already known from guesses
        const isKnown = guesses.some(guess => guess[i]?.status === 'correct');
        if (!isKnown) {
          unrevealedPositions.push(i);
        }
      }
    }

    if (unrevealedPositions.length === 0) return;

    // Reveal a random unrevealed position
    const posToReveal = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
    setRevealedLetters(prev => new Set(Array.from(prev).concat(posToReveal)));
    setHintsUsed(prev => prev + 1);
  }, [hintsUsed, maxHints, isGameOver, revealedLetters, guesses, targetWord]);

  const evaluateGuess = useCallback((guess: string, target: string): LetterState[] => {
    const result: LetterState[] = [];
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    const targetCounts: Record<string, number> = {};

    for (const letter of targetLetters) {
      targetCounts[letter] = (targetCounts[letter] || 0) + 1;
    }

    // First pass: mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = { letter: guessLetters[i], status: 'correct' };
        targetCounts[guessLetters[i]]--;
      } else {
        result[i] = { letter: guessLetters[i], status: 'empty' };
      }
    }

    // Second pass: mark present/absent letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i].status === 'empty') {
        if (targetCounts[guessLetters[i]] > 0) {
          result[i].status = 'present';
          targetCounts[guessLetters[i]]--;
        } else {
          result[i].status = 'absent';
        }
      }
    }

    return result;
  }, []);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const evaluation = evaluateGuess(currentGuess, targetWord);
    const newGuesses = [...guesses, evaluation];
    setGuesses(newGuesses);

    // Update keyboard status
    const newKeyboardStatus = { ...keyboardStatus };
    for (const { letter, status } of evaluation) {
      const currentStatus = newKeyboardStatus[letter];
      if (!currentStatus ||
          (status === 'correct') ||
          (status === 'present' && currentStatus === 'absent')) {
        newKeyboardStatus[letter] = status;
      }
    }
    setKeyboardStatus(newKeyboardStatus);

    // Check win
    if (currentGuess === targetWord) {
      setIsWon(true);
      setIsGameOver(true);
      // Score based on attempts and difficulty
      const difficultyBonus = difficulty === 'hard' ? 200 : difficulty === 'medium' ? 100 : 0;
      const hintPenalty = hintsUsed * 50;
      const attemptBonus = (MAX_ATTEMPTS - currentRow - 1) * 100;
      const score = Math.max(0, 100 + attemptBonus + difficultyBonus - hintPenalty);
      onGameEnd?.(score);
      return;
    }

    // Check lose
    if (currentRow >= MAX_ATTEMPTS - 1) {
      setIsGameOver(true);
      onGameEnd?.(0);
      return;
    }

    setCurrentRow(prev => prev + 1);
    setCurrentGuess('');
  }, [currentGuess, currentRow, evaluateGuess, guesses, keyboardStatus, onGameEnd, targetWord, difficulty, hintsUsed]);

  const handleKeyPress = useCallback((key: string) => {
    if (isGameOver) return;

    if (key === 'ENTER') {
      submitGuess();
      return;
    }

    if (key === 'DELETE' || key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }

    if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess.length, isGameOver, submitGuess]);

  // Keyboard event listener
  useEffect(() => {
    if (!isStarted || isGameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleKeyPress(key === 'BACKSPACE' ? 'DELETE' : key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, isGameOver, handleKeyPress]);

  const getLetterStyle = (status: LetterStatus) => {
    switch (status) {
      case 'correct':
        return 'bg-green-500 border-green-500 text-white';
      case 'present':
        return 'bg-yellow-500 border-yellow-500 text-white';
      case 'absent':
        return 'bg-gray-600 border-gray-600 text-white';
      default:
        return 'bg-transparent border-gray-500';
    }
  };

  const getKeyStyle = (key: string) => {
    const status = keyboardStatus[key];
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white border-green-500';
      case 'present':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'absent':
        return 'bg-gray-700 text-gray-400 border-gray-700';
      default:
        return 'bg-gray-600 text-white border-gray-600 hover:bg-gray-500';
    }
  };

  const difficultyInfo = {
    easy: { label: 'Dễ', color: 'text-green-400 border-green-400', hints: 2 },
    medium: { label: 'Trung bình', color: 'text-yellow-400 border-yellow-400', hints: 1 },
    hard: { label: 'Khó', color: 'text-red-400 border-red-400', hints: 0 },
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden",
        fullscreen ? "w-full h-full p-4" : "w-full h-[650px] rounded-lg p-4"
      )}
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
    >
      {/* Difficulty Selection / Start Screen */}
      {!isStarted && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col justify-center items-center z-10 p-6">
          <h1
            className="text-white uppercase tracking-widest text-center font-bold mb-4 text-3xl md:text-4xl"
            style={{ textShadow: '0 0 20px #22c55e' }}
          >
            📝 Đoán Từ
          </h1>

          {/* How to play */}
          <div className="bg-gray-800/60 rounded-xl p-4 mb-6 max-w-sm w-full">
            <h3 className="text-emerald-400 font-bold mb-3 text-center">Cách chơi</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-white bg-green-500 px-1.5 rounded text-xs font-bold">A</span>
                <span><strong>Xanh lá</strong> = đúng chữ, đúng vị trí</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white bg-yellow-500 px-1.5 rounded text-xs font-bold">B</span>
                <span><strong>Vàng</strong> = đúng chữ, sai vị trí</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white bg-gray-600 px-1.5 rounded text-xs font-bold">C</span>
                <span><strong>Xám</strong> = không có trong từ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">💡</span>
                <span>Dùng <strong>Gợi ý</strong> để lộ 1 chữ cái (tùy độ khó)</span>
              </li>
            </ul>
          </div>

          <p className="text-gray-400 mb-4">Chọn độ khó:</p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
              <Button
                key={diff}
                onClick={() => startGame(diff)}
                className={cn(
                  "bg-transparent border-2 uppercase tracking-wider font-bold py-3",
                  "hover:scale-105 transition-all",
                  difficultyInfo[diff].color,
                  diff === 'easy' && "hover:bg-green-400 hover:text-black",
                  diff === 'medium' && "hover:bg-yellow-400 hover:text-black",
                  diff === 'hard' && "hover:bg-red-400 hover:text-white"
                )}
              >
                {difficultyInfo[diff].label}
                <span className="ml-2 text-xs opacity-70">
                  ({difficultyInfo[diff].hints} gợi ý)
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {isStarted && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between w-full max-w-sm mb-3">
            <div className={cn("text-sm font-medium", difficultyInfo[difficulty].color)}>
              {difficultyInfo[difficulty].label}
            </div>
            <div className="flex items-center gap-2">
              {maxHints > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={useHint}
                  disabled={hintsUsed >= maxHints || isGameOver}
                  className={cn(
                    "h-8 px-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10",
                    (hintsUsed >= maxHints || isGameOver) && "opacity-40"
                  )}
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {maxHints - hintsUsed}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsStarted(false)}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                aria-label={t('entertainment.controls.back')}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hint display */}
          {revealedLetters.size > 0 && (
            <div className="flex gap-1 mb-2">
              <span className="text-gray-400 text-xs">Gợi ý:</span>
              {Array(WORD_LENGTH).fill(null).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center text-xs font-bold rounded",
                    revealedLetters.has(i) ? "bg-yellow-500/30 text-yellow-300" : "bg-gray-700/50 text-gray-500"
                  )}
                >
                  {revealedLetters.has(i) ? targetWord[i] : '?'}
                </span>
              ))}
            </div>
          )}

          {/* Game board */}
          <div className="flex flex-col gap-1.5 mb-4">
            {Array(MAX_ATTEMPTS).fill(null).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className={cn(
                  "flex gap-1.5",
                  rowIndex === currentRow && shake && "animate-shake"
                )}
              >
                {Array(WORD_LENGTH).fill(null).map((_, colIndex) => {
                  let letter = '';
                  let status: LetterStatus = 'empty';

                  if (rowIndex < guesses.length) {
                    letter = guesses[rowIndex][colIndex].letter;
                    status = guesses[rowIndex][colIndex].status;
                  } else if (rowIndex === currentRow && colIndex < currentGuess.length) {
                    letter = currentGuess[colIndex];
                  }

                  return (
                    <div
                      key={colIndex}
                      className={cn(
                        "w-12 h-12 md:w-14 md:h-14 border-2 rounded-lg flex items-center justify-center text-xl font-bold transition-all duration-200",
                        getLetterStyle(status),
                        letter && status === 'empty' && "border-gray-400 scale-105"
                      )}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Keyboard */}
          <div className="flex flex-col gap-1.5">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1">
                {row.map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    onClick={() => handleKeyPress(key)}
                    className={cn(
                      "h-11 md:h-12 border transition-all font-semibold rounded-lg",
                      key === 'ENTER' || key === 'DELETE'
                        ? "px-2 md:px-3 text-xs"
                        : "w-8 md:w-9 text-sm",
                      getKeyStyle(key)
                    )}
                    aria-label={
                      key === 'DELETE' ? t('entertainment.controls.delete') :
                      key === 'ENTER' ? t('entertainment.controls.enter') :
                      key
                    }
                  >
                    {key === 'DELETE' ? <Delete className="h-4 w-4" /> :
                     key === 'ENTER' ? <CornerDownLeft className="h-4 w-4" /> : key}
                  </Button>
                ))}
              </div>
            ))}
          </div>

          {/* Game Over overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col justify-center items-center z-20 p-6">
              <h2
                className={cn(
                  "text-4xl md:text-5xl font-bold mb-4",
                  isWon ? "text-green-400" : "text-red-400"
                )}
                style={{ textShadow: isWon ? '0 0 30px #22c55e' : '0 0 30px #ef4444' }}
              >
                {isWon ? '🎉 Xuất sắc!' : '😢 Thua rồi!'}
              </h2>

              <div className="bg-gray-800/60 rounded-xl p-4 mb-4 text-center">
                <p className="text-gray-300 mb-2">
                  Từ đúng: <span className="text-green-400 font-bold text-xl">{targetWord}</span>
                </p>
                {isWon && (
                  <p className="text-gray-400 text-sm">
                    Giải trong {currentRow + 1} lượt {hintsUsed > 0 && `(dùng ${hintsUsed} gợi ý)`}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => startGame(difficulty)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6"
                >
                  Chơi lại
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsStarted(false)}
                  className="border-gray-500 text-gray-300 hover:bg-gray-700"
                >
                  Đổi độ khó
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
});
