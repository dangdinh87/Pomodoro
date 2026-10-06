import { createJSONStorage } from 'zustand/middleware';
import { installMemoryStorage } from '@/test-utils/memory-storage';
import { useGoalStore } from './goal-store';

describe('goal-store', () => {
  beforeEach(() => {
    installMemoryStorage();
    useGoalStore.persist.setOptions({ storage: createJSONStorage(() => window.localStorage) });
    useGoalStore.setState({ dailyGoalMinutes: 0 });
  });

  it('defaults to no goal (off)', () => {
    expect(useGoalStore.getState().dailyGoalMinutes).toBe(0);
  });

  it('sets and rounds the goal', () => {
    useGoalStore.getState().setDailyGoalMinutes(90.4);
    expect(useGoalStore.getState().dailyGoalMinutes).toBe(90);
  });

  it('clamps negative values to 0', () => {
    useGoalStore.getState().setDailyGoalMinutes(-30);
    expect(useGoalStore.getState().dailyGoalMinutes).toBe(0);
  });

  it('persists under its own storage key', async () => {
    useGoalStore.getState().setDailyGoalMinutes(120);
    await vi.waitFor(() => {
      const raw = window.localStorage.getItem('goal-settings');
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).state.dailyGoalMinutes).toBe(120);
    });
  });
});
