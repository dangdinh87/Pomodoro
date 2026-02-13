import { render, screen } from '@testing-library/react';
import { TimerControls } from './timer-controls';

// Mock dependencies
jest.mock('@/contexts/i18n-context', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock Timer Store
jest.mock('@/stores/timer-store', () => {
    const mockState = {
      isRunning: false,
      mode: 'work',
      timeLeft: 1500, // 25 mins
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreak: false,
        autoStartWork: false,
      },
      setIsRunning: jest.fn(),
      resetTimer: jest.fn(),
      pauseTimer: jest.fn(),
      resumeTimer: jest.fn(),
      incrementCompletedSessions: jest.fn(),
      incrementSessionCount: jest.fn(),
      setMode: jest.fn(),
      setTimeLeft: jest.fn(),
      setDeadlineAt: jest.fn(),
      sessionCount: 0,
      setLastSessionTimeLeft: jest.fn(),
    };

    const useTimerStore = jest.fn((selector) => selector(mockState));
    // @ts-ignore
    useTimerStore.getState = jest.fn(() => mockState);

    return { useTimerStore };
});

jest.mock('@/stores/task-store', () => ({
  useTasksStore: {
    getState: () => ({ activeTaskId: null }),
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-confetti', () => ({
  useConfetti: () => ({
    fireWorkComplete: jest.fn(),
  }),
}));

jest.mock('./clocks/use-analog-clock-state', () => ({
  useAnalogClockState: () => ({
    color: '#000000',
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
  },
}));


describe('TimerControls Accessibility', () => {
  it('renders skip button with accessible label', () => {
    render(<TimerControls />);

    // The skip button should have aria-label="timer.controls.skip_hint"
    // Since we mocked t(key) => key, we look for that key.

    // This expects the button to have an accessible name matching the key.
    const skipButton = screen.getByRole('button', { name: 'timer.controls.skip_hint' });
    expect(skipButton).toBeInTheDocument();
    expect(skipButton).toHaveAttribute('aria-label', 'timer.controls.skip_hint');
  });
});
