import { render, screen } from '@testing-library/react';
import { TimerSettingsDock } from './timer-settings-dock';

// Mock translation
vi.mock('@/contexts/i18n-context', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock stores
vi.mock('@/stores/system-store', () => ({
  useSystemStore: () => ({
    isFocusMode: false,
    setFocusMode: vi.fn(),
  }),
}));

vi.mock('@/stores/audio-store', () => ({
  useAudioStore: (selector: any) => selector({
    currentlyPlaying: null,
    activeAmbientSounds: [],
  }),
}));

// Mock components to avoid rendering full modals
vi.mock('@/components/settings/timer-settings-modal', () => ({
  TimerSettingsModal: () => <div data-testid="timer-settings-modal" />,
}));
vi.mock('@/components/audio/audio-sidebar', () => ({
  AudioSidebar: () => <div data-testid="audio-sidebar" />,
}));
vi.mock('@/components/settings/background-settings-modal', () => ({
  __esModule: true,
  default: () => <div data-testid="background-settings-modal" />,
}));

// Mock Tooltip components
vi.mock('@/components/animate-ui/components/animate/tooltip', () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: () => null,
    TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('TimerSettingsDock', () => {
  it('should have accessible buttons', () => {
    render(<TimerSettingsDock />);

    // Four icon-only buttons; `t` is mocked to echo keys, so each must be
    // reachable by its i18n label regardless of DOM order.
    expect(screen.getAllByRole('button')).toHaveLength(4);

    [
      'timerComponents.enhancedTimer.soundSettings',
      'timerComponents.enhancedTimer.timerSettings',
      'timerComponents.enhancedTimer.backgroundSettings',
      'timerComponents.enhancedTimer.enterFocus',
    ].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });
});
