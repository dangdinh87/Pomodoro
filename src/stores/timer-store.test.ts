import { createJSONStorage } from 'zustand/middleware';
import { installMemoryStorage } from '@/test-utils/memory-storage';
import { useTimerStore } from './timer-store';

const NOW = 1_800_000_000_000;

function seed(state: Record<string, unknown>, version: number) {
  window.localStorage.setItem(
    'timer-storage',
    JSON.stringify({ state, version }),
  );
}

const persistedSettings = {
  workDuration: 50,
  shortBreakDuration: 10,
  longBreakDuration: 20,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartWork: false,
  clockType: 'flip',
  clockSize: 'large',
  showClock: true,
  lowTimeWarningEnabled: false,
};

describe('timer-store persistence', () => {
  beforeEach(() => {
    installMemoryStorage();
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
    useTimerStore.persist.setOptions({
      storage: createJSONStorage(() => window.localStorage),
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('persists lastSessionTimeLeft so a 50 minute session survives reload', async () => {
    useTimerStore.getState().updateSettings({ workDuration: 50 });
    expect(useTimerStore.getState().lastSessionTimeLeft).toBe(3000);

    const saved = JSON.parse(window.localStorage.getItem('timer-storage')!);
    expect(saved.version).toBe(1);
    expect(saved.state.lastSessionTimeLeft).toBe(3000);

    useTimerStore.setState({ lastSessionTimeLeft: 1500 }); // reset in memory
    await useTimerStore.persist.rehydrate();
    expect(useTimerStore.getState().lastSessionTimeLeft).toBe(3000);
  });

  it('migrates v0 storage keeping mode/settings/deadline and defaulting the rest', async () => {
    seed(
      {
        mode: 'shortBreak',
        timeLeft: 100,
        isRunning: true,
        deadlineAt: NOW + 90_000,
        sessionCount: 3,
        settings: persistedSettings,
        completedSessions: 3,
        totalFocusTime: 7000,
      },
      0,
    );
    await useTimerStore.persist.rehydrate();
    const s = useTimerStore.getState();
    expect(s.mode).toBe('shortBreak');
    expect(s.settings).toEqual(persistedSettings);
    expect(s.isRunning).toBe(true);
    expect(s.deadlineAt).toBe(NOW + 90_000);
    expect(s.timeLeft).toBe(90);
    expect(s.usePlan).toBe(false);
    expect(s.plan).toEqual([]);
    expect(s.currentStepIndex).toBe(0);
    expect(s.repeatPlan).toBe(true);
    // Never persisted before: falls back to the full phase length
    expect(s.lastSessionTimeLeft).toBe(600);
  });

  it('fills new settings keys missing from old persisted settings', async () => {
    const { lowTimeWarningEnabled, ...old } = persistedSettings;
    void lowTimeWarningEnabled;
    seed({ mode: 'work', timeLeft: 600, settings: old }, 0);
    await useTimerStore.persist.rehydrate();
    expect(useTimerStore.getState().settings.lowTimeWarningEnabled).toBe(true);
    expect(useTimerStore.getState().settings.workDuration).toBe(50);
  });

  it('keeps an elapsed running deadline as running at 0 so the engine can finish it', async () => {
    seed(
      {
        mode: 'work',
        timeLeft: 300,
        isRunning: true,
        deadlineAt: NOW - 60_000,
        settings: persistedSettings,
        lastSessionTimeLeft: 3000,
      },
      1,
    );
    await useTimerStore.persist.rehydrate();
    const s = useTimerStore.getState();
    expect(s.isRunning).toBe(true);
    expect(s.timeLeft).toBe(0);
    expect(s.deadlineAt).toBe(NOW - 60_000);
    expect(s.lastSessionTimeLeft).toBe(3000);
  });

  it('credits the unticked seconds to totalFocusTime only within the catch-up grace', async () => {
    const base = {
      mode: 'work',
      timeLeft: 120,
      isRunning: true,
      totalFocusTime: 1000,
      settings: persistedSettings,
      lastSessionTimeLeft: 3000,
    };
    seed({ ...base, deadlineAt: NOW - 60_000 }, 1);
    await useTimerStore.persist.rehydrate();
    expect(useTimerStore.getState().totalFocusTime).toBe(1120);

    seed({ ...base, deadlineAt: NOW - 20 * 60_000 }, 1);
    await useTimerStore.persist.rehydrate();
    expect(useTimerStore.getState().totalFocusTime).toBe(1000);
  });

  it('recovers a stuck paused-at-zero state from older versions', async () => {
    seed(
      { mode: 'work', timeLeft: 0, isRunning: false, settings: persistedSettings },
      0,
    );
    await useTimerStore.persist.rehydrate();
    expect(useTimerStore.getState().timeLeft).toBe(3000);
    expect(useTimerStore.getState().isRunning).toBe(false);
  });

  it('resetTimer restarts the segment baseline', () => {
    useTimerStore.setState({
      mode: 'work',
      timeLeft: 100,
      lastSessionTimeLeft: 700,
      settings: { ...persistedSettings } as never,
    });
    useTimerStore.getState().resetTimer();
    expect(useTimerStore.getState().timeLeft).toBe(3000);
    expect(useTimerStore.getState().lastSessionTimeLeft).toBe(3000);
  });
});
