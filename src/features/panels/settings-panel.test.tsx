import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPanel from './settings-panel';

vi.mock('@/contexts/i18n-context', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/settings/general-settings', () => ({ GeneralSettings: () => <p>general body</p> }));
vi.mock('@/components/settings/appearance-settings', () => ({ AppearanceSettings: () => <p>appearance body</p> }));
vi.mock('@/components/settings/account-settings', () => ({ AccountSettings: () => <p>account body</p> }));

const content = () => screen.getByRole('main');

describe('SettingsPanel', () => {
  it('starts each section at its top, however far the previous one was scrolled', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);
    expect(screen.getByText('general body')).toBeInTheDocument();

    content().scrollTop = 420; // read to the bottom of "general"
    // desktop sidebar nav and the mobile tabs both switch sections; take the nav button
    await user.click(screen.getAllByRole('button', { name: 'settings.nav.appearance' })[0]);

    expect(screen.getByText('appearance body')).toBeInTheDocument();
    expect(content().scrollTop).toBe(0);
  });

  it('does not jump while staying in the same section', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);
    content().scrollTop = 200;
    await user.click(screen.getAllByRole('button', { name: 'settings.nav.general' })[0]);
    expect(content().scrollTop).toBe(200);
  });
});
