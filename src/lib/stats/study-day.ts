/**
 * Study days: statistics group sessions by the user's local day, and the day
 * starts at 04:00 local time so a late-night session (23:50 to 00:15) is not
 * split across two days. Pure and dependency free, so the server and the
 * browser share one definition. The SQL twin is in `study-day-sql.ts`.
 */

/** Local hour at which a study day begins. */
export const DAY_START_HOUR = 4;
export const DEFAULT_TIME_ZONE = 'UTC';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
// IANA names only (Area/Location, UTC, Etc/GMT+5). Rejects "+07:00" style offsets,
// which Intl accepts but Postgres reads with the opposite sign.
const IANA_SHAPE = /^[A-Za-z][A-Za-z0-9_]*(?:\/[A-Za-z0-9_+-]+)*$/;

export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || tz.length === 0 || tz.length > 64 || !IANA_SHAPE.test(tz)) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The zone itself when valid, otherwise UTC. */
export function resolveTimeZone(tz: string | null | undefined): string {
  return isValidTimeZone(tz) ? tz : DEFAULT_TIME_ZONE;
}

/** The viewer's IANA zone (`Intl`), UTC when the runtime cannot tell. */
export function getBrowserTimeZone(): string {
  try {
    return resolveTimeZone(new Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

// Keyed by the lowercased zone: `Intl` reads zone names case-insensitively and the zone comes from the
// client, so keying by the raw string would let one spelling per case combination fill the map.
const formatters = new Map<string, Intl.DateTimeFormat>();

/** Test helper: how many formatters are cached. */
export function formatterCacheSizeForTests(): number {
  return formatters.size;
}

/** The local wall clock at `ms` in `tz`, expressed as if that wall clock were UTC. */
function wallClockMs(ms: number, tz: string): number {
  const key = tz.toLowerCase();
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(key, formatter);
  }
  const part: Record<string, number> = {};
  for (const { type, value } of formatter.formatToParts(new Date(ms))) part[type] = Number(value);
  return Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute, part.second);
}

/** The instant whose local wall clock in `tz` reads `wallMs` (a wall clock written as UTC). */
function instantOfWallClock(wallMs: number, tz: string): number {
  let instant = wallMs - (wallClockMs(wallMs, tz) - wallMs);
  instant = wallMs - (wallClockMs(instant, tz) - instant); // second pass settles zones whose offset differs at the guess
  return instant;
}

/** `YYYY-MM-DD` study day of an instant in `tz` (invalid zone means UTC). */
export function studyDayOf(date: Date, tz: string): string {
  const wall = wallClockMs(date.getTime(), resolveTimeZone(tz));
  return new Date(wall - DAY_START_HOUR * HOUR_MS).toISOString().slice(0, 10);
}

/** The UTC instants `[start, end)` that make up study day `day` in `tz`. */
export function studyDayRange(day: string, tz: string): { start: Date; end: Date } {
  const zone = resolveTimeZone(tz);
  const [, y, m, d] = DAY_KEY.exec(day) ?? [];
  const startWall = Date.UTC(Number(y), Number(m) - 1, Number(d), DAY_START_HOUR);
  return {
    start: new Date(instantOfWallClock(startWall, zone)),
    end: new Date(instantOfWallClock(startWall + DAY_MS, zone)),
  };
}

export function addDays(day: string, count: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + count * DAY_MS).toISOString().slice(0, 10);
}

/** Inclusive list of day keys, at most `cap` long; empty when `last` is before `first`. */
export function eachDay(first: string, last: string, cap: number): string[] {
  const days: string[] = [];
  for (let day = first; day <= last && days.length < cap; day = addDays(day, 1)) days.push(day);
  return days;
}

/** The key when it is a real calendar day written as YYYY-MM-DD, otherwise null. */
export function parseDayParam(value: string | null | undefined): string | null {
  if (!value || !DAY_KEY.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value ? null : value;
}

/**
 * Today's study day as a local-midnight `Date`, for UI code that does calendar
 * math with date-fns in the viewer's own zone.
 */
export function studyTodayDate(tz: string = getBrowserTimeZone(), now: Date = new Date()): Date {
  const [y, m, d] = studyDayOf(now, tz).split('-').map(Number);
  return new Date(y, m - 1, d);
}
