import {
  getTimerAnnouncement,
  formatSpokenTime,
  type AnnouncerState,
} from './timer-announcement';

// Echo translator: key plus sorted vars, so assertions stay locale-independent.
const t = (key: string, vars?: Record<string, string | number>) =>
  vars
    ? `${key}|${Object.keys(vars)
        .sort()
        .map((k) => `${k}=${vars[k]}`)
        .join(',')}`
    : key;

const s = (over: Partial<AnnouncerState>): AnnouncerState => ({
  mode: 'work',
  timeLeft: 1500,
  isRunning: false,
  ...over,
});

describe('formatSpokenTime', () => {
  it('formats seconds, minutes and mixed', () => {
    expect(formatSpokenTime(45, t)).toBe('timerAnnouncer.seconds|count=45');
    expect(formatSpokenTime(300, t)).toBe('timerAnnouncer.minutes|count=5');
    expect(formatSpokenTime(90, t)).toBe(
      'timerAnnouncer.minute|count=1 timerAnnouncer.seconds|count=30',
    );
  });

  it('uses singular keys for exactly one unit', () => {
    expect(formatSpokenTime(1, t)).toBe('timerAnnouncer.second|count=1');
    expect(formatSpokenTime(60, t)).toBe('timerAnnouncer.minute|count=1');
    expect(formatSpokenTime(121, t)).toBe(
      'timerAnnouncer.minutes|count=2 timerAnnouncer.second|count=1',
    );
  });
});

describe('getTimerAnnouncement', () => {
  it('announces start', () => {
    const msg = getTimerAnnouncement(s({}), s({ isRunning: true }), t);
    expect(msg).toContain('timerAnnouncer.started');
  });

  it('announces pause', () => {
    const msg = getTimerAnnouncement(
      s({ isRunning: true, timeLeft: 900 }),
      s({ isRunning: false, timeLeft: 899 }),
      t,
    );
    expect(msg).toContain('timerAnnouncer.paused');
  });

  it('announces phase completion with next phase', () => {
    const msg = getTimerAnnouncement(
      s({ isRunning: true, timeLeft: 1 }),
      s({ mode: 'shortBreak', timeLeft: 300, isRunning: true }),
      t,
    );
    expect(msg).toContain('timerAnnouncer.completed');
    expect(msg).toContain('next=timerAnnouncer.mode.shortBreak');
  });

  it('stays silent on manual mode switch while paused', () => {
    expect(
      getTimerAnnouncement(s({}), s({ mode: 'longBreak', timeLeft: 900 }), t),
    ).toBeNull();
  });

  it('announces every 5 minutes and at one minute only', () => {
    const tick = (from: number, to: number) =>
      getTimerAnnouncement(
        s({ isRunning: true, timeLeft: from }),
        s({ isRunning: true, timeLeft: to }),
        t,
      );
    expect(tick(1201, 1200)).toContain('timerAnnouncer.remaining');
    expect(tick(61, 60)).toBe('timerAnnouncer.oneMinute');
    expect(tick(1200, 1199)).toBeNull();
    expect(tick(30, 29)).toBeNull();
    expect(tick(1, 0)).toBeNull();
  });

  it('still announces milestones when a throttled tick skips the exact second', () => {
    const tick = (from: number, to: number) =>
      getTimerAnnouncement(
        s({ isRunning: true, timeLeft: from }),
        s({ isRunning: true, timeLeft: to }),
        t,
      );
    expect(tick(1203, 1197)).toBe('timerAnnouncer.remaining|time=timerAnnouncer.minutes|count=20');
    expect(tick(62, 58)).toBe('timerAnnouncer.oneMinute');
    // Large jump in a background tab: one announcement, not a burst
    expect(tick(1500, 590)).toBe('timerAnnouncer.remaining|time=timerAnnouncer.minutes|count=10');
  });

  it('stays silent on reset (time goes back up)', () => {
    expect(
      getTimerAnnouncement(
        s({ isRunning: true, timeLeft: 600 }),
        s({ isRunning: false, timeLeft: 1500 }),
        t,
      ),
    ).toBeNull();
  });

  it('does not repeat when time is unchanged', () => {
    const st = s({ isRunning: true, timeLeft: 300 });
    expect(getTimerAnnouncement(st, st, t)).toBeNull();
  });
});
