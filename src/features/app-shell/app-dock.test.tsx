import { act, fireEvent, render, screen } from '@testing-library/react';
import { useSystemStore } from '@/stores/system-store';
import { AppDock } from './app-dock';
import { usePanelStore } from './panel-store';

vi.mock('@/contexts/i18n-context', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/animate-ui/components/animate/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: () => null,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('AppDock', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    usePanelStore.setState({ active: null });
  });

  it('labels every panel button and the focus-mode toggle', () => {
    render(<AppDock />);
    for (const key of ['tasks', 'sound', 'scene', 'timer', 'stats', 'arcade']) {
      expect(screen.getByRole('button', { name: `shell.panels.${key}` })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'timerComponents.enhancedTimer.enterFocus' })).toBeInTheDocument();
  });

  it('opens the panel and marks its button pressed', () => {
    render(<AppDock />);
    const tasks = screen.getByRole('button', { name: 'shell.panels.tasks' });
    fireEvent.click(tasks);
    expect(usePanelStore.getState().active).toBe('tasks');
    expect(tasks).toHaveAttribute('aria-pressed', 'true');
  });

  describe('fullscreen', () => {
    let fullscreenElement: Element | null = null;
    const setFullscreen = (on: boolean) =>
      act(() => {
        fullscreenElement = on ? document.documentElement : null;
        document.dispatchEvent(new Event('fullscreenchange'));
      });

    beforeEach(() => {
      fullscreenElement = null;
      Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => fullscreenElement });
      document.documentElement.requestFullscreen = vi.fn(async () => {
        fullscreenElement = document.documentElement;
        document.dispatchEvent(new Event('fullscreenchange'));
      });
      document.exitFullscreen = vi.fn(async () => {
        fullscreenElement = null;
        document.dispatchEvent(new Event('fullscreenchange'));
      });
      useSystemStore.setState({ isFocusMode: false });
    });
    afterEach(() => {
      Reflect.deleteProperty(document, 'fullscreenElement');
    });

    it('the toggle enters and leaves focus mode', async () => {
      render(<AppDock />);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'timerComponents.enhancedTimer.enterFocus' }));
      });
      expect(useSystemStore.getState().isFocusMode).toBe(true);
      expect(screen.queryByRole('button', { name: 'shell.panels.tasks' })).not.toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'timerComponents.enhancedTimer.exitFocus' }));
      });
      expect(useSystemStore.getState().isFocusMode).toBe(false);
      expect(screen.getByRole('button', { name: 'shell.panels.tasks' })).toBeInTheDocument();
    });

    it('leaving fullscreen with Esc brings the dock and the toggle back', () => {
      render(<AppDock />);
      setFullscreen(true);
      expect(useSystemStore.getState().isFocusMode).toBe(true);
      expect(screen.queryByRole('button', { name: 'shell.panels.tasks' })).not.toBeInTheDocument();

      setFullscreen(false); // the browser exits on Esc: no click happened
      expect(useSystemStore.getState().isFocusMode).toBe(false);
      expect(screen.getByRole('button', { name: 'shell.panels.tasks' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'timerComponents.enhancedTimer.enterFocus' })).toBeInTheDocument();
    });

    it('starts in sync when focus mode was left on without fullscreen', () => {
      useSystemStore.setState({ isFocusMode: true });
      render(<AppDock />);
      expect(useSystemStore.getState().isFocusMode).toBe(false);
    });

    it('stops listening on unmount', () => {
      const { unmount } = render(<AppDock />);
      unmount();
      setFullscreen(true);
      expect(useSystemStore.getState().isFocusMode).toBe(false);
    });
  });
});
