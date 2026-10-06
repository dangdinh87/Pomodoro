import { KEEP_STREAK_MINUTES, LINE_COUNTS, pickTomoMood, type TomoMoodInput } from './pick-tomo-mood';

/** Local wall-clock time (the picker reads the viewer's hour), 2026-10-05 unless said otherwise. */
const at = (hour: number, minute = 0, day = 5) => new Date(2026, 9, day, hour, minute);

const base: TomoMoodInput = {
  mode: 'work',
  isRunning: false,
  justCompleted: false,
  streak: 0,
  todayFocusMinutes: 0,
  now: at(10),
};
const pick = (patch: Partial<TomoMoodInput> = {}) => pickTomoMood({ ...base, ...patch });

/** "tomo.lines.breakTip.3" -> { situation: "breakTip", n: 3 } */
function parse(lineKey: string | null) {
  const match = /^tomo\.lines\.([A-Za-z]+)\.(\d+)$/.exec(lineKey ?? '');
  if (!match) throw new Error(`not a tomo line key: ${lineKey}`);
  return { situation: match[1], n: Number(match[2]) };
}

describe('pickTomoMood', () => {
  describe('1. just completed a focus session', () => {
    it('is party with a celebration title', () => {
      const mood = pick({ justCompleted: true });
      expect(mood.face).toBe('party');
      expect(parse(mood.lineKey).situation).toBe('celebration');
    });

    it('beats everything else, even a running focus at night with a streak at risk', () => {
      const mood = pick({ justCompleted: true, isRunning: true, mode: 'work', streak: 9, now: at(23, 30) });
      expect(mood.face).toBe('party');
    });

    it('beats a break that auto-started right after the session', () => {
      expect(pick({ justCompleted: true, mode: 'shortBreak', isRunning: true }).face).toBe('party');
    });
  });

  describe('2. focus is running', () => {
    it('is focus and says nothing', () => {
      expect(pick({ isRunning: true })).toEqual({ face: 'focus', lineKey: null });
    });

    it('stays silent whatever the hour or streak', () => {
      expect(pick({ isRunning: true, streak: 5, now: at(20) })).toEqual({ face: 'focus', lineKey: null });
      expect(pick({ isRunning: true, now: at(2) })).toEqual({ face: 'focus', lineKey: null });
    });

    it('a paused focus (not running) is not rule 2', () => {
      expect(pick({ isRunning: false }).face).toBe('happy');
    });
  });

  describe('3. break mode', () => {
    it.each(['shortBreak', 'longBreak'] as const)('%s is sleepy with a break tip', (mode) => {
      const mood = pick({ mode });
      expect(mood.face).toBe('sleepy');
      expect(parse(mood.lineKey).situation).toBe('breakTip');
    });

    it('applies while the break runs, too', () => {
      const mood = pick({ mode: 'shortBreak', isRunning: true });
      expect(mood.face).toBe('sleepy');
      expect(parse(mood.lineKey).situation).toBe('breakTip');
    });

    it('beats the streak nudge and the night nudge', () => {
      expect(parse(pick({ mode: 'shortBreak', streak: 4, now: at(20) }).lineKey).situation).toBe('breakTip');
      expect(parse(pick({ mode: 'longBreak', now: at(1) }).lineKey).situation).toBe('breakTip');
    });
  });

  describe('4. streak at risk', () => {
    const atRisk = { streak: 3, todayFocusMinutes: 0 };

    it('is worried with a keep-streak line', () => {
      const mood = pick({ ...atRisk, now: at(19) });
      expect(mood.face).toBe('worried');
      expect(parse(mood.lineKey).situation).toBe('keepStreak');
    });

    it('starts at exactly 18:00, not a minute before', () => {
      expect(pick({ ...atRisk, now: at(17, 59) }).face).toBe('happy');
      expect(pick({ ...atRisk, now: at(18, 0) }).face).toBe('worried');
    });

    it('needs a streak to protect', () => {
      expect(pick({ streak: 0, now: at(20) }).face).toBe('happy');
    });

    it('is calm once today has reached the keep-streak threshold', () => {
      expect(pick({ ...atRisk, todayFocusMinutes: KEEP_STREAK_MINUTES - 1, now: at(20) }).face).toBe('worried');
      expect(pick({ ...atRisk, todayFocusMinutes: KEEP_STREAK_MINUTES, now: at(20) }).face).toBe('happy');
      expect(pick({ ...atRisk, todayFocusMinutes: 50, now: at(20) }).face).toBe('happy');
    });

    it('still wins late in the evening over the sleep nudge', () => {
      expect(pick({ ...atRisk, now: at(23, 30) }).face).toBe('worried');
    });

    it('does not apply after midnight (before 18:00 on the clock)', () => {
      expect(pick({ ...atRisk, now: at(1) }).face).toBe('sleepy');
    });
  });

  describe('5. late night', () => {
    it('is sleepy with a sleep nudge from 23:00', () => {
      const mood = pick({ now: at(23, 0) });
      expect(mood.face).toBe('sleepy');
      expect(parse(mood.lineKey).situation).toBe('sleep');
    });

    it('22:59 is still evening', () => {
      const mood = pick({ now: at(22, 59) });
      expect(mood.face).toBe('happy');
      expect(parse(mood.lineKey).situation).toBe('greetingEvening');
    });

    it('stays sleepy until 03:59 and wakes at exactly 04:00', () => {
      expect(parse(pick({ now: at(0, 0) }).lineKey).situation).toBe('sleep');
      expect(parse(pick({ now: at(3, 59) }).lineKey).situation).toBe('sleep');
      const morning = pick({ now: at(4, 0) });
      expect(morning.face).toBe('happy');
      expect(parse(morning.lineKey).situation).toBe('greetingMorning');
    });
  });

  describe('6. greetings by time of day', () => {
    it.each([
      [4, 'greetingMorning'],
      [11, 'greetingMorning'],
      [12, 'greetingAfternoon'],
      [17, 'greetingAfternoon'],
      [18, 'greetingEvening'],
      [22, 'greetingEvening'],
    ])('%i:00 greets with %s', (hour, situation) => {
      const mood = pick({ now: at(hour, 30) });
      expect(mood.face).toBe('happy');
      expect(parse(mood.lineKey).situation).toBe(situation);
    });

    it('evening with a safe streak is a plain greeting', () => {
      const mood = pick({ streak: 7, todayFocusMinutes: 25, now: at(20) });
      expect(mood.face).toBe('happy');
      expect(parse(mood.lineKey).situation).toBe('greetingEvening');
    });
  });

  describe('line rotation', () => {
    it('always names a line that exists (1..count) for every situation', () => {
      const samples = [
        pick({ justCompleted: true }),
        pick({ mode: 'shortBreak' }),
        pick({ streak: 2, now: at(20) }),
        pick({ now: at(1) }),
        pick({ now: at(9) }),
        pick({ now: at(14) }),
        pick({ now: at(20) }),
      ];
      for (const { lineKey } of samples) {
        const { situation, n } = parse(lineKey);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(LINE_COUNTS[situation as keyof typeof LINE_COUNTS]);
      }
    });

    it('keeps the same line all day', () => {
      const first = pick({ now: at(9, 0) }).lineKey;
      expect(pick({ now: at(9, 45) }).lineKey).toBe(first);
      expect(pick({ now: at(11, 59) }).lineKey).toBe(first);
    });

    it('moves to another line the next day and cycles through every variant', () => {
      const count = LINE_COUNTS.greetingMorning;
      const keys = Array.from({ length: count }, (_, d) => pick({ now: at(9, 0, 5 + d) }).lineKey);
      expect(new Set(keys).size).toBe(count);
      expect(pick({ now: at(9, 0, 5 + count) }).lineKey).toBe(keys[0]);
    });

    it('counts the day from 04:00: 01:00 is still the previous day', () => {
      const lateNight = pick({ now: at(1, 0, 6) }).lineKey; // sleep line of study day Oct 5
      const sameStudyDay = pick({ now: at(23, 30, 5) }).lineKey;
      expect(lateNight).toBe(sameStudyDay);
    });

    it('has 3 to 4 variants for every situation', () => {
      for (const count of Object.values(LINE_COUNTS)) {
        expect(count).toBeGreaterThanOrEqual(3);
        expect(count).toBeLessThanOrEqual(4);
      }
    });
  });
});
