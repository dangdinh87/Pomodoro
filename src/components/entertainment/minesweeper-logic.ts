export interface MineConfig {
  cols: number;
  rows: number;
  mines: number;
}

export interface Cell {
  mine: boolean;
  /** Number of mines in the 8 surrounding cells. */
  adjacent: number;
}

export type MineLevel = 'easy' | 'medium' | 'hard';

export const MINE_LEVELS: Record<MineLevel, MineConfig> = {
  easy: { cols: 8, rows: 8, mines: 10 },
  medium: { cols: 9, rows: 12, mines: 20 },
  hard: { cols: 9, rows: 14, mines: 30 },
};

export function neighbors(index: number, cols: number, rows: number): number[] {
  const r = Math.floor(index / cols);
  const c = index % cols;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc);
    }
  }
  return out;
}

/** Places mines after the first click so that cell and its neighbours are always safe. */
export function createBoard({ cols, rows, mines }: MineConfig, safeIndex: number, rng: () => number = Math.random): Cell[] {
  const total = cols * rows;
  const banned = new Set([safeIndex, ...neighbors(safeIndex, cols, rows)]);
  let pool = Array.from({ length: total }, (_, i) => i).filter((i) => !banned.has(i));
  if (pool.length < mines) pool = Array.from({ length: total }, (_, i) => i).filter((i) => i !== safeIndex);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const mineSet = new Set(pool.slice(0, mines));
  return Array.from({ length: total }, (_, i) => ({
    mine: mineSet.has(i),
    adjacent: neighbors(i, cols, rows).filter((n) => mineSet.has(n)).length,
  }));
}

/**
 * Reveals `start`; a zero-adjacent cell floods outward through all connected zeros and their
 * numbered borders. Flagged cells are left alone. Returns a new set.
 */
export function floodReveal(board: Cell[], cols: number, rows: number, revealed: Set<number>, flagged: Set<number>, start: number): Set<number> {
  const next = new Set(revealed);
  if (next.has(start) || flagged.has(start)) return next;
  const stack = [start];
  while (stack.length) {
    const index = stack.pop() as number;
    if (next.has(index) || flagged.has(index)) continue;
    next.add(index);
    if (board[index].mine || board[index].adjacent > 0) continue;
    for (const n of neighbors(index, cols, rows)) if (!next.has(n)) stack.push(n);
  }
  return next;
}

export function isWon(board: Cell[], revealed: Set<number>): boolean {
  return board.every((cell, i) => cell.mine || revealed.has(i));
}

/** Faster clears and harder boards score higher. */
export function mineScore(mines: number, seconds: number): number {
  return mines * 40 + Math.max(0, 240 - seconds) * 2;
}
