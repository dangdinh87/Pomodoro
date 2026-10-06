import { mayAutoChain } from './auto-chain';

describe('mayAutoChain', () => {
  it('a focus session always rolls into its break', () => {
    expect(mayAutoChain('work', true)).toBe(true);
    // even when nobody touched the page: the idle cycle ends after the break
    expect(mayAutoChain('work', false)).toBe(true);
  });

  it('a short break rolls into focus only if someone was around since the focus began', () => {
    expect(mayAutoChain('shortBreak', true)).toBe(true);
    expect(mayAutoChain('shortBreak', false)).toBe(false);
  });

  it('never chains out of a long break', () => {
    expect(mayAutoChain('longBreak', true)).toBe(false);
    expect(mayAutoChain('longBreak', false)).toBe(false);
  });
});
