import { readRunningPhase, TIMER_STORAGE_KEY } from './persisted-phase';

const storageWith = (value: unknown) => ({
  getItem: (key: string) => (key === TIMER_STORAGE_KEY ? JSON.stringify(value) : null),
});

describe('readRunningPhase', () => {
  it('reads the mode and deadline of a running phase from the persisted timer store', () => {
    const storage = storageWith({ state: { mode: 'work', isRunning: true, deadlineAt: 1_000 }, version: 3 });
    expect(readRunningPhase(storage)).toEqual({ mode: 'work', deadlineAt: 1_000 });
  });

  it.each([
    ['paused', { state: { mode: 'work', isRunning: false, deadlineAt: null } }],
    ['running without a deadline', { state: { mode: 'work', isRunning: true, deadlineAt: null } }],
    ['an unknown mode', { state: { mode: 'nap', isRunning: true, deadlineAt: 1_000 } }],
    ['no state', {}],
  ])('is null when %s', (_label, value) => {
    expect(readRunningPhase(storageWith(value))).toBeNull();
  });

  it('is null for missing or broken storage', () => {
    expect(readRunningPhase({ getItem: () => null })).toBeNull();
    expect(readRunningPhase({ getItem: () => '{not json' })).toBeNull();
    expect(
      readRunningPhase({
        getItem: () => {
          throw new Error('blocked');
        },
      }),
    ).toBeNull();
  });
});
