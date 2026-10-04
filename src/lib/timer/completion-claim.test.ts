import { installMemoryStorage } from '@/test-utils/memory-storage';
import { claimCompletion, completionKey, phaseSessionId } from './completion-claim';

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

  describe('phaseSessionId', () => {
    it('is the same for every window that completes the same phase', () => {
      expect(phaseSessionId('work', 1_800_000_000_000)).toBe('work_1800000000000');
      expect(phaseSessionId('work', 1_800_000_000_000)).toBe(phaseSessionId('work', 1_800_000_000_000));
    });

    it('differs between phases', () => {
      const id = phaseSessionId('work', 1_800_000_000_000);
      expect(phaseSessionId('shortBreak', 1_800_000_000_000)).not.toBe(id);
      expect(phaseSessionId('longBreak', 1_800_000_000_000)).not.toBe(phaseSessionId('shortBreak', 1_800_000_000_000));
      expect(phaseSessionId('work', 1_800_000_001_000)).not.toBe(id);
    });

    it('fits what the server accepts as a clientSessionId', () => {
      for (const mode of ['work', 'shortBreak', 'longBreak']) {
        expect(phaseSessionId(mode, 1_800_000_000_000)).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
      }
    });

    it('is undefined without a usable deadline (falls back to a random id)', () => {
      expect(phaseSessionId('work', null)).toBeUndefined();
      expect(phaseSessionId('work', Number.NaN)).toBeUndefined();
    });
  });
});
