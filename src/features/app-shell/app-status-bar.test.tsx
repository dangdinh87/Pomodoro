import { fireEvent, render, screen } from '@testing-library/react';
import { usePanelStore } from './panel-store';
import { AppStatusBar } from './app-status-bar';

const stats = vi.hoisted(() => ({
  data: undefined as { summary: { streak: { current: number }; completedSessions: number } } | undefined,
  hasSession: true,
}));
const openCommandPalette = vi.hoisted(() => vi.fn());

vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}|${Object.values(params).join(',')}` : key),
  }),
}));
vi.mock('@/hooks/use-auth', () => ({ useAuth: () => ({ hasSession: stats.hasSession }) }));
vi.mock('@/hooks/use-stats', () => ({ useStats: () => ({ data: stats.data }) }));
vi.mock('@/components/layout/user-menu', () => ({ UserMenu: () => <button type="button">avatar</button> }));
vi.mock('./command-palette', () => ({ openCommandPalette }));

const withStats = (streak: number, completedSessions: number) => {
  stats.data = { summary: { streak: { current: streak }, completedSessions } };
};

describe('AppStatusBar', () => {
  beforeEach(() => {
    stats.hasSession = true;
    withStats(0, 0);
    usePanelStore.setState({ active: null });
    window.history.replaceState(null, '', '/');
    openCommandPalette.mockClear();
  });

  it('shows the real streak as a pill that opens Stats', () => {
    withStats(12, 3);
    render(<AppStatusBar />);
    const streak = screen.getByRole('button', { name: 'shell.streak|12' });
    expect(streak).toHaveTextContent('12');
    fireEvent.click(streak);
    expect(usePanelStore.getState().active).toBe('stats');
  });

  it('hides the streak at zero but still counts today', () => {
    withStats(0, 0);
    render(<AppStatusBar />);
    expect(screen.queryByRole('button', { name: /shell\.streak/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'shell.sessionsToday|0' })).toBeInTheDocument();
  });

  it('counts sessions today with the plural form, singular for exactly one', () => {
    withStats(1, 3);
    const { unmount } = render(<AppStatusBar />);
    expect(screen.getByRole('button', { name: 'shell.sessionsToday|3' })).toBeInTheDocument();
    unmount();

    withStats(1, 1);
    render(<AppStatusBar />);
    expect(screen.getByRole('button', { name: 'shell.sessionsTodayOne|1' })).toBeInTheDocument();
  });

  it('shows neither pill when there is no session at all', () => {
    stats.hasSession = false;
    withStats(5, 5);
    render(<AppStatusBar />);
    expect(screen.queryByRole('button', { name: /shell\.streak/ })).not.toBeInTheDocument();
    expect(screen.queryByTestId('sessions-today')).not.toBeInTheDocument();
  });

  describe('logo on a narrow bar', () => {
    const wordmark = () => screen.getByText('Study Bro');

    it('never wraps the name to two lines', () => {
      render(<AppStatusBar />);
      expect(wordmark()).toHaveClass('whitespace-nowrap');
    });

    it('with the streak and sessions pills (about 340px of controls) keeps only Tomo below 380px, and still names the brand to screen readers', () => {
      withStats(3, 2);
      render(<AppStatusBar />);
      expect(wordmark()).toHaveClass('max-[379px]:sr-only');
    });

    it('with fewer pills (no session, or no streak yet) the name has room and stays', () => {
      stats.hasSession = false;
      const { unmount } = render(<AppStatusBar />);
      expect(wordmark().className).not.toContain('sr-only');
      unmount();

      stats.hasSession = true;
      withStats(0, 2);
      render(<AppStatusBar />);
      expect(wordmark().className).not.toContain('sr-only');
    });
  });

  describe('command menu hint', () => {
    const platform = vi.spyOn(window.navigator, 'platform', 'get');
    afterAll(() => platform.mockRestore());

    it('reads ⌘K on a Mac', () => {
      platform.mockReturnValue('MacIntel');
      render(<AppStatusBar />);
      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });

    it('reads Ctrl K on Windows and Linux', () => {
      platform.mockReturnValue('Win32');
      render(<AppStatusBar />);
      expect(screen.getByText('Ctrl K')).toBeInTheDocument();
      expect(screen.queryByText('⌘K')).not.toBeInTheDocument();
    });

    it('opens the command menu', () => {
      platform.mockReturnValue('Win32');
      render(<AppStatusBar />);
      fireEvent.click(screen.getAllByRole('button', { name: 'shell.palette.open' })[0]);
      expect(openCommandPalette).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps the logo and data-chrome so the bar dims while focusing', () => {
    const { container } = render(<AppStatusBar />);
    expect(container.querySelector('header[data-chrome]')).not.toBeNull();
    expect(screen.getByText('Study Bro')).toBeInTheDocument();
  });

  it('opens Settings from the gear', () => {
    render(<AppStatusBar />);
    fireEvent.click(screen.getByRole('button', { name: 'shell.panels.settings' }));
    expect(usePanelStore.getState().active).toBe('settings');
  });
});
