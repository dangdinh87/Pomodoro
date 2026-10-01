export const DEFAULT_CHAT_AI_MODEL = "moonshotai/kimi-k2-instruct-0905";

export const ALLOWED_CHAT_MODELS = [DEFAULT_CHAT_AI_MODEL];

// Chat cost guards — every request is forwarded to a paid LLM.
/** Max user messages per user per rolling hour (counted from persisted messages). */
export const CHAT_MAX_USER_MESSAGES_PER_HOUR = 30;
/** Only the most recent N messages of the thread are sent upstream. */
export const CHAT_MAX_HISTORY_MESSAGES = 20;
/** User messages are truncated to this many characters before going upstream. */
export const CHAT_MAX_MESSAGE_CHARS = 4000;
/** Assistant replies (up to CHAT_MAX_OUTPUT_TOKENS ≈ 8k chars) get a larger cap. */
export const CHAT_MAX_ASSISTANT_MESSAGE_CHARS = 8000;
/** Total characters of history sent upstream; oldest messages are dropped first. */
export const CHAT_MAX_HISTORY_CHARS = 24000;
/** Upper bound on generated tokens per reply. */
export const CHAT_MAX_OUTPUT_TOKENS = 2048;

// Session recording guards — sessions feed streaks and the public leaderboard.
/** Timer settings allow at most 60 min per phase; 4h leaves room for future presets. */
export const SESSION_MAX_DURATION_SEC = 4 * 60 * 60;
/** A user cannot log more focus/break time than wall-clock time in a rolling day. */
export const SESSION_MAX_TOTAL_SEC_PER_DAY = 24 * 60 * 60;
