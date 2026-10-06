import { describe, expect, it } from 'vitest';
import { createBoard, floodReveal, isWon, mineScore, neighbors, type Cell } from './minesweeper-logic';

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

describe('minesweeper logic', () => {
  it('finds 3 / 5 / 8 neighbours for corner / edge / middle', () => {
    expect(neighbors(0, 5, 5)).toHaveLength(3);
    expect(neighbors(2, 5, 5)).toHaveLength(5);
    expect(neighbors(12, 5, 5)).toHaveLength(8);
  });

  it('keeps the first click and its neighbours mine-free', () => {
    for (let seed = 1; seed < 30; seed++) {
      const board = createBoard({ cols: 8, rows: 8, mines: 10 }, 27, seeded(seed));
      expect(board.filter((c) => c.mine)).toHaveLength(10);
      expect(board[27].mine).toBe(false);
      neighbors(27, 8, 8).forEach((n) => expect(board[n].mine).toBe(false));
    }
  });

  it('counts adjacent mines', () => {
    const board = createBoard({ cols: 4, rows: 4, mines: 3 }, 0, seeded(7));
    board.forEach((cell, i) => {
      expect(cell.adjacent).toBe(neighbors(i, 4, 4).filter((n) => board[n].mine).length);
    });
  });

  it('flood fills through zeros and stops at numbers', () => {
    // 5x1 strip: mine at the far right, so cells 0..2 are 0, cell 3 is 1.
    const cells: Cell[] = [0, 0, 0, 1, 0].map((adjacent, i) => ({ mine: i === 4, adjacent }));
    const revealed = floodReveal(cells, 5, 1, new Set(), new Set(), 0);
    expect([...revealed].sort()).toEqual([0, 1, 2, 3]);
  });

  it('does not flood past flagged cells', () => {
    const cells: Cell[] = Array.from({ length: 5 }, () => ({ mine: false, adjacent: 0 }));
    const revealed = floodReveal(cells, 5, 1, new Set(), new Set([2]), 0);
    expect([...revealed].sort()).toEqual([0, 1]);
  });

  it('detects a win only when every safe cell is revealed', () => {
    const cells: Cell[] = [{ mine: true, adjacent: 0 }, { mine: false, adjacent: 1 }, { mine: false, adjacent: 1 }];
    expect(isWon(cells, new Set([1]))).toBe(false);
    expect(isWon(cells, new Set([1, 2]))).toBe(true);
  });

  it('rewards speed and board difficulty', () => {
    expect(mineScore(10, 30)).toBeGreaterThan(mineScore(10, 120));
    expect(mineScore(30, 100)).toBeGreaterThan(mineScore(10, 100));
    expect(mineScore(10, 999)).toBe(400);
  });
});
