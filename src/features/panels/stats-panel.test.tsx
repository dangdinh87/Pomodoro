import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { usePanelStore } from '@/features/app-shell/panel-store';
import StatsPanel from './stats-panel';

const auth = vi.hoisted(() => ({ hasSession: false, isLoading: false }));
vi.mock('@/hooks/use-auth', () => ({ useAuth: () => auth }));
vi.mock('@/hooks/use-stats', () => ({ useStats: () => ({ data: undefined, isLoading: false, isError: false }) }));
vi.mock('@/hooks/use-history', () => ({ useHistory: () => ({ data: undefined, isLoading: false, isError: false }) }));

const renderPanel = (lang: Lang = 'en') =>
  render(
    <I18nProvider initialLang={lang}>
      <StatsPanel />
    </I18nProvider>,
  );

describe('StatsPanel for a visitor with no session yet', () => {
  beforeEach(() => {
    auth.hasSession = false;
    auth.isLoading = false;
    usePanelStore.setState({ active: 'stats' });
  });

  it('is an empty state that invites a first session, not a sign-in wall (the landing page promises no account)', () => {
    renderPanel();
    expect(screen.getByRole('heading', { name: 'Stats' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No sessions yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start focusing' })).toBeInTheDocument();
  });

  it('keeps signing in one tap away, for stats that live in an account', async () => {
    renderPanel();
    await userEvent.click(screen.getByRole('button', { name: 'Sign in to view your stats' }));
    expect(usePanelStore.getState().active).toBe('login');
  });

  it('"Start focusing" closes the panel back to the timer', async () => {
    renderPanel();
    await userEvent.click(screen.getByRole('button', { name: 'Start focusing' }));
    expect(usePanelStore.getState().active).toBeNull();
  });

  it.each([
    ['vi', 'Thống kê'],
    ['ja', '統計'],
  ] as const)('is titled like its dock tile in %s', (lang, title) => {
    renderPanel(lang);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });
});
