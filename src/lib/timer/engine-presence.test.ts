import { isEngineMounted, markEngineMounted, subscribeEnginePresence } from './engine-presence';

describe('engine presence', () => {
  it('counts mounts, so a StrictMode double mount still reads as one engine until both unmount', () => {
    const changes = vi.fn();
    const unsubscribe = subscribeEnginePresence(changes);
    const first = markEngineMounted();
    const second = markEngineMounted();
    expect(isEngineMounted()).toBe(true);

    first();
    first(); // a cleanup that runs twice must not count twice
    expect(isEngineMounted()).toBe(true);
    second();
    expect(isEngineMounted()).toBe(false);
    expect(changes).toHaveBeenCalledTimes(4);

    unsubscribe();
    markEngineMounted()();
    expect(changes).toHaveBeenCalledTimes(4);
  });
});
