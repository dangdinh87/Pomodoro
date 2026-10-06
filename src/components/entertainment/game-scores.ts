export interface GameScores {
  highScore: number;
  lastScore: number;
}

export const EMPTY_SCORES: GameScores = { highScore: 0, lastScore: 0 };

function sanitize(value: unknown): GameScores {
  if (!value || typeof value !== 'object') return EMPTY_SCORES;
  const { highScore, lastScore } = value as Partial<GameScores>;
  const clean = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
  return { highScore: clean(highScore), lastScore: clean(lastScore) };
}

export function readScores(storageKey: string): GameScores {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? sanitize(JSON.parse(raw)) : EMPTY_SCORES;
  } catch {
    return EMPTY_SCORES;
  }
}

/** Persists a finished run. The high score only ever goes up. */
export function recordScore(storageKey: string, score: number): GameScores {
  const prev = readScores(storageKey);
  const safe = Number.isFinite(score) && score > 0 ? Math.floor(score) : 0;
  const next: GameScores = { lastScore: safe, highScore: Math.max(prev.highScore, safe) };
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // storage full or blocked: the in-memory result is still returned
  }
  return next;
}
