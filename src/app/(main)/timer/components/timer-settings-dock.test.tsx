import { render, screen } from '@testing-library/react';
import { TimerSettingsDock } from './timer-settings-dock';
import '@testing-library/jest-dom';

// Mock translation
jest.mock('@/contexts/i18n-context', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock stores
jest.mock('@/stores/system-store', () => ({
  useSystemStore: () => ({
    isFocusMode: false,
    setFocusMode: jest.fn(),
  }),
}));

jest.mock('@/stores/audio-store', () => ({
  useAudioStore: (selector: any) => selector({
    currentlyPlaying: null,
    activeAmbientSounds: [],
  }),
}));

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({
    setOpen: jest.fn(),
  }),
}));

// Mock components to avoid rendering full modals
jest.mock('@/components/settings/timer-settings-modal', () => ({
  TimerSettingsModal: () => <div data-testid="timer-settings-modal" />,
}));
jest.mock('@/components/audio/audio-sidebar', () => ({
  AudioSidebar: () => <div data-testid="audio-sidebar" />,
}));
jest.mock('@/components/settings/background-settings-modal', () => ({
  __esModule: true,
  default: () => <div data-testid="background-settings-modal" />,
}));

// Mock Tooltip components
jest.mock('@/components/animate-ui/components/animate/tooltip', () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: () => null,
    TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('TimerSettingsDock', () => {
  it('should have accessible buttons', () => {
    render(<TimerSettingsDock />);

    // Check buttons via finding icon or class or index.
    // They are icon-only buttons.
    // We can query by role 'button'
    const buttons = screen.getAllByRole('button');

    // Expect 4 buttons: Music, Background, Settings, Fullscreen
    expect(buttons).toHaveLength(4);

    // Check for aria-labels
    // Music
    expect(buttons[0]).toHaveAttribute('aria-label', 'timerComponents.enhancedTimer.soundSettings');
    // Background
    expect(buttons[1]).toHaveAttribute('aria-label', 'timerComponents.enhancedTimer.backgroundSettings');
    // Settings
    expect(buttons[2]).toHaveAttribute('aria-label', 'timerComponents.enhancedTimer.timerSettings');
    // Fullscreen
    expect(buttons[3]).toHaveAttribute('aria-label', 'timerComponents.enhancedTimer.enterFocus');
  });
});
