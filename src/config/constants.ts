// Session recording guards — sessions feed streaks and stats.
/** Timer settings allow at most 60 min per phase; 4h leaves room for future presets. */
export const SESSION_MAX_DURATION_SEC = 4 * 60 * 60;
/** A user cannot log more focus/break time than wall-clock time in a rolling day. */
export const SESSION_MAX_TOTAL_SEC_PER_DAY = 24 * 60 * 60;
/** `code` of the 429 answer to a session over that total, so the client can tell it from a firewall's 429. */
export const SESSION_LIMIT_CODE = 'DAILY_SESSION_LIMIT';
