import { registerTimerSkip, requestTimerSkip } from './request-skip';

describe('requestTimerSkip', () => {
  it('reports false when no timer controls are mounted', () => {
    expect(requestTimerSkip()).toBe(false);
  });

  it('calls the registered handler once and reports true', () => {
    const skip = vi.fn();
    const unregister = registerTimerSkip(skip);
    expect(requestTimerSkip()).toBe(true);
    expect(skip).toHaveBeenCalledTimes(1);
    unregister();
    expect(requestTimerSkip()).toBe(false);
  });

  it('the newest registration wins, and a stale cleanup does not remove it', () => {
    const first = vi.fn();
    const second = vi.fn();
    const unregisterFirst = registerTimerSkip(first);
    const unregisterSecond = registerTimerSkip(second);

    unregisterFirst();
    requestTimerSkip();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    unregisterSecond();
    expect(requestTimerSkip()).toBe(false);
  });
});
