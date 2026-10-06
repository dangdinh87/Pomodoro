import { render, screen } from '@testing-library/react';
import { TimerControls } from './timer-controls';

// Mock translation
vi.mock('@/contexts/i18n-context', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock stores
vi.mock('@/stores/timer-store', () => ({
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
        setIsRunning: vi.fn(),
        resetTimer: vi.fn(),
        pauseTimer: vi.fn(),
        resumeTimer: vi.fn(),
        incrementCompletedSessions: vi.fn(),
        incrementSessionCount: vi.fn(),
        setMode: vi.fn(),
        setTimeLeft: vi.fn(),
        setDeadlineAt: vi.fn(),
        sessionCount: 0,
    });
  },
}));

// Mock task store
vi.mock('@/stores/task-store', () => ({
  useTasksStore: {
    getState: () => ({
      activeTaskId: null,
    }),
  },
}));

// Mock analog clock state
vi.mock('./clocks/use-analog-clock-state', () => ({
  useAnalogClockState: () => ({
    color: '#000000',
  }),
}));

// Mock other hooks
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
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
