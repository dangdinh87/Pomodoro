// Session recording guards — sessions feed streaks and the public leaderboard.
/** Timer settings allow at most 60 min per phase; 4h leaves room for future presets. */
export const SESSION_MAX_DURATION_SEC = 4 * 60 * 60;
/** A user cannot log more focus/break time than wall-clock time in a rolling day. */
export const SESSION_MAX_TOTAL_SEC_PER_DAY = 24 * 60 * 60;
