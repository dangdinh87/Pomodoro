import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAudioStore } from '@/stores/audio-store';
import { useTimerStore } from '@/stores/timer-store';
import { BellNotificationsSection } from './bell-notifications-section';

const mockPlayAlarm = vi.fn();
const mockAsk = vi.fn();
let notificationState = 'default';

vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({
    t: (key: string, vars?: Record<string, unknown>) => (vars ? `${key} ${JSON.stringify(vars)}` : key),
  }),
}));
vi.mock('@/lib/timer/alarm', () => ({
  ALARM_NONE: 'none',
  playAlarm: () => mockPlayAlarm(),
}));
vi.mock('@/lib/timer/use-notification-state', () => ({
  useNotificationState: () => ({ state: notificationState, ask: mockAsk }),
}));

// Radix Select leans on pointer APIs jsdom lacks
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
});

const audio = () => useAudioStore.getState().audioSettings;

describe('BellNotificationsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationState = 'default';
    useAudioStore.setState({
      audioSettings: { ...audio(), alarmType: 'bell', alarmVolume: 70 },
    });
    useTimerStore.setState({
      settings: { ...useTimerStore.getState().settings, keepScreenOn: false },
    });
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: vi.fn() } });
  });
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'wakeLock');
  });

  describe('bell sound', () => {
    it('shows the selected sound', () => {
      render(<BellNotificationsSection />);
      expect(screen.getByRole('combobox', { name: 'timerSettings.bell.sound' })).toHaveTextContent(
        'timerSettings.bell.sounds.bell',
      );
    });

    it('lists the five bells plus None, and saves the choice straight away', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<BellNotificationsSection onChange={onChange} />);
      await user.click(screen.getByRole('combobox', { name: 'timerSettings.bell.sound' }));

      const options = screen.getAllByRole('option').map((o) => o.textContent);
      expect(options).toEqual(
        ['bell', 'chime', 'gong', 'digital', 'soft', 'none'].map((id) => `timerSettings.bell.sounds.${id}`),
      );
      await user.click(screen.getByRole('option', { name: 'timerSettings.bell.sounds.gong' }));
      expect(audio().alarmType).toBe('gong');
      expect(onChange).toHaveBeenCalled();
    });

    it('None silences the bell: volume and preview are disabled', async () => {
      useAudioStore.setState({ audioSettings: { ...audio(), alarmType: 'none' } });
      render(<BellNotificationsSection />);
      expect(screen.getByRole('slider', { name: 'timerSettings.bell.volume' })).toHaveAttribute('data-disabled');
      expect(screen.getByRole('button', { name: 'timerSettings.bell.preview' })).toBeDisabled();
    });
  });

  describe('volume', () => {
    it('shows the current volume and changes it with the keyboard', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<BellNotificationsSection onChange={onChange} />);
      expect(screen.getByText('70%')).toBeInTheDocument();

      screen.getByRole('slider', { name: 'timerSettings.bell.volume' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(audio().alarmVolume).toBe(75);
      expect(screen.getByText('75%')).toBeInTheDocument();
      await user.keyboard('{End}');
      expect(audio().alarmVolume).toBe(100);
      await user.keyboard('{Home}');
      expect(audio().alarmVolume).toBe(10); // never fully silent: None is the way to mute
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('preview', () => {
    it('plays the bell with the current settings', async () => {
      const user = userEvent.setup();
      render(<BellNotificationsSection />);
      await user.click(screen.getByRole('button', { name: 'timerSettings.bell.preview' }));
      expect(mockPlayAlarm).toHaveBeenCalledTimes(1);
    });
  });

  describe('browser notifications', () => {
    it('undecided: offers Turn on, which asks for permission', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<BellNotificationsSection onChange={onChange} />);
      expect(screen.getByText('timerSettings.bell.notificationsHint')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'timerSettings.bell.notificationsTurnOn' }));
      expect(mockAsk).toHaveBeenCalledTimes(1);
    });

    it('granted: says it is on, no button', () => {
      notificationState = 'granted';
      render(<BellNotificationsSection />);
      expect(screen.getByText('timerSettings.bell.notificationsOn')).toBeInTheDocument();
      expect(screen.getByText('timerSettings.bell.notificationsOnHint')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'timerSettings.bell.notificationsTurnOn' })).not.toBeInTheDocument();
    });

    it('denied: explains how to unblock instead of a dead button', () => {
      notificationState = 'denied';
      render(<BellNotificationsSection />);
      expect(screen.getByText('timerSettings.bell.notificationsDenied')).toBeInTheDocument();
      expect(screen.getByText('timerSettings.bell.notificationsDeniedHint')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'timerSettings.bell.notificationsTurnOn' })).not.toBeInTheDocument();
    });

    it('unsupported: says so', () => {
      notificationState = 'unsupported';
      render(<BellNotificationsSection />);
      expect(screen.getByText('timerSettings.bell.notificationsUnsupportedHint')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'timerSettings.bell.notificationsTurnOn' })).not.toBeInTheDocument();
    });
  });

  describe('keep screen on', () => {
    it('toggles the setting and saves it straight away', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<BellNotificationsSection onChange={onChange} />);
      const toggle = screen.getByRole('switch', { name: 'timerSettings.bell.keepScreenOn' });
      expect(toggle).not.toBeChecked();
      await user.click(toggle);
      expect(useTimerStore.getState().settings.keepScreenOn).toBe(true);
      expect(onChange).toHaveBeenCalled();
      await user.click(toggle);
      expect(useTimerStore.getState().settings.keepScreenOn).toBe(false);
    });

    it('is hidden where the Wake Lock API does not exist', () => {
      Reflect.deleteProperty(navigator, 'wakeLock');
      render(<BellNotificationsSection />);
      expect(screen.queryByRole('switch', { name: 'timerSettings.bell.keepScreenOn' })).not.toBeInTheDocument();
    });
  });
});
