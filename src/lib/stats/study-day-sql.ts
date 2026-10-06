import { sql, type AnyColumn, type SQL } from 'drizzle-orm';
import { DAY_START_HOUR } from './study-day';

/**
 * `YYYY-MM-DD` study day of a timestamptz column in zone `tz` (the SQL twin of
 * `studyDayOf`). `tz` is a bound parameter, never interpolated.
 *
 * Postgres numbers each bound value, so repeating this expression in `select`
 * and `groupBy` yields two different parameters and fails with "must appear in
 * the GROUP BY clause". Group by output column position instead, e.g.
 * `.select({ day: studyDaySql(col, tz), ... }).groupBy(sql`1`)`.
 */
export const studyDaySql = (column: AnyColumn | SQL, tz: string): SQL<string> =>
  sql<string>`to_char((${column} at time zone ${tz}) - ${sql.raw(`interval '${DAY_START_HOUR} hours'`)}, 'YYYY-MM-DD')`;
