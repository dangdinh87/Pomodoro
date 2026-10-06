import { act, fireEvent, render, screen } from '@testing-library/react';
import enDict from '@/i18n/locales/en.json';
import viDict from '@/i18n/locales/vi.json';
import jaDict from '@/i18n/locales/ja.json';
import { useSystemStore } from '@/stores/system-store';
import { AppDock } from './app-dock';
import { usePanelStore } from './panel-store';

vi.mock('@/contexts/i18n-context', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe('AppDock', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    usePanelStore.setState({ active: null });
    useSystemStore.setState({ isFocusMode: false });
    // jsdom has no Fullscreen API; browsers that do get the toggle
    document.documentElement.requestFullscreen = vi.fn(async () => {});
  });
  afterEach(() => {
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen');
  });

  it('stays at the bottom of the screen while the stage shows, and leaves with the stage', () => {
    render(<AppDock />);
    const nav = screen.getByRole('navigation', { name: 'shell.dock' });
    expect(nav.className).toContain('safe-area-inset-bottom');
    expect(nav).toHaveAttribute('data-chrome');
    // A viewport-tall sticky box inside a frame that covers the stage section: pinned while the stage is
    // in view (a short window cannot push the dock below the fold), carried off with the stage at its end
    // (it never covers the landing content below). Neither is `fixed`.
    const box = nav.parentElement!;
    expect(box.className).toContain('sticky');
    expect(box.className).toContain('h-dvh');
    // The language bar pushes the section down by --lang-banner-h; the box is lifted by it so the dock stays on the edge
    expect(box.className).toContain('mt-[calc(-1*var(--lang-banner-h,0px))]');
    expect(box.parentElement).toBe(screen.getByTestId('dock-frame'));
    expect(screen.getByTestId('dock-frame').className).toContain('absolute inset-0');
    expect(nav.className).not.toContain('fixed');
  });

  it('gives each panel its candy colour', () => {
    const { container } = render(<AppDock />);
    const toneOf = (id: string) => container.querySelector(`[data-panel="${id}"] [data-tone]`)?.getAttribute('data-tone');
    expect(['tasks', 'sound', 'scene', 'timer', 'stats', 'arcade'].map(toneOf)).toEqual([
      'butter',
      'sky',
      'lilac',
      'mint',
      'tomato',
      'peach',
    ]);
    expect(toneOf('fullscreen')).toBe('surface');
  });

  it('shows the label under each icon for the mobile tab bar', () => {
    render(<AppDock />);
    expect(screen.getByText('shell.panels.sound')).toBeInTheDocument();
  });

  it('leaves out the fullscreen toggle where the browser cannot do fullscreen', () => {
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen');
    render(<AppDock />);
    expect(screen.queryByRole('button', { name: 'timerComponents.enhancedTimer.enterFocus' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'shell.panels.tasks' })).toBeInTheDocument();
  });

  it('only the open panel reads as pressed', () => {
    render(<AppDock />);
    fireEvent.click(screen.getByRole('button', { name: 'shell.panels.sound' }));
    expect(screen.getByRole('button', { name: 'shell.panels.sound' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'shell.panels.tasks' })).toHaveAttribute('aria-pressed', 'false');
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

  // The mobile tab bar gives each label a ~48px column at 360px and never breaks inside a word, so a
  // word that is too long would spill out of its column. Keep every label's longest word short.
  describe('tab-bar labels fit their column in every language', () => {
    type Dict = { shell: { panels: Record<string, string>; fullscreenShort: string } };
    const dock = ['tasks', 'sound', 'scene', 'timer', 'stats', 'arcade'];
    it.each([
      ['en', enDict as unknown as Dict],
      ['vi', viDict as unknown as Dict],
      ['ja', jaDict as unknown as Dict],
    ])('%s', (_lang, dict) => {
      const labels = [...dock.map((id) => dict.shell.panels[id]), dict.shell.fullscreenShort];
      for (const label of labels) {
        const longestWord = Math.max(...label.split(' ').map((word) => [...word].length));
        expect(longestWord, label).toBeLessThanOrEqual(6);
      }
    });
  });

  // WCAG 2.5.3 (label in name): a voice-control user says what they see. The tile shows `shell.fullscreenShort`.
  describe('the full screen tile is named with the words it shows', () => {
    type Dict = {
      shell: { fullscreenShort: string };
      timerComponents: { enhancedTimer: { enterFocus: string; exitFocus: string } };
    };
    it.each([
      ['en', enDict as unknown as Dict],
      ['vi', viDict as unknown as Dict],
      ['ja', jaDict as unknown as Dict],
    ])('%s', (_lang, dict) => {
      const shown = dict.shell.fullscreenShort.toLowerCase();
      expect(dict.timerComponents.enhancedTimer.enterFocus.toLowerCase()).toContain(shown);
      expect(dict.timerComponents.enhancedTimer.exitFocus.toLowerCase()).toContain(shown);
    });
  });
});
