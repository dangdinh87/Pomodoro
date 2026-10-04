import { render, screen } from '@testing-library/react';
import { TimerSettingsModal } from './timer-settings-modal';

vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock('@/components/settings/timer-settings', () => ({
  TimerSettings: () => <div>timer settings body</div>,
}));

describe('TimerSettingsModal', () => {
  it('is a named dialog (no missing-title console error)', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<TimerSettingsModal isOpen onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'timerSettings.title' })).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
