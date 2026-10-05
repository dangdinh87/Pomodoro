import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAudioStore } from '@/stores/audio-store';
import { useTimerStore } from '@/stores/timer-store';
import { useResetDialogStore } from '@/features/timer/lib/request-reset';
import { registerTimerSkip } from '@/features/timer/lib/request-skip';
import { CommandPalette, usePaletteStore } from './command-palette';
import { usePanelStore } from './panel-store';
import { useShortcutHelpStore } from './shortcut-help';

vi.mock('@/contexts/i18n-context', () => ({
  LANGS: [{ code: 'en', label: 'English' }],
  useI18n: () => ({ t: (key: string) => key, lang: 'en', setLang: vi.fn() }),
}));
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ isAuthenticated: false, signOut: vi.fn() }),
}));

describe('CommandPalette loading', () => {
  it('loads its dialog only once opened (cmdk and the command icons stay out of the app chunk)', async () => {
    // cmdk scrolls the active item into view
    Element.prototype.scrollIntoView = vi.fn();
    usePaletteStore.setState({ open: false });
    render(<CommandPalette />);
    expect(screen.queryByRole('dialog')).toBeNull();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(usePaletteStore.getState().open).toBe(true);
  });
});

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

describe('CommandPalette commands', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    window.history.replaceState(null, '', '/');
    usePanelStore.setState({ active: null });
    usePaletteStore.setState({ open: true });
    useShortcutHelpStore.setState({ open: false });
    useTimerStore.setState({ mode: 'work', timeLeft: 1500, lastSessionTimeLeft: 1500, isRunning: false, deadlineAt: null });
  });
  afterEach(() => {
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen');
  });

  const pick = async (label: string) => {
    const user = userEvent.setup();
    await act(async () => {
      await user.click(await screen.findByText(label));
    });
  };

  it('Add a task opens the Tasks panel', async () => {
    render(<CommandPalette />);
    await pick('shell.palette.addTask');
    expect(usePanelStore.getState().active).toBe('tasks');
    expect(usePaletteStore.getState().open).toBe(false);
  });

  it('Change scene opens the Scene panel', async () => {
    render(<CommandPalette />);
    await pick('shell.palette.changeScene');
    expect(usePanelStore.getState().active).toBe('scene');
  });

  it('Mute and Unmute flip the same switch the sound panel uses', async () => {
    const toggleMute = vi.fn();
    useAudioStore.setState({ toggleMute, audioSettings: { ...useAudioStore.getState().audioSettings, isMuted: false } });
    const { unmount } = render(<CommandPalette />);
    await pick('shell.palette.mute');
    expect(toggleMute).toHaveBeenCalledTimes(1);
    unmount();

    useAudioStore.setState({ audioSettings: { ...useAudioStore.getState().audioSettings, isMuted: true } });
    usePaletteStore.setState({ open: true });
    render(<CommandPalette />);
    await pick('shell.palette.unmute');
    expect(toggleMute).toHaveBeenCalledTimes(2);
  });

  it('Skip goes through requestTimerSkip, the same entry point as the skip button', async () => {
    const onSkip = vi.fn();
    const unregister = registerTimerSkip(onSkip);

    render(<CommandPalette />);
    await pick('shell.palette.skip');
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(usePaletteStore.getState().open).toBe(false);
    unregister();
  });

  it('Skip with no timer mounted just closes the palette', async () => {
    render(<CommandPalette />);
    await pick('shell.palette.skip');
    expect(usePaletteStore.getState().open).toBe(false);
  });

  it('Toggle fullscreen is offered only where the browser can do it', async () => {
    const { unmount } = render(<CommandPalette />);
    // The palette's code loads on demand: wait for it before checking what it leaves out
    expect(await screen.findByText('shell.palette.reset')).toBeInTheDocument();
    expect(screen.queryByText('shell.palette.fullscreen')).not.toBeInTheDocument();
    unmount();

    const requestFullscreen = vi.fn(async () => {});
    document.documentElement.requestFullscreen = requestFullscreen;
    usePaletteStore.setState({ open: true });
    render(<CommandPalette />);
    await pick('shell.palette.fullscreen');
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('Keyboard shortcuts opens the help dialog', async () => {
    render(<CommandPalette />);
    await pick('shell.palette.shortcuts');
    expect(useShortcutHelpStore.getState().open).toBe(true);
    expect(await screen.findByText('shell.shortcuts.title')).toBeInTheDocument();
  });

  it('uses the dialog scrim, not a custom black overlay', () => {
    render(<CommandPalette />);
    expect(document.body.querySelector('[class*="bg-black"]')).toBeNull();
  });
});
