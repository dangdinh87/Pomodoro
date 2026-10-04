import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTimerStore } from '@/stores/timer-store';
import { useTasksStore } from '@/stores/task-store';
import { requestTimerReset, useResetDialogStore } from '../lib/request-reset';
import { ResetTimerDialog } from './reset-timer-dialog';

const mockRecord = vi.fn();

vi.mock('@/contexts/i18n-context', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key} ${JSON.stringify(vars)}` : key,
  }),
}));
vi.mock('@/lib/timer/use-session-recorder', () => ({
  useSessionRecorder: () => ({ record: mockRecord, flush: vi.fn() }),
}));

const settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreak: true,
  autoStartWork: false,
  clockType: 'digital' as const,
  clockSize: 'medium' as const,
  showClock: false,
  lowTimeWarningEnabled: true,
  keepScreenOn: false,
};

function seedTimer(overrides: Record<string, unknown> = {}) {
  useTimerStore.setState({
    mode: 'work',
    timeLeft: 600, // 15 of 25 minutes done
    lastSessionTimeLeft: 1500,
    isRunning: true,
    deadlineAt: Date.now() + 600_000,
    settings,
    usePlan: false,
    plan: [],
    ...overrides,
  });
}

describe('reset with confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useResetDialogStore.setState({ open: false, mode: null });
    useTasksStore.setState({ activeTaskId: 'task-1' } as never);
    seedTimer();
  });

  it('resets right away, without a dialog, when there is no progress', () => {
    seedTimer({ isRunning: false, timeLeft: 1500, lastSessionTimeLeft: 1500, deadlineAt: null });
    render(<ResetTimerDialog />);
    act(() => requestTimerReset());

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mockRecord).not.toHaveBeenCalled();
    expect(useTimerStore.getState().timeLeft).toBe(1500);
  });

  it('asks first when there is progress, and changes nothing yet', () => {
    render(<ResetTimerDialog />);
    act(() => requestTimerReset());

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('timer.reset_confirm.title')).toBeInTheDocument();
    expect(screen.getByText(/timer\.reset_confirm\.description_save.*15:00/)).toBeInTheDocument();
    expect(useTimerStore.getState()).toMatchObject({ timeLeft: 600, isRunning: true });
    expect(mockRecord).not.toHaveBeenCalled();
  });

  it('Save what you did: records the partial segment (no pomodoro), then resets', async () => {
    const user = userEvent.setup();
    render(<ResetTimerDialog />);
    act(() => requestTimerReset());
    await user.click(screen.getByRole('button', { name: 'timer.reset_confirm.save' }));

    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith({
      taskId: 'task-1',
      durationSec: 900,
      mode: 'work',
      completedFullSession: false,
    });
    expect(useTimerStore.getState()).toMatchObject({
      timeLeft: 1500,
      lastSessionTimeLeft: 1500,
      isRunning: false,
      deadlineAt: null,
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('Reset without saving: resets and records nothing', async () => {
    const user = userEvent.setup();
    render(<ResetTimerDialog />);
    act(() => requestTimerReset());
    await user.click(screen.getByRole('button', { name: 'timer.reset_confirm.discard' }));

    expect(mockRecord).not.toHaveBeenCalled();
    expect(useTimerStore.getState()).toMatchObject({ timeLeft: 1500, isRunning: false });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('Cancel: keeps the timer exactly as it was', async () => {
    const user = userEvent.setup();
    const { deadlineAt } = useTimerStore.getState();
    render(<ResetTimerDialog />);
    act(() => requestTimerReset());
    await user.click(screen.getByRole('button', { name: 'common.cancel' }));

    expect(mockRecord).not.toHaveBeenCalled();
    expect(useTimerStore.getState()).toMatchObject({ timeLeft: 600, isRunning: true, deadlineAt });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('Escape cancels too', async () => {
    const user = userEvent.setup();
    render(<ResetTimerDialog />);
    act(() => requestTimerReset());
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(useTimerStore.getState().timeLeft).toBe(600);
  });

  it('a break has nothing to save: only reset or cancel', async () => {
    const user = userEvent.setup();
    seedTimer({ mode: 'shortBreak', timeLeft: 100, lastSessionTimeLeft: 300 });
    render(<ResetTimerDialog />);
    act(() => requestTimerReset());

    expect(screen.queryByRole('button', { name: 'timer.reset_confirm.save' })).not.toBeInTheDocument();
    expect(screen.getByText('timer.reset_confirm.description')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'timer.reset_confirm.discard' }));
    expect(mockRecord).not.toHaveBeenCalled();
    expect(useTimerStore.getState().timeLeft).toBe(300);
  });

  it('a run that just started has nothing to save yet', () => {
    seedTimer({ timeLeft: 1500, lastSessionTimeLeft: 1500 }); // running, 0 s focused
    render(<ResetTimerDialog />);
    act(() => requestTimerReset());
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'timer.reset_confirm.save' })).not.toBeInTheDocument();
  });

  it('closes by itself when the phase it asked about is over', () => {
    render(<ResetTimerDialog />);
    act(() => requestTimerReset());
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    // the engine finished the focus session and moved on while the dialog was open
    act(() => useTimerStore.setState({ mode: 'shortBreak', timeLeft: 300, lastSessionTimeLeft: 300 }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(useTimerStore.getState().timeLeft).toBe(300);
  });
});
