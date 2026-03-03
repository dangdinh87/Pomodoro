import { render, screen } from '@testing-library/react';
import { TimerControls } from './timer-controls';
import '@testing-library/jest-dom';

// Mock translation
jest.mock('@/contexts/i18n-context', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock stores
jest.mock('@/stores/timer-store', () => ({
  useTimerStore: (selector: any) => {
    if (typeof selector !== 'function') return selector; // Handle non-selector usage if any
    return selector({
        isRunning: false,
        mode: 'work',
        timeLeft: 1500,
        settings: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
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
    });
  },
}));

// Mock task store
jest.mock('@/stores/task-store', () => ({
  useTasksStore: {
    getState: () => ({
      activeTaskId: null,
    }),
  },
}));

// Mock analog clock state
jest.mock('./clocks/use-analog-clock-state', () => ({
  useAnalogClockState: () => ({
    color: '#000000',
  }),
}));

// Mock other hooks
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

describe('TimerControls', () => {
  it('should have an accessible skip button', () => {
    render(<TimerControls />);

    // The skip button has title="timer.controls.skip_hint"
    const skipButton = screen.getByTitle('timer.controls.skip_hint');
    expect(skipButton).toBeInTheDocument();

    // It should have an aria-label
    expect(skipButton).toHaveAttribute('aria-label', 'timer.controls.skip_hint');
  });
});
