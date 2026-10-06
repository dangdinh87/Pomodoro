import { render, screen } from '@testing-library/react';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { useSystemStore } from '@/stores/system-store';
import { useTimerStore } from '@/stores/timer-store';
import { useGoalStore } from '@/stores/goal-store';
import { DailyProgress } from './daily-progress';

let stats = { completedSessions: 0, totalFocusTime: 0 };
vi.mock('../hooks/use-active-task', () => ({ useActiveTask: () => null }));
vi.mock('./task-selector', () => ({ TaskSelector: () => null }));
vi.mock('@/hooks/use-stats', () => ({
  useStats: () => ({
    data: {
      summary: {
        completedSessions: stats.completedSessions,
        totalFocusTime: stats.totalFocusTime,
        streak: { current: 0, longest: 0 },
      },
    },
  }),
}));

const renderIn = (lang: Lang = 'en') => render(<I18nProvider initialLang={lang}><DailyProgress /></I18nProvider>);

describe('DailyProgress — daily goal ring', () => {
  beforeEach(() => {
    stats = { completedSessions: 0, totalFocusTime: 0 };
    useAuthStore.setState({ user: { id: 'u1', isAnonymous: false } });
    useSystemStore.setState({ isFocusMode: false });
    useTimerStore.setState({ mode: 'shortBreak' });
    useGoalStore.setState({ dailyGoalMinutes: 0 });
  });

  it('shows the plain session summary when no goal is set', () => {
    stats = { completedSessions: 2, totalFocusTime: 50 * 60 };
    renderIn();
    expect(screen.getByText('Today: 2 sessions · 50m')).toBeInTheDocument();
  });

  it('shows goal progress instead of the plain summary once a goal is set', () => {
    useGoalStore.setState({ dailyGoalMinutes: 120 });
    stats = { completedSessions: 1, totalFocusTime: 30 * 60 };
    renderIn();
    expect(screen.getByText('30m / 120m goal')).toBeInTheDocument();
    expect(screen.queryByText(/Today:/)).not.toBeInTheDocument();
  });

  it('switches to the reached message once focus minutes meet the goal', () => {
    useGoalStore.setState({ dailyGoalMinutes: 60 });
    stats = { completedSessions: 3, totalFocusTime: 60 * 60 };
    renderIn();
    expect(screen.getByText('Daily goal reached — 60m')).toBeInTheDocument();
  });

  it('hides the goal row entirely when there is no session (guest with no account yet)', () => {
    useAuthStore.setState({ user: null });
    useGoalStore.setState({ dailyGoalMinutes: 60 });
    renderIn();
    expect(screen.queryByText(/goal/)).not.toBeInTheDocument();
  });
});
