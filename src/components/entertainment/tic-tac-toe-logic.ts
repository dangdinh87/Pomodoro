export type Mark = 'X' | 'O';
export type Board = (Mark | null)[];

/** Every run of `need` consecutive cells (rows, columns, both diagonals) on a size x size board. */
export function winLines(size: number, need: number): number[][] {
  const lines: number[][] = [];
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const [dr, dc] of dirs) {
        const er = r + dr * (need - 1);
        const ec = c + dc * (need - 1);
        if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
        lines.push(Array.from({ length: need }, (_, k) => (r + dr * k) * size + (c + dc * k)));
      }
    }
  }
  return lines;
}

export function findWinner(board: Board, lines: number[][]): { mark: Mark; line: number[] } | null {
  for (const line of lines) {
    const first = board[line[0]];
    if (first && line.every((i) => board[i] === first)) return { mark: first, line };
  }
  return null;
}

export function isFull(board: Board): boolean {
  return board.every(Boolean);
}

function evaluate(board: Board, lines: number[][], ai: Mark): number {
  let score = 0;
  for (const line of lines) {
    let a = 0;
    let h = 0;
    for (const i of line) {
      if (board[i] === ai) a++;
      else if (board[i]) h++;
    }
    if (a && h) continue;
    if (a) score += 10 ** a;
    else if (h) score -= 10 ** h;
  }
  return score;
}

function minimax(board: Board, lines: number[][], ai: Mark, turn: Mark, depth: number, alpha: number, beta: number): number {
  const win = findWinner(board, lines);
  if (win) return win.mark === ai ? 10000 + depth : -10000 - depth;
  if (isFull(board)) return 0;
  if (depth === 0) return evaluate(board, lines, ai);
  const next: Mark = turn === 'X' ? 'O' : 'X';
  let best = turn === ai ? -Infinity : Infinity;
  for (let i = 0; i < board.length; i++) {
    if (board[i]) continue;
    board[i] = turn;
    const value = minimax(board, lines, ai, next, depth - 1, alpha, beta);
    board[i] = null;
    if (turn === ai) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, value);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, value);
    }
    if (beta <= alpha) break;
  }
  return best;
}

export function bestMove(board: Board, size: number, need: number, ai: Mark, depth: number): number {
  const lines = winLines(size, need);
  const work = [...board];
  const center = (size * size - 1) / 2;
  const order = work
    .map((_, i) => i)
    .filter((i) => !work[i])
    .sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
  const human: Mark = ai === 'X' ? 'O' : 'X';
  let best = order[0];
  let bestValue = -Infinity;
  for (const i of order) {
    work[i] = ai;
    const value = minimax(work, lines, ai, human, depth, -Infinity, Infinity);
    work[i] = null;
    if (value > bestValue) {
      bestValue = value;
      best = i;
    }
  }
  return best;
}

export interface AiOptions {
  size: number;
  need: number;
  /** 0..1: chance the AI plays a random legal move instead of the best one. */
  blunder: number;
  rng?: () => number;
}

export function chooseAiMove(board: Board, ai: Mark, { size, need, blunder, rng = Math.random }: AiOptions): number {
  const free = board.map((cell, i) => (cell ? -1 : i)).filter((i) => i >= 0);
  if (rng() < blunder) return free[Math.floor(rng() * free.length)];
  return bestMove(board, size, need, ai, size === 3 ? 9 : 4);
}
