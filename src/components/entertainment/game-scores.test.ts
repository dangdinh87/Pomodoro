import { beforeEach, describe, expect, it } from 'vitest';
import { readScores, recordScore } from './game-scores';

describe('game scores', () => {
  beforeEach(() => localStorage.clear());

  it('returns zeros when nothing is stored', () => {
    expect(readScores('x')).toEqual({ highScore: 0, lastScore: 0 });
  });

  it('keeps the highest score and the latest score separately', () => {
    recordScore('x', 120);
    const next = recordScore('x', 40);
    expect(next).toEqual({ highScore: 120, lastScore: 40 });
    expect(readScores('x')).toEqual({ highScore: 120, lastScore: 40 });
  });

  it('ignores corrupt or hostile stored data', () => {
    localStorage.setItem('x', '{"highScore":"lots","lastScore":-5}');
    expect(readScores('x')).toEqual({ highScore: 0, lastScore: 0 });
    localStorage.setItem('x', 'not json');
    expect(readScores('x')).toEqual({ highScore: 0, lastScore: 0 });
  });

  it('floors fractional and drops non-finite scores', () => {
    expect(recordScore('y', 99.9).highScore).toBe(99);
    expect(recordScore('y', Number.NaN).lastScore).toBe(0);
    expect(readScores('y').highScore).toBe(99);
  });
});
