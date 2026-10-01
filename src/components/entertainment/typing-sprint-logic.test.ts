import { describe, expect, it } from 'vitest';
import { accuracy, buildQueue, matchWord, wordScore, wpm } from './typing-sprint-logic';

describe('typing sprint logic', () => {
  it('builds a queue without back-to-back repeats', () => {
    const queue = buildQueue(300);
    expect(queue).toHaveLength(300);
    queue.forEach((w, i) => i && expect(w).not.toBe(queue[i - 1]));
  });

  it('matches the correct prefix and flags exact words', () => {
    expect(matchWord('foc', 'focus')).toEqual({ matched: 3, exact: false });
    expect(matchWord('fox', 'focus')).toEqual({ matched: 2, exact: false });
    expect(matchWord('focus', 'focus')).toEqual({ matched: 5, exact: true });
    expect(matchWord('focused', 'focus')).toEqual({ matched: 5, exact: false });
  });

  it('computes wpm from five-character words', () => {
    expect(wpm(300, 60)).toBe(60);
    expect(wpm(150, 30)).toBe(60);
    expect(wpm(10, 0)).toBe(0);
  });

  it('computes accuracy, defaulting to 100 with no words', () => {
    expect(accuracy(0, 0)).toBe(100);
    expect(accuracy(9, 12)).toBe(75);
  });

  it('scores a word by its length plus the space', () => {
    expect(wordScore('focus')).toBe(6);
  });
});
