import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createJSONStorage } from 'zustand/middleware';
import { installMemoryStorage } from '@/test-utils/memory-storage';
import { useAudioStore } from '@/stores/audio-store';
import { defaultSettings, useTimerStore } from '@/stores/timer-store';
import { useGoalStore } from '@/stores/goal-store';
import { TimerSettings } from './timer-settings';

const toastSuccess = vi.fn();

vi.mock('sonner', () => ({ toast: { success: (m: string) => toastSuccess(m) } }));
vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({
    t: (key: string, vars?: Record<string, unknown>) => (vars ? `${key} ${JSON.stringify(vars)}` : key),
  }),
}));
vi.mock('@/features/timer/components/clocks/clock-style-picker', () => ({
  ClockStylePicker: ({ onChange }: { onChange: (v: string) => void }) => (
    <button onClick={() => onChange('flip')}>pick-flip</button>
  ),
}));
vi.mock('./bell-notifications-section', () => ({
  BellNotificationsSection: ({ onChange }: { onChange?: () => void }) => (
    <button onClick={() => onChange?.()}>bell-changed</button>
  ),
}));

const settings = () => useTimerStore.getState().settings;
const workField = () => screen.getByRole('textbox', { name: /timerSettings.labels.workDuration/ });
const saved = () => screen.queryByText('settings.saved');
const persisted = () => JSON.parse(window.localStorage.getItem('timer-storage')!).state.settings;
const persistedGoal = () => JSON.parse(window.localStorage.getItem('goal-settings')!).state.dailyGoalMinutes;

describe('TimerSettings (saves as you change)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installMemoryStorage();
    useTimerStore.persist.setOptions({ storage: createJSONStorage(() => window.localStorage) });
    useTimerStore.setState({
      mode: 'work',
      isRunning: false,
      timeLeft: 25 * 60,
      lastSessionTimeLeft: 25 * 60,
      deadlineAt: null,
      settings: { ...defaultSettings },
    });
    useGoalStore.persist.setOptions({ storage: createJSONStorage(() => window.localStorage) });
    useGoalStore.setState({ dailyGoalMinutes: 0 });
  });

  it('has no Save button: there is nothing pending', () => {
    render(<TimerSettings onClose={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'timerSettings.actions.save' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'timerSettings.actions.saveChanges' })).not.toBeInTheDocument();
    expect(saved()).not.toBeInTheDocument();
  });

  it('a switch applies and persists the moment it flips', async () => {
    const user = userEvent.setup();
    render(<TimerSettings onClose={vi.fn()} />);
    const autoWork = screen.getByRole('switch', { name: 'timerSettings.labels.autoStartWork' });
    expect(autoWork).not.toBeChecked(); // new default
    await user.click(autoWork);

    expect(settings().autoStartWork).toBe(true);
    expect(persisted().autoStartWork).toBe(true);
    expect(saved()).toBeInTheDocument();
    await user.click(screen.getByRole('switch', { name: 'timerSettings.labels.autoStartBreaks' }));
    expect(settings().autoStartBreak).toBe(false);
  });

  it('a typed duration applies on blur, clamped to its limits', async () => {
    const user = userEvent.setup();
    render(<TimerSettings onClose={vi.fn()} />);
    const work = workField();

    await user.clear(work);
    await user.type(work, '40');
    expect(settings().workDuration).toBe(25); // still typing
    await user.tab();
    expect(settings().workDuration).toBe(40);
    expect(persisted().workDuration).toBe(40);
    expect(saved()).toBeInTheDocument();

    await user.clear(work);
    await user.type(work, '999{Enter}');
    expect(settings().workDuration).toBe(120);
    expect(work).toHaveValue('120');
  });

  it('an emptied duration falls back to the saved value instead of 0', async () => {
    const user = userEvent.setup();
    render(<TimerSettings onClose={vi.fn()} />);
    const work = workField();
    await user.clear(work);
    await user.tab();
    expect(settings().workDuration).toBe(25);
    expect(work).toHaveValue('25');
  });

  it('the stepper buttons apply immediately', async () => {
    const user = userEvent.setup();
    render(<TimerSettings onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /timerSettings.stepper.increase.*workDuration/ }));
    expect(settings().workDuration).toBe(26);
    await user.click(screen.getByRole('button', { name: /timerSettings.stepper.decrease.*shortBreakDuration/ }));
    expect(settings().shortBreakDuration).toBe(4);
  });

  it('a preset applies all three durations at once', async () => {
    const user = userEvent.setup();
    render(<TimerSettings onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /timerSettings.presets.label.*"focus":50/ }));
    expect(settings()).toMatchObject({ workDuration: 50, shortBreakDuration: 10, longBreakDuration: 30 });
    expect(useTimerStore.getState().timeLeft).toBe(50 * 60); // idle timer follows
  });

  it('clock style and size apply immediately', async () => {
    const user = userEvent.setup();
    render(<TimerSettings onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'pick-flip' }));
    expect(settings().clockType).toBe('flip');
    await user.click(screen.getByRole('radio', { name: 'timerSettings.labels.large' }));
    expect(settings().clockSize).toBe('large');
  });

  it('shows "Saved" when the bell section changes something', async () => {
    const user = userEvent.setup();
    render(<TimerSettings onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'bell-changed' }));
    expect(saved()).toBeInTheDocument();
  });

  it('Reset to defaults really restores and persists every timer setting and the bell', async () => {
    const user = userEvent.setup();
    useTimerStore.getState().updateSettings({
      workDuration: 50,
      shortBreakDuration: 10,
      longBreakInterval: 6,
      autoStartWork: true,
      autoStartBreak: false,
      clockType: 'flip',
      clockSize: 'large',
      keepScreenOn: true,
    });
    useAudioStore.getState().updateAudioSettings({ alarmType: 'wood', alarmVolume: 30 });

    render(<TimerSettings onClose={vi.fn()} />);
    await user.click(screen.getAllByRole('button', { name: 'timerSettings.actions.resetDefaults' })[0]);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'timerSettings.resetConfirm.confirm' }));

    expect(settings()).toEqual(defaultSettings);
    expect(persisted()).toEqual(defaultSettings);
    expect(useAudioStore.getState().audioSettings).toMatchObject({ alarmType: 'bell', alarmVolume: 70 });
    expect(toastSuccess).toHaveBeenCalledWith('timerSettings.toasts.reset');
    expect(workField()).toHaveValue('25');
  });

  it('Reset to defaults asks first: nothing changes until confirmed, and Cancel keeps the settings', async () => {
    const user = userEvent.setup();
    useTimerStore.getState().updateSettings({ workDuration: 50 });
    render(<TimerSettings onClose={vi.fn()} />);

    await user.click(screen.getAllByRole('button', { name: 'timerSettings.actions.resetDefaults' })[0]);
    const dialog = screen.getByRole('alertdialog', { name: 'timerSettings.resetConfirm.title' });
    expect(dialog).toHaveTextContent('timerSettings.resetConfirm.description');
    expect(settings().workDuration).toBe(50); // asking is not resetting
    expect(toastSuccess).not.toHaveBeenCalled();
    // Space/Enter right after it opens must hit the safe button, not the destructive one
    expect(within(dialog).getByRole('button', { name: 'common.cancel' })).toHaveFocus();

    await user.keyboard(' ');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(settings().workDuration).toBe(50);
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('closing needs no confirmation and keeps what was set', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TimerSettings onClose={onClose} />);
    await user.click(screen.getByRole('switch', { name: 'timerSettings.labels.lowTimeWarning' }));
    await user.click(screen.getByRole('button', { name: 'common.close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(settings().lowTimeWarningEnabled).toBe(false);
  });

  it('follows the store when another tab changes a setting', () => {
    render(<TimerSettings onClose={vi.fn()} />);
    act(() => useTimerStore.setState({ settings: { ...defaultSettings, workDuration: 33 } }));
    expect(workField()).toHaveValue('33');
  });

  it('a daily goal preset applies and persists the moment it is picked', async () => {
    const user = userEvent.setup();
    render(<TimerSettings onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: '120 settingsUi.unitMin' }));
    expect(useGoalStore.getState().dailyGoalMinutes).toBe(120);
    expect(persistedGoal()).toBe(120);
    expect(saved()).toBeInTheDocument();
  });

  it('"Off" clears the daily goal', async () => {
    const user = userEvent.setup();
    useGoalStore.setState({ dailyGoalMinutes: 90 });
    render(<TimerSettings onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'timerSettings.labels.dailyGoalOff' }));
    expect(useGoalStore.getState().dailyGoalMinutes).toBe(0);
    expect(persistedGoal()).toBe(0);
  });
});
