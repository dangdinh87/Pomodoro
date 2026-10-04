import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTimerStore } from '@/stores/timer-store';
import { useResetDialogStore } from '@/features/timer/lib/request-reset';
import { CommandPalette, usePaletteStore } from './command-palette';

vi.mock('@/contexts/i18n-context', () => ({
  LANGS: [{ code: 'en', label: 'English' }],
  useI18n: () => ({ t: (key: string) => key, lang: 'en', setLang: vi.fn() }),
}));
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ isAuthenticated: false, signOut: vi.fn() }),
}));

describe('CommandPalette Reset', () => {
  beforeEach(() => {
    // cmdk scrolls the active item into view
    Element.prototype.scrollIntoView = vi.fn();
    useResetDialogStore.setState({ open: false, mode: null });
    usePaletteStore.setState({ open: true });
    useTimerStore.setState({
      mode: 'work',
      timeLeft: 1500,
      lastSessionTimeLeft: 1500,
      isRunning: false,
      deadlineAt: null,
    });
  });

  it('asks before throwing progress away', async () => {
    const user = userEvent.setup();
    useTimerStore.setState({ timeLeft: 900 });
    render(<CommandPalette />);
    await user.click(await screen.findByText('shell.palette.reset'));

    expect(usePaletteStore.getState().open).toBe(false);
    expect(useResetDialogStore.getState().open).toBe(true);
    expect(useTimerStore.getState().timeLeft).toBe(900);
  });

  it('resets straight away when nothing was started', async () => {
    const user = userEvent.setup();
    const resetTimer = vi.fn();
    useTimerStore.setState({ resetTimer });
    render(<CommandPalette />);
    await act(async () => {
      await user.click(await screen.findByText('shell.palette.reset'));
    });

    expect(resetTimer).toHaveBeenCalledTimes(1);
    expect(useResetDialogStore.getState().open).toBe(false);
  });
});
