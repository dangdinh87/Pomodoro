import { gte, lt, type AnyColumn, type SQL } from 'drizzle-orm';
import { parseDayParam, resolveTimeZone, studyDayRange } from './study-day';

/**
 * Query string shared by the stats endpoints: `tz` (IANA zone, UTC when
 * missing or invalid) and `startDate` / `endDate` (inclusive study days,
 * YYYY-MM-DD). `from` / `to` are the matching UTC instants, `[from, to)`.
 */
export function parseStudyQuery(searchParams: URLSearchParams) {
  const tz = resolveTimeZone(searchParams.get('tz'));
  const startDay = parseDayParam(searchParams.get('startDate'));
  const endDay = parseDayParam(searchParams.get('endDate'));
  return {
    tz,
    startDay,
    endDay,
    from: startDay ? studyDayRange(startDay, tz).start : undefined,
    to: endDay ? studyDayRange(endDay, tz).end : undefined,
  };
}

/** WHERE conditions limiting `column` to `[from, to)`; either side may be open. */
export function windowConditions(column: AnyColumn, { from, to }: { from?: Date; to?: Date }): SQL[] {
  const conditions: SQL[] = [];
  if (from) conditions.push(gte(column, from));
  if (to) conditions.push(lt(column, to));
  return conditions;
}
