import {
  addDays,
  eachDay,
  getBrowserTimeZone,
  isValidTimeZone,
  parseDayParam,
  resolveTimeZone,
  studyDayOf,
  studyDayRange,
  studyTodayDate,
} from './study-day';

const VN = 'Asia/Ho_Chi_Minh';
const NY = 'America/New_York';
// Vietnam is UTC+7 all year, so a VN wall clock time is `utc - 7h`.
const vn = (iso: string) => new Date(`${iso}+07:00`);

describe('isValidTimeZone / resolveTimeZone', () => {
  it('accepts IANA zones', () => {
    for (const tz of [VN, NY, 'UTC', 'Europe/London', 'Asia/Kolkata', 'Etc/GMT+5']) {
      expect(isValidTimeZone(tz)).toBe(true);
    }
  });

  it('rejects garbage, offsets and non-strings', () => {
    for (const tz of ['', 'Mars/Olympus', 'GMT+7x', '+07:00', '-05:00', '7', "UTC'; drop table", 'a'.repeat(100), null, undefined, 42]) {
      expect(isValidTimeZone(tz)).toBe(false);
    }
  });

  it('falls back to UTC for invalid or missing zones', () => {
    expect(resolveTimeZone(VN)).toBe(VN);
    expect(resolveTimeZone('Mars/Olympus')).toBe('UTC');
    expect(resolveTimeZone(null)).toBe('UTC');
    expect(resolveTimeZone(undefined)).toBe('UTC');
    expect(resolveTimeZone('')).toBe('UTC');
  });

  it('reads the browser zone and always yields a valid one', () => {
    expect(isValidTimeZone(getBrowserTimeZone())).toBe(true);
  });
});

describe('studyDayOf', () => {
  it('starts the day at 04:00 local time', () => {
    expect(studyDayOf(vn('2026-10-05T03:59:59'), VN)).toBe('2026-10-04');
    expect(studyDayOf(vn('2026-10-05T04:00:00'), VN)).toBe('2026-10-05');
  });

  it('keeps a 23:50 to 00:15 session on the earlier study day', () => {
    expect(studyDayOf(vn('2026-10-04T23:50:00'), VN)).toBe('2026-10-04');
    expect(studyDayOf(vn('2026-10-05T00:15:00'), VN)).toBe('2026-10-04');
    expect(studyDayOf(vn('2026-10-05T00:31:00'), VN)).toBe('2026-10-04');
  });

  it('counts a 09:00 local session on the same calendar day', () => {
    expect(studyDayOf(vn('2026-10-05T09:00:00'), VN)).toBe('2026-10-05');
  });

  it('crosses month and year boundaries', () => {
    expect(studyDayOf(vn('2027-01-01T02:00:00'), VN)).toBe('2026-12-31');
    expect(studyDayOf(vn('2026-03-01T01:00:00'), VN)).toBe('2026-02-28');
  });

  it('uses the zone, not UTC', () => {
    const instant = new Date('2026-10-04T17:31:00Z'); // 00:31 on the 5th in VN, 13:31 on the 4th in New York
    expect(studyDayOf(instant, VN)).toBe('2026-10-04');
    expect(studyDayOf(instant, NY)).toBe('2026-10-04');
    expect(studyDayOf(new Date('2026-10-05T02:00:00Z'), VN)).toBe('2026-10-05'); // 09:00 VN
    expect(studyDayOf(new Date('2026-10-05T02:00:00Z'), 'UTC')).toBe('2026-10-04'); // 02:00 UTC
  });

  it('follows the wall clock across a DST change (New York, 2026-03-08 spring forward)', () => {
    // 03:30 EDT (UTC-4) on the 8th is 07:30Z. Wall clock 03:30 < 04:00, so still the 7th.
    expect(studyDayOf(new Date('2026-03-08T07:30:00Z'), NY)).toBe('2026-03-07');
    // 04:00 EDT is 08:00Z: the 8th starts.
    expect(studyDayOf(new Date('2026-03-08T08:00:00Z'), NY)).toBe('2026-03-08');
    // 03:59 EST (UTC-5) on the 7th is 08:59Z and 04:00 EST is 09:00Z: no jump there.
    expect(studyDayOf(new Date('2026-03-07T08:59:00Z'), NY)).toBe('2026-03-06');
    expect(studyDayOf(new Date('2026-03-07T09:00:00Z'), NY)).toBe('2026-03-07');
  });

  it('follows the wall clock across a DST change (New York, 2026-11-01 fall back)', () => {
    // 01:30 occurs twice on the 1st (05:30Z EDT and 06:30Z EST); both are before 04:00.
    expect(studyDayOf(new Date('2026-11-01T05:30:00Z'), NY)).toBe('2026-10-31');
    expect(studyDayOf(new Date('2026-11-01T06:30:00Z'), NY)).toBe('2026-10-31');
    // 04:00 EST is 09:00Z.
    expect(studyDayOf(new Date('2026-11-01T08:59:00Z'), NY)).toBe('2026-10-31');
    expect(studyDayOf(new Date('2026-11-01T09:00:00Z'), NY)).toBe('2026-11-01');
  });

  it('treats an invalid zone as UTC', () => {
    const instant = new Date('2026-10-05T03:59:00Z');
    expect(studyDayOf(instant, 'nope')).toBe(studyDayOf(instant, 'UTC'));
    expect(studyDayOf(instant, 'UTC')).toBe('2026-10-04');
  });
});

describe('studyDayRange', () => {
  it('spans 04:00 to the next 04:00 local time', () => {
    const { start, end } = studyDayRange('2026-10-05', VN);
    expect(start.toISOString()).toBe('2026-10-04T21:00:00.000Z');
    expect(end.toISOString()).toBe('2026-10-05T21:00:00.000Z');
  });

  it('is consistent with studyDayOf at both edges', () => {
    for (const tz of [VN, NY, 'UTC', 'Europe/London', 'Australia/Lord_Howe']) {
      const { start, end } = studyDayRange('2026-10-05', tz);
      expect(studyDayOf(start, tz)).toBe('2026-10-05');
      expect(studyDayOf(new Date(start.getTime() - 1), tz)).toBe('2026-10-04');
      expect(studyDayOf(new Date(end.getTime() - 1), tz)).toBe('2026-10-05');
      expect(studyDayOf(end, tz)).toBe('2026-10-06');
    }
  });

  it('puts the DST change inside the study day it belongs to (New York)', () => {
    const spring = studyDayRange('2026-03-07', NY); // contains the 02:00 -> 03:00 jump on the 8th
    expect((spring.end.getTime() - spring.start.getTime()) / 3_600_000).toBe(23);
    const fall = studyDayRange('2026-10-31', NY); // contains the 02:00 -> 01:00 fall back on Nov 1
    expect((fall.end.getTime() - fall.start.getTime()) / 3_600_000).toBe(25);
  });

  it('treats an invalid zone as UTC', () => {
    expect(studyDayRange('2026-10-05', 'nope').start.toISOString()).toBe('2026-10-05T04:00:00.000Z');
  });
});

describe('day helpers', () => {
  it('adds days across months and years', () => {
    expect(addDays('2026-02-27', 2)).toBe('2026-03-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-10-05', 0)).toBe('2026-10-05');
  });

  it('lists days inclusively and caps the length', () => {
    expect(eachDay('2026-09-29', '2026-10-02', 366)).toEqual(['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02']);
    expect(eachDay('2026-10-02', '2026-09-29', 366)).toEqual([]);
    expect(eachDay('2026-01-01', '2026-12-31', 10)).toHaveLength(10);
  });

  it('parses only real calendar days', () => {
    expect(parseDayParam('2026-10-05')).toBe('2026-10-05');
    expect(parseDayParam('2026-02-30')).toBeNull();
    expect(parseDayParam('2026-1-5')).toBeNull();
    expect(parseDayParam('')).toBeNull();
    expect(parseDayParam(null)).toBeNull();
  });
});

describe('studyTodayDate', () => {
  it('returns local midnight of the current study day', () => {
    const today = studyTodayDate(VN, vn('2026-10-05T02:00:00'));
    expect([today.getFullYear(), today.getMonth(), today.getDate(), today.getHours()]).toEqual([2026, 9, 4, 0]);
  });
});
