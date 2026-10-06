import { create } from 'zustand';
import { useTimerStore, type TimerMode } from '@/stores/timer-store';
import { timerHasProgress } from './timer-mode';

/** Open state of the single "Reset timer?" dialog (`ResetTimerDialog`), shared by every reset entry point. */
export const useResetDialogStore = create<{ open: boolean; mode: TimerMode | null }>(() => ({
  open: false,
  mode: null,
}));

export function closeResetDialog() {
  useResetDialogStore.setState({ open: false, mode: null });
}

/**
 * The one way to reset from the UI (R hotkey, the ↺ button, the command palette).
 * Nothing to lose: resets at once. Otherwise asks first, remembering which phase
 * it asked about so the dialog can retire itself if that phase ends meanwhile.
 */
export function requestTimerReset() {
  if (!timerHasProgress()) {
    useTimerStore.getState().resetTimer();
    return;
  }
  useResetDialogStore.setState({ open: true, mode: useTimerStore.getState().mode });
}
