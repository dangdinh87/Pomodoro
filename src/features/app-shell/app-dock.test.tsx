import { fireEvent, render, screen } from '@testing-library/react';
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
});
