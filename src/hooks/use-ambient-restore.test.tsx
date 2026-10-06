import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudioStore } from '@/stores/audio-store';
import { useTimerStore } from '@/stores/timer-store';
import { useAmbientRestore, MAX_RESTORE_ATTEMPTS } from './use-ambient-restore';

const start = vi.fn();
const drop = vi.fn();

function arm(restore: 'autoplay' | 'paused' | 'none' = 'autoplay') {
  useAudioStore.setState({
    ambientRestore: restore,
    activeAmbientSounds: [{ id: 'x', volume: 40 }],
    startRestoredAmbient: start,
    dropUnstartedAmbient: drop,
  });
}

const gesture = async (type: string) => {
  await act(async () => {
    window.dispatchEvent(new Event(type));
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  start.mockResolvedValue(true);
  useTimerStore.setState({ isRunning: false });
});

describe('useAmbientRestore', () => {
  it.each(['pointerdown', 'keydown'])('starts the restored mix on the first %s', async (type) => {
    arm();
    renderHook(() => useAmbientRestore());
    expect(start).not.toHaveBeenCalled(); // never before a gesture

    await gesture(type);
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('starts it when the timer starts', async () => {
    arm();
    renderHook(() => useAmbientRestore());

    await act(async () => {
      useTimerStore.setState({ isRunning: true });
    });
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('stops listening once the mix is playing', async () => {
    arm();
    renderHook(() => useAmbientRestore());
    await gesture('pointerdown');
    await gesture('pointerdown');
    await gesture('keydown');
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('ignores gestures when nothing is waiting or the mix was paused', async () => {
    arm('paused');
    renderHook(() => useAmbientRestore());
    await gesture('pointerdown');
    expect(start).not.toHaveBeenCalled();

    arm('none');
    renderHook(() => useAmbientRestore());
    await gesture('pointerdown');
    expect(start).not.toHaveBeenCalled();
  });

  it('stops listening when the user clears the mix before any gesture', async () => {
    arm();
    renderHook(() => useAmbientRestore());
    act(() => useAudioStore.setState({ ambientRestore: 'none' }));
    await gesture('pointerdown');
    expect(start).not.toHaveBeenCalled();
  });

  it('retries a refused start a few times, then drops what never played', async () => {
    arm();
    start.mockResolvedValue(false);
    renderHook(() => useAmbientRestore());

    for (let i = 0; i < MAX_RESTORE_ATTEMPTS; i++) {
      expect(drop).not.toHaveBeenCalled();
      await gesture('pointerdown');
    }
    expect(start).toHaveBeenCalledTimes(MAX_RESTORE_ATTEMPTS);
    expect(drop).toHaveBeenCalledTimes(1);

    await gesture('pointerdown'); // detached
    expect(start).toHaveBeenCalledTimes(MAX_RESTORE_ATTEMPTS);
  });

  it('removes its listeners on unmount', async () => {
    arm();
    const { unmount } = renderHook(() => useAmbientRestore());
    unmount();
    await gesture('pointerdown');
    expect(start).not.toHaveBeenCalled();
  });
});
