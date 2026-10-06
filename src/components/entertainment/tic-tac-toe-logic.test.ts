import { describe, expect, it } from 'vitest';
import { bestMove, chooseAiMove, findWinner, winLines, type Board } from './tic-tac-toe-logic';

const b = (s: string): Board => s.split('').map((ch) => (ch === 'X' || ch === 'O' ? ch : null));

describe('tic-tac-toe logic', () => {
  it('builds the 8 lines of a 3x3 board and 10 lines for 4-in-a-row on 4x4', () => {
    expect(winLines(3, 3)).toHaveLength(8);
    expect(winLines(4, 4)).toHaveLength(10);
  });

  it('finds a winner and its line', () => {
    const win = findWinner(b('XXX.O.O..'), winLines(3, 3));
    expect(win).toEqual({ mark: 'X', line: [0, 1, 2] });
    expect(findWinner(b('XO.......'), winLines(3, 3))).toBeNull();
  });

  it('takes an immediate win', () => {
    expect(bestMove(b('OO.XX....'), 3, 3, 'O', 9)).toBe(2);
  });

  it('blocks the human from winning', () => {
    expect(bestMove(b('XX..O....'), 3, 3, 'O', 9)).toBe(2);
  });

  it('never loses a perfect 3x3 game against a corner opening', () => {
    let board = b('X........');
    const lines = winLines(3, 3);
    let turn: 'X' | 'O' = 'O';
    while (!findWinner(board, lines) && board.some((c) => !c)) {
      const idx = turn === 'O' ? bestMove(board, 3, 3, 'O', 9) : board.findIndex((c) => !c);
      board = board.map((c, i) => (i === idx ? turn : c));
      turn = turn === 'X' ? 'O' : 'X';
    }
    expect(findWinner(board, lines)?.mark).not.toBe('X');
  });

  it('can be forced to blunder to a random legal move', () => {
    const board = b('XX..O....');
    const move = chooseAiMove(board, 'O', { size: 3, need: 3, blunder: 1, rng: () => 0 });
    expect(board[move]).toBeNull();
    expect(move).toBe(2);
  });
});
