import { act, render, screen } from '@testing-library/react';
import { closePanel, openPanel } from './panel-store';
import { PanelHost } from './panel-host';

vi.mock('@/contexts/i18n-context', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
// Keep the heavy panels out: only the dialog shells are under test
vi.mock('@/components/audio/audio-sidebar', () => ({ AudioSidebar: () => null }));
vi.mock('@/components/settings/background-settings-modal', () => ({ default: () => null }));
vi.mock('@/components/settings/timer-settings-modal', () => ({ TimerSettingsModal: () => null }));
vi.mock('@/components/auth/login-form', () => ({ LoginForm: () => <div data-testid="login-card" className="sticker-lg" /> }));
vi.mock('./panel-loaders', () => ({
  LAZY_PANELS: {
    tasks: () => null,
    stats: () => null,
    arcade: () => null,
    settings: () => <div data-testid="settings-body" />,
    feedback: () => null,
  },
}));

afterEach(() => act(() => closePanel()));

describe('PanelHost dialog shells', () => {
  it('pads a transparent shell (login), so the scroll container never clips the card outline or shadow', () => {
    render(<PanelHost googleEnabled={false} />);
    act(() => openPanel('login'));

    const shell = screen.getByRole('dialog');
    // overflow-y-auto stays (short screens scroll); the padding is what keeps the card's 2.5px outline
    // and its 6px hard shadow inside the scroll box
    expect(shell).toHaveClass('overflow-y-auto', 'p-2', 'bg-transparent');
    expect(shell).not.toHaveClass('p-0');
    expect(screen.getByTestId('login-card')).toBeInTheDocument();
  });

  it('lets a panel that is its own card (settings) fill the shell edge to edge', () => {
    render(<PanelHost googleEnabled={false} />);
    act(() => openPanel('settings'));

    const shell = screen.getByRole('dialog');
    expect(shell).toHaveClass('p-0');
    expect(shell).not.toHaveClass('bg-transparent');
  });
});
