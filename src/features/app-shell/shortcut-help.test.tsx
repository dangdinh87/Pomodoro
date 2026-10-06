import { act, fireEvent, render, screen } from '@testing-library/react';
import { ShortcutHelp, useShortcutHelpStore } from './shortcut-help';

vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) => (params ? `${key}|${Object.values(params).join(',')}` : key),
  }),
}));

const press = (key: string, init: KeyboardEventInit = {}, target: EventTarget = document.body) =>
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
  });

describe('ShortcutHelp', () => {
  beforeEach(() => useShortcutHelpStore.setState({ open: false }));

  it('opens on ? and lists the hotkeys', async () => {
    const platform = vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('Win32');
    render(<ShortcutHelp />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    press('?', { shiftKey: true });
    const dialog = await screen.findByRole('dialog', { name: 'shell.shortcuts.title' });

    // Space, R, T, S, B, C, H, G, Ctrl K, ?
    const keys = Array.from(dialog.querySelectorAll('kbd')).map((k) => k.textContent);
    expect(keys).toEqual(['timerUi.spaceKey', 'R', 'T', 'S', 'B', 'C', 'H', 'G', 'Ctrl K', '?']);
    platform.mockRestore();
  });

  it('shows ⌘K on a Mac', async () => {
    const platform = vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('MacIntel');
    render(<ShortcutHelp />);
    press('?', { shiftKey: true });
    expect(await screen.findByText('⌘K')).toBeInTheDocument();
    platform.mockRestore();
  });

  it('stays quiet while typing in a field', () => {
    render(
      <>
        <input aria-label="field" />
        <ShortcutHelp />
      </>,
    );
    fireEvent.keyDown(screen.getByLabelText('field'), { key: '?', shiftKey: true });
    expect(useShortcutHelpStore.getState().open).toBe(false);
  });

  it('ignores ? held with Ctrl or Cmd (browser shortcuts)', () => {
    render(<ShortcutHelp />);
    press('?', { ctrlKey: true });
    press('?', { metaKey: true });
    expect(useShortcutHelpStore.getState().open).toBe(false);
  });

  it('closes with Escape', async () => {
    render(<ShortcutHelp />);
    press('?', { shiftKey: true });
    await screen.findByRole('dialog');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(useShortcutHelpStore.getState().open).toBe(false);
  });
});
