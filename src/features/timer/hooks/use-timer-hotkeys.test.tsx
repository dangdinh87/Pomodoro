import { renderHook } from '@testing-library/react';
import { useTimerStore } from '@/stores/timer-store';
import { useResetDialogStore } from '../lib/request-reset';
import { useTimerHotkeys } from './use-timer-hotkeys';

vi.mock('@/lib/timer/notifications', () => ({ requestNotificationPermission: vi.fn() }));

const press = (key: string, target: EventTarget = document.body) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('useTimerHotkeys R', () => {
  beforeEach(() => {
    useResetDialogStore.setState({ open: false, mode: null });
    useTimerStore.setState({
      mode: 'work',
      timeLeft: 1500,
      lastSessionTimeLeft: 1500,
      isRunning: false,
      deadlineAt: null,
    });
  });

  it('resets at once when there is nothing to lose', () => {
    useTimerStore.setState({ timeLeft: 1500, lastSessionTimeLeft: 1500, isRunning: false });
    const resetTimer = vi.spyOn(useTimerStore.getState(), 'resetTimer');
    useTimerStore.setState({ resetTimer });
    renderHook(() => useTimerHotkeys());
    press('r');
    expect(resetTimer).toHaveBeenCalledTimes(1);
    expect(useResetDialogStore.getState().open).toBe(false);
  });

  it('asks before throwing progress away', () => {
    useTimerStore.setState({ timeLeft: 900, isRunning: true, deadlineAt: Date.now() + 900_000 });
    renderHook(() => useTimerHotkeys());
    press('R');
    expect(useResetDialogStore.getState().open).toBe(true);
    expect(useTimerStore.getState().timeLeft).toBe(900);
  });

  it('is ignored while typing', () => {
    useTimerStore.setState({ timeLeft: 900, isRunning: true });
    renderHook(() => useTimerHotkeys());
    const input = document.createElement('input');
    document.body.appendChild(input);
    press('r', input);
    input.remove();
    expect(useResetDialogStore.getState().open).toBe(false);
  });
});
