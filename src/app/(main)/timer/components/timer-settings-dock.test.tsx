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
