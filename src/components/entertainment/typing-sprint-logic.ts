export const WORDS = [
  'focus', 'break', 'timer', 'quiet', 'river', 'cloud', 'light', 'water', 'green', 'stone',
  'bright', 'simple', 'garden', 'window', 'coffee', 'travel', 'planet', 'summer', 'winter', 'forest',
  'letter', 'bridge', 'candle', 'market', 'silver', 'orange', 'purple', 'pocket', 'shadow', 'spring',
  'smile', 'dream', 'music', 'paper', 'table', 'chair', 'clock', 'night', 'storm', 'ocean',
  'mount', 'field', 'train', 'plane', 'house', 'plant', 'fruit', 'bread', 'sugar', 'honey',
  'maple', 'amber', 'ember', 'frost', 'brook', 'pearl', 'cabin', 'lemon', 'melon', 'berry',
  'rest', 'walk', 'calm', 'read', 'note', 'idea', 'goal', 'task', 'plan', 'work',
  'cup', 'sun', 'sky', 'sea', 'map', 'key', 'ink', 'oak', 'fox', 'owl',
  'moment', 'gentle', 'steady', 'breeze', 'wander', 'little', 'around', 'listen', 'refresh', 'stretch',
  'balance', 'morning', 'evening', 'journey', 'whisper', 'compass', 'lantern', 'harvest', 'blanket', 'sunrise',
  'rhythm', 'comfort', 'pattern', 'mindful', 'unwind', 'tidy', 'cozy', 'drift', 'glow', 'hush',
];

/** A shuffled word queue with no word repeated back to back. */
export function buildQueue(count: number, rng: () => number = Math.random): string[] {
  const out: string[] = [];
  while (out.length < count) {
    const word = WORDS[Math.floor(rng() * WORDS.length)];
    if (word !== out[out.length - 1]) out.push(word);
  }
  return out;
}

/** Number of leading characters of `typed` that match `target`, and whether the whole word is right. */
export function matchWord(typed: string, target: string): { matched: number; exact: boolean } {
  let matched = 0;
  while (matched < typed.length && matched < target.length && typed[matched] === target[matched]) matched++;
  return { matched, exact: typed === target };
}

/** Standard typing metric: five characters count as one word. */
export function wpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round(correctChars / 5 / (elapsedSeconds / 60));
}

export function accuracy(correctWords: number, totalWords: number): number {
  if (totalWords === 0) return 100;
  return Math.round((correctWords / totalWords) * 100);
}

/** A correct word scores its length plus the space after it; a wrong word scores nothing. */
export function wordScore(word: string): number {
  return word.length + 1;
}
