/**
 * Feedback constants shared by the API, the database schema and the browser form. Plain values on
 * purpose: the form imports this file, so it must never import the schema (drizzle) itself.
 */
export const FEEDBACK_TYPES = ['feature', 'bug', 'question', 'other'] as const;

export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000;
