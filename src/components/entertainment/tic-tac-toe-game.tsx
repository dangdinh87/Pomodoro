'use client';

import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface TicTacToeGameProps {
  fullscreen?: boolean;
  onGameEnd?: (score: number) => void;
}

type Player = 'X' | 'O' | '';
type GameMode = 3 | 4 | null;

const HUMAN: Player = 'X';
const AI: Player = 'O';

function generateWinConditions(size: number, needed: number): number[][] {
  const conditions: number[][] = [];

  // Rows
  for (let i = 0; i < size; i++) {
    for (let j = 0; j <= size - needed; j++) {
      const row: number[] = [];
      for (let k = 0; k < needed; k++) row.push(i * size + j + k);
      conditions.push(row);
    }
  }

  // Columns
  for (let i = 0; i <= size - needed; i++) {
    for (let j = 0; j < size; j++) {
      const col: number[] = [];
      for (let k = 0; k < needed; k++) col.push((i + k) * size + j);
      conditions.push(col);
    }
  }

  // Diagonal down-right
  for (let i = 0; i <= size - needed; i++) {
    for (let j = 0; j <= size - needed; j++) {
      const diag: number[] = [];
      for (let k = 0; k < needed; k++) diag.push((i + k) * size + (j + k));
      conditions.push(diag);
    }
  }

  // Diagonal down-left
  for (let i = 0; i <= size - needed; i++) {
    for (let j = needed - 1; j < size; j++) {
      const diag: number[] = [];
      for (let k = 0; k < needed; k++) diag.push((i + k) * size + (j - k));
      conditions.push(diag);
    }
  }

  return conditions;
}

function checkWin(board: Player[], player: Player, winConditions: number[][]): number[] | null {
  for (const condition of winConditions) {
    if (condition.every(idx => board[idx] === player)) {
      return condition;
    }
  }
  return null;
}

function minimax(
  board: Player[],
  player: Player,
  depth: number,
  alpha: number,
  beta: number,
  maxDepth: number,
  winConditions: number[][]
): { index: number; score: number } {
  const availSpots = board.map((val, idx) => (val === '' ? idx : null)).filter((val): val is number => val !== null);

  if (checkWin(board, HUMAN, winConditions)) return { index: -1, score: -10 + depth };
  if (checkWin(board, AI, winConditions)) return { index: -1, score: 10 - depth };
  if (availSpots.length === 0 || depth >= maxDepth) return { index: -1, score: 0 };

  if (player === AI) {
    let bestScore = -Infinity;
    let bestMoveIndex = availSpots[0];
    for (const spot of availSpots) {
      board[spot] = player;
      const score = minimax(board, HUMAN, depth + 1, alpha, beta, maxDepth, winConditions).score;
      board[spot] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMoveIndex = spot;
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }
    return { index: bestMoveIndex, score: bestScore };
  } else {
    let bestScore = Infinity;
    let bestMoveIndex = availSpots[0];
    for (const spot of availSpots) {
      board[spot] = player;
      const score = minimax(board, AI, depth + 1, alpha, beta, maxDepth, winConditions).score;
      board[spot] = '';
      if (score < bestScore) {
        bestScore = score;
        bestMoveIndex = spot;
      }
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }
    return { index: bestMoveIndex, score: bestScore };
  }
}

export const TicTacToeGame = memo(function TicTacToeGame({
  fullscreen = false,
  onGameEnd,
}: TicTacToeGameProps) {
  const { t } = useI18n();
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [board, setBoard] = useState<Player[]>([]);
  const [gameActive, setGameActive] = useState(true);
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [winConditions, setWinConditions] = useState<number[][]>([]);

  const initBoard = useCallback((size: number) => {
    const newBoard = Array(size * size).fill('') as Player[];
    const conditions = generateWinConditions(size, size);
    setBoard(newBoard);
    setWinConditions(conditions);
    setGameActive(true);
    setWinningCells([]);
    setMessage('');
    setIsAiThinking(false);
  }, []);

  const startGame = useCallback((mode: 3 | 4) => {
    setGameMode(mode);
    initBoard(mode);
  }, [initBoard]);

  const backToMenu = useCallback(() => {
    setGameMode(null);
    setScores({ player: 0, ai: 0 });
  }, []);

  const endGame = useCallback((winner: 'player' | 'ai' | 'draw', winCombo?: number[]) => {
    setGameActive(false);
    if (winCombo) setWinningCells(winCombo);

    if (winner === 'player') {
      setMessage(t('entertainment.games.ticTacToe.youWin'));
      setScores(prev => {
        const newScores = { ...prev, player: prev.player + 1 };
        // Calculate score for callback
        if (onGameEnd) {
          const baseScore = gameMode === 3 ? 100 : 200;
          onGameEnd(baseScore + newScores.player * 50);
        }
        return newScores;
      });
    } else if (winner === 'ai') {
      setMessage(t('entertainment.games.ticTacToe.aiWins'));
      setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
    } else {
      setMessage(t('entertainment.games.ticTacToe.draw'));
    }
  }, [t, onGameEnd, gameMode]);

  const checkResult = useCallback((newBoard: Player[]) => {
    // Check player win
    const playerWin = checkWin(newBoard, HUMAN, winConditions);
    if (playerWin) {
      endGame('player', playerWin);
      return true;
    }

    // Check AI win
    const aiWin = checkWin(newBoard, AI, winConditions);
    if (aiWin) {
      endGame('ai', aiWin);
      return true;
    }

    // Check draw
    if (!newBoard.includes('')) {
      endGame('draw');
      return true;
    }

    return false;
  }, [winConditions, endGame]);

  const aiMove = useCallback((currentBoard: Player[]) => {
    if (!gameMode) return;

    setIsAiThinking(true);

    setTimeout(() => {
      const maxDepth = gameMode === 3 ? 10 : 5;
      const boardCopy = [...currentBoard];
      const move = minimax(boardCopy, AI, 0, -Infinity, Infinity, maxDepth, winConditions);

      if (move.index >= 0) {
        const newBoard = [...currentBoard];
        newBoard[move.index] = AI;
        setBoard(newBoard);
        checkResult(newBoard);
      }
      setIsAiThinking(false);
    }, 500);
  }, [gameMode, winConditions, checkResult]);

  const handleCellClick = useCallback((index: number) => {
    if (board[index] !== '' || !gameActive || isAiThinking) return;

    const newBoard = [...board];
    newBoard[index] = HUMAN;
    setBoard(newBoard);

    const gameEnded = checkResult(newBoard);
    if (!gameEnded) {
      aiMove(newBoard);
    }
  }, [board, gameActive, isAiThinking, checkResult, aiMove]);

  const resetGame = useCallback(() => {
    if (gameMode) initBoard(gameMode);
  }, [gameMode, initBoard]);

  // Mode Selection Screen
  if (gameMode === null) {
    return (
      <div
        className={cn(
          "relative flex flex-col items-center justify-center overflow-hidden",
          fullscreen ? "w-full h-full p-4" : "w-full min-h-[600px] rounded-lg p-4"
        )}
        style={{
          background: 'radial-gradient(circle at center, #1a1a2e 0%, #16213e 100%)'
        }}
      >
        <div
          className="p-8 text-center max-w-md w-full"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
          }}
        >
          <h1
            className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
            suppressHydrationWarning
          >
            {t('entertainment.games.ticTacToe.title')}
          </h1>
          <p className="text-gray-400 text-sm mb-8" suppressHydrationWarning>
            {t('entertainment.games.ticTacToe.instructions')}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => startGame(3)}
              className="w-full py-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all group"
            >
              <span className="block text-xl font-bold text-green-400 group-hover:scale-110 transition-transform" suppressHydrationWarning>
                {t('entertainment.games.ticTacToe.mode3x3')}
              </span>
              <span className="text-xs text-gray-400" suppressHydrationWarning>
                {t('entertainment.games.ticTacToe.mode3x3Desc')}
              </span>
            </button>
            <button
              onClick={() => startGame(4)}
              className="w-full py-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all group"
            >
              <span className="block text-xl font-bold text-red-400 group-hover:scale-110 transition-transform" suppressHydrationWarning>
                {t('entertainment.games.ticTacToe.mode4x4')}
              </span>
              <span className="text-xs text-gray-400" suppressHydrationWarning>
                {t('entertainment.games.ticTacToe.mode4x4Desc')}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden",
        fullscreen ? "w-full h-full p-4" : "w-full min-h-[600px] rounded-lg p-4"
      )}
      style={{
        background: 'radial-gradient(circle at center, #1a1a2e 0%, #16213e 100%)'
      }}
    >
      <div
        className={cn("p-6 md:p-8 text-center max-w-md w-full", fullscreen && "mt-12")}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={backToMenu}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div
            className={cn(
              "px-4 py-2 rounded-full font-semibold text-sm uppercase tracking-wide",
              isAiThinking
                ? "bg-yellow-500/20 text-yellow-400"
                : gameActive
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-gray-500/20 text-gray-400"
            )}
            suppressHydrationWarning
          >
            {isAiThinking
              ? t('entertainment.games.ticTacToe.aiThinking')
              : gameActive
                ? t('entertainment.games.ticTacToe.yourTurn')
                : t('entertainment.games.ticTacToe.gameOver')}
          </div>
          <div className="w-6" />
        </div>

        {/* Scores */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <span className="block text-xs text-gray-400 uppercase" suppressHydrationWarning>
              {t('entertainment.games.ticTacToe.you')} (X)
            </span>
            <span className="text-2xl font-bold text-green-400">{scores.player}</span>
          </div>
          <div className="text-center">
            <span className="block text-xs text-gray-400 uppercase" suppressHydrationWarning>
              {t('entertainment.games.ticTacToe.ai')} (O)
            </span>
            <span className="text-2xl font-bold text-red-400">{scores.ai}</span>
          </div>
        </div>

        {/* Board */}
        <div
          className="grid gap-2 md:gap-3 mb-6"
          style={{ gridTemplateColumns: `repeat(${gameMode}, minmax(0, 1fr))` }}
        >
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={cell !== '' || !gameActive || isAiThinking}
              className={cn(
                "aspect-square rounded-xl flex items-center justify-center font-extrabold transition-all",
                gameMode === 3 ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
                cell === ''
                  ? "bg-white/5 hover:bg-white/10 cursor-pointer hover:-translate-y-0.5"
                  : "bg-white/5 cursor-default",
                cell === 'X' && "text-green-400",
                cell === 'O' && "text-red-400",
                winningCells.includes(index) && "bg-white/20 animate-pulse"
              )}
              style={{
                textShadow: cell === 'X'
                  ? '0 0 15px rgba(74, 222, 128, 0.5)'
                  : cell === 'O'
                    ? '0 0 15px rgba(248, 113, 113, 0.5)'
                    : 'none'
              }}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <p className="text-lg font-semibold text-white mb-6">{message}</p>
        )}

        {/* Reset Button */}
        <Button
          onClick={resetGame}
          className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
          suppressHydrationWarning
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('entertainment.games.ticTacToe.newGame')}
        </Button>
      </div>
    </div>
  );
});
