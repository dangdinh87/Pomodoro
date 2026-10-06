import {
  askNotificationPermission,
  getNotificationState,
  notifyPhaseComplete,
  requestNotificationPermission,
} from './notifications';

const t = (key: string) => `T(${key})`;

let permission: NotificationPermission;
let requestPermission: ReturnType<typeof vi.fn>;
let created: Array<{ title: string; options?: NotificationOptions }>;

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
}

function installNotification() {
  created = [];
  requestPermission = vi.fn(async () => {
    permission = 'granted';
    return permission;
  });
  class FakeNotification {
    static get permission() {
      return permission;
    }
    static requestPermission = requestPermission;
    constructor(title: string, options?: NotificationOptions) {
      created.push({ title, options });
    }
  }
  vi.stubGlobal('Notification', FakeNotification);
}

describe('notifyPhaseComplete', () => {
  beforeEach(() => {
    permission = 'granted';
    installNotification();
    setHidden(true);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    setHidden(false);
  });

  it.each([
    ['work', 'focusDone'],
    ['shortBreak', 'breakDone'],
    ['longBreak', 'longBreakDone'],
  ] as const)('%s uses the %s texts of the current language', (mode, key) => {
    notifyPhaseComplete(mode, t);
    expect(created).toEqual([
      {
        title: `T(timer.notifications.${key}.title)`,
        options: { body: `T(timer.notifications.${key}.body)`, tag: 'timer-complete' },
      },
    ]);
  });

  it('stays quiet while the tab is visible (the in-page alert covers it)', () => {
    setHidden(false);
    notifyPhaseComplete('work', t);
    expect(created).toHaveLength(0);
  });

  it('shows while the tab is visible when asked to (pages without the timer on screen)', () => {
    setHidden(false);
    notifyPhaseComplete('shortBreak', t, { evenIfVisible: true });
    expect(created).toHaveLength(1);
    expect(created[0].title).toBe('T(timer.notifications.breakDone.title)');
  });

  it.each(['default', 'denied'] as const)('stays quiet when permission is %s', (p) => {
    permission = p;
    notifyPhaseComplete('work', t);
    expect(created).toHaveLength(0);
  });

  it('survives browsers that only allow notifications through a service worker', () => {
    vi.stubGlobal(
      'Notification',
      Object.assign(
        function () {
          throw new TypeError('Illegal constructor');
        },
        { permission: 'granted' },
      ),
    );
    expect(() => notifyPhaseComplete('work', t)).not.toThrow();
  });
});

describe('notification permission', () => {
  beforeEach(() => {
    permission = 'default';
    installNotification();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('reports the browser state', () => {
    expect(getNotificationState()).toBe('default');
    permission = 'denied';
    expect(getNotificationState()).toBe('denied');
  });

  it('reports unsupported browsers', () => {
    vi.unstubAllGlobals();
    // jsdom has no Notification
    expect(getNotificationState()).toBe('unsupported');
  });

  it('askNotificationPermission prompts and returns the answer', async () => {
    await expect(askNotificationPermission()).resolves.toBe('granted');
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it('askNotificationPermission never prompts again once decided', async () => {
    permission = 'denied';
    await expect(askNotificationPermission()).resolves.toBe('denied');
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('the Start-click request only prompts while undecided', () => {
    requestNotificationPermission();
    expect(requestPermission).toHaveBeenCalledTimes(1);
    requestPermission.mockClear();
    permission = 'granted';
    requestNotificationPermission();
    expect(requestPermission).not.toHaveBeenCalled();
  });
});
