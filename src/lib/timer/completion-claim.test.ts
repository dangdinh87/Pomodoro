import { installMemoryStorage } from '@/test-utils/memory-storage';
import { claimCompletion, completionKey } from './completion-claim';

describe('completion-claim', () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it('builds a key from mode and deadline', () => {
    expect(completionKey('work', 123)).toBe('work:123');
    expect(completionKey('work', null)).toMatch(/^work:none-/);
  });

  it('rejects a different tab that already claimed the key', () => {
    window.localStorage.setItem('timer-completion-claim', 'work:2|other-tab');
    expect(claimCompletion('work:2')).toBe(false);
  });

  it('is one-shot: a second claim of the same key fails even from the same tab', () => {
    expect(claimCompletion('work:10')).toBe(true);
    expect(claimCompletion('work:10')).toBe(false);
    // even if the stored claim was overwritten, this tab remembers
    window.localStorage.removeItem('timer-completion-claim');
    expect(claimCompletion('work:10')).toBe(false);
  });

  it('allows a new key', () => {
    expect(claimCompletion('work:20')).toBe(true);
    expect(claimCompletion('shortBreak:21')).toBe(true);
  });

  it('fails open (once) when storage throws', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('blocked');
        },
      },
      configurable: true,
    });
    expect(claimCompletion('work:30')).toBe(true);
    expect(claimCompletion('work:30')).toBe(false);
  });
});
