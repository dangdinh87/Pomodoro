import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Fresh module per test: the probe result is cached for the page's lifetime. */
async function load() {
  vi.resetModules();
  return import('./use-clock-palette');
}

describe('isWebGLAvailable', () => {
  const loseContext = vi.fn();
  const getExtension = vi.fn();
  const getContext = vi.fn();
  let original: typeof HTMLCanvasElement.prototype.getContext;

  beforeEach(() => {
    vi.clearAllMocks();
    getExtension.mockImplementation((name: string) => (name === 'WEBGL_lose_context' ? { loseContext } : null));
    getContext.mockImplementation((kind: string) => (kind === 'webgl2' ? { getExtension } : null));
    original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = getContext as never;
  });
  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = original;
  });

  it('is true when a context can be created, and gives that context back', async () => {
    const { isWebGLAvailable } = await load();
    expect(isWebGLAvailable()).toBe(true);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it('asks the browser only once, however often it is called', async () => {
    const { isWebGLAvailable } = await load();
    isWebGLAvailable();
    isWebGLAvailable();
    isWebGLAvailable();
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it('falls back to webgl1 and still releases it', async () => {
    getContext.mockImplementation((kind: string) => (kind === 'webgl' ? { getExtension } : null));
    const { isWebGLAvailable } = await load();
    expect(isWebGLAvailable()).toBe(true);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it('does not break when the lose-context extension is missing', async () => {
    getExtension.mockReturnValue(null);
    const { isWebGLAvailable } = await load();
    expect(isWebGLAvailable()).toBe(true);
  });

  it('is false when there is no context, and that answer is cached too', async () => {
    getContext.mockReturnValue(null);
    const { isWebGLAvailable } = await load();
    expect(isWebGLAvailable()).toBe(false);
    expect(isWebGLAvailable()).toBe(false);
    expect(getContext).toHaveBeenCalledTimes(2); // webgl2 then webgl, once
  });

  it('is false when probing throws', async () => {
    getContext.mockImplementation(() => {
      throw new Error('blocked');
    });
    const { isWebGLAvailable } = await load();
    expect(isWebGLAvailable()).toBe(false);
  });
});
