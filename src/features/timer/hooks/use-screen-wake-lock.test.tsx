import { act, renderHook } from '@testing-library/react';
import { useTimerStore } from '@/stores/timer-store';
import { isWakeLockSupported, useScreenWakeLock } from './use-screen-wake-lock';

interface FakeSentinel {
  release: ReturnType<typeof vi.fn>;
  addEventListener: (type: string, cb: () => void) => void;
  /** what the browser does when it drops the lock (tab hidden) */
  fireRelease: () => void;
}

let sentinels: FakeSentinel[];
let request: ReturnType<typeof vi.fn>;
let visibility: DocumentVisibilityState;

function makeSentinel(): FakeSentinel {
  const listeners: Array<() => void> = [];
  const sentinel: FakeSentinel = {
    release: vi.fn(async () => {}),
    addEventListener: (_type, cb) => void listeners.push(cb),
    fireRelease: () => listeners.forEach((cb) => cb()),
  };
  sentinels.push(sentinel);
  return sentinel;
}

const flush = () => act(async () => {});

function setVisibility(next: DocumentVisibilityState) {
  visibility = next;
  document.dispatchEvent(new Event('visibilitychange'));
}

const base = { mode: 'work' as const, isRunning: true };
const settings = (keepScreenOn: boolean) =>
  ({ ...useTimerStore.getState().settings, keepScreenOn });

describe('useScreenWakeLock', () => {
  beforeEach(() => {
    sentinels = [];
    visibility = 'visible';
    request = vi.fn(async () => makeSentinel());
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
    useTimerStore.setState({ ...base, settings: settings(true) });
  });
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'wakeLock');
  });

  it('holds a screen lock while a focus session runs and the setting is on', async () => {
    renderHook(() => useScreenWakeLock());
    await flush();
    expect(request).toHaveBeenCalledWith('screen');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the setting is off (default)', async () => {
    useTimerStore.setState({ settings: settings(false) });
    renderHook(() => useScreenWakeLock());
    await flush();
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    ['paused', { isRunning: false }],
    ['on a break', { mode: 'shortBreak' as const }],
  ])('does nothing when %s', async (_name, patch) => {
    useTimerStore.setState(patch);
    renderHook(() => useScreenWakeLock());
    await flush();
    expect(request).not.toHaveBeenCalled();
  });

  it('releases the lock when the run pauses, and takes it again on resume', async () => {
    renderHook(() => useScreenWakeLock());
    await flush();
    act(() => useTimerStore.setState({ isRunning: false }));
    await flush();
    expect(sentinels[0].release).toHaveBeenCalledTimes(1);

    act(() => useTimerStore.setState({ isRunning: true }));
    await flush();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('releases the lock when the setting is turned off and on unmount', async () => {
    const { unmount } = renderHook(() => useScreenWakeLock());
    await flush();
    act(() => useTimerStore.setState({ settings: settings(false) }));
    await flush();
    expect(sentinels[0].release).toHaveBeenCalledTimes(1);

    act(() => useTimerStore.setState({ settings: settings(true) }));
    await flush();
    unmount();
    expect(sentinels[1].release).toHaveBeenCalledTimes(1);
  });

  it('re-acquires after the browser dropped the lock because the tab was hidden', async () => {
    renderHook(() => useScreenWakeLock());
    await flush();

    act(() => {
      visibility = 'hidden';
      sentinels[0].fireRelease(); // the browser releases it on hide
    });
    act(() => setVisibility('hidden'));
    await flush();
    expect(request).toHaveBeenCalledTimes(1); // never asks while hidden (it would be refused)

    act(() => setVisibility('visible'));
    await flush();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('does not ask twice while the lock is still held', async () => {
    renderHook(() => useScreenWakeLock());
    await flush();
    act(() => setVisibility('visible'));
    await flush();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('survives a refused request (battery saver, permissions policy)', async () => {
    request.mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'));
    expect(() => renderHook(() => useScreenWakeLock())).not.toThrow();
    await flush();
    // and tries again next time the tab becomes visible
    act(() => setVisibility('visible'));
    await flush();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('releases a lock that arrives after the run already stopped', async () => {
    let resolve!: (s: FakeSentinel) => void;
    request.mockImplementationOnce(() => new Promise<FakeSentinel>((r) => (resolve = r)));
    renderHook(() => useScreenWakeLock());
    act(() => useTimerStore.setState({ isRunning: false }));
    const late = makeSentinel();
    await act(async () => resolve(late));
    expect(late.release).toHaveBeenCalledTimes(1);
  });

  it('is a no-op where the API does not exist', async () => {
    Reflect.deleteProperty(navigator, 'wakeLock');
    expect(isWakeLockSupported()).toBe(false);
    expect(() => renderHook(() => useScreenWakeLock())).not.toThrow();
    await flush();
  });

  it('feature-detects support', () => {
    expect(isWakeLockSupported()).toBe(true);
  });
});
