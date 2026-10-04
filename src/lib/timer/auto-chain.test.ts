import { MAX_IDLE_PHASES, mayAutoChain } from './auto-chain';

describe('mayAutoChain', () => {
  it('chains focus and short breaks while the user is around', () => {
    expect(mayAutoChain('work', 0)).toBe(true);
    expect(mayAutoChain('shortBreak', 1)).toBe(true);
  });

  it('never chains out of a long break', () => {
    expect(mayAutoChain('longBreak', 0)).toBe(false);
  });

  it('stops after a whole idle focus + break cycle', () => {
    expect(MAX_IDLE_PHASES).toBe(2);
    expect(mayAutoChain('work', 2)).toBe(false);
    expect(mayAutoChain('shortBreak', 3)).toBe(false);
  });
});
