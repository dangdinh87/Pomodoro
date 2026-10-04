/**
 * Limits on emailing sign-in codes, so nobody can use the form to flood an inbox or burn the
 * Resend quota. Two layers:
 *  - per IP: Better Auth's own rate limiter (`otpSendIpRateRules`), 3 per 10 minutes;
 *  - per email address: `otpEmailLimitHook`, 7 per 10 minutes, whoever asks.
 *
 * The address limit is a shared budget, so somebody who only knows an address can spend it and
 * lock its owner out of email sign-in. It is kept short (one fixed 10 minute window) and set above
 * what one IP can spend: an IP gets 3 codes per window, and its window can straddle ours, so up
 * to 6 in ours; 7 means one network alone can never exhaust an address, it takes several for as
 * long as the attack lasts. The login form tells the person that it is this address that is
 * limited (not them), and Google sign-in keeps working.
 *
 * Every route that mails a code is covered (`OTP_RECIPIENT_FIELD`), and they all draw on the same
 * budget per address. The address is trimmed, lowercased and capped at 254 characters (the longest
 * that can exist) before it becomes a key in memory.
 *
 * The per-email check is a `hooks.before` rule rather than a check inside `sendOtpEmail` on purpose:
 * Better Auth runs `sendVerificationOTP` through `runInBackgroundOrAwait`, which logs and swallows
 * whatever it throws, so the browser would see a success. A hook runs before the code is created
 * and its APIError reaches the client as HTTP 429 with a `code`.
 *
 * Both counters live in memory of one server instance (same limitation as the other limiters in
 * this app, see src/lib/api/in-memory-rate-limiter.ts): with several warm instances the real
 * ceiling is a small multiple. Add a Vercel Firewall rate-limit rule on this path for a hard cap.
 */
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { consumeRateLimit } from '@/lib/api/in-memory-rate-limiter';
import { OTP_EMAIL_RATE_LIMITED } from './otp-error-codes';

export { OTP_EMAIL_RATE_LIMITED };
export const OTP_SEND_PATH = '/email-otp/send-verification-otp';

/** Every Better Auth route that mails a code (emailOTP plugin), and the body field naming the recipient. */
const OTP_RECIPIENT_FIELD: Record<string, 'email' | 'newEmail'> = {
  [OTP_SEND_PATH]: 'email',
  '/email-otp/request-password-reset': 'email',
  // Deprecated, but still registered by the plugin: it mails an existing address just the same
  '/forget-password/email-otp': 'email',
  // Mails the NEW address; answers 400 unless `changeEmail` is enabled, guarded for the day it is
  '/email-otp/request-email-change': 'newEmail',
};
const OTP_PATHS = Object.keys(OTP_RECIPIENT_FIELD);

const WINDOW_SEC = 10 * 60;
/** Codes one IP may request per window (Better Auth rule below). */
const MAX_CODES_PER_IP = 3;
/** Codes one address may receive per window: above what a single IP can spend, even straddling two windows. */
const MAX_CODES_PER_EMAIL = 2 * MAX_CODES_PER_IP + 1;
/** Longest email address that can exist (RFC 5321 path limit). */
const MAX_EMAIL_LENGTH = 254;

/** Better Auth `rateLimit.customRules`: window in seconds, per client IP. */
export const otpSendIpRateRules = Object.fromEntries(
  OTP_PATHS.map((path) => [path, { window: WINDOW_SEC, max: MAX_CODES_PER_IP }]),
);

/** The address a request to `path` would mail a code to, as sent (untrusted); undefined for other routes. */
export function otpRecipient(path: string, body: unknown): unknown {
  const field = OTP_RECIPIENT_FIELD[path];
  if (!field || !body || typeof body !== 'object') return undefined;
  return (body as Record<string, unknown>)[field];
}

const invalidEmail = () => new APIError('BAD_REQUEST', { code: 'INVALID_EMAIL', message: 'Invalid email' });

/**
 * Throws an HTTP 429 APIError when this address already received its share of codes in the last
 * 10 minutes, and an HTTP 400 for an address too long to exist (nothing is counted or kept for it).
 */
export function assertOtpEmailAllowed(email: unknown, now: number = Date.now()): void {
  if (typeof email !== 'string') return; // Better Auth rejects it with a proper validation error
  const address = email.trim().toLowerCase();
  if (address.length > MAX_EMAIL_LENGTH) throw invalidEmail();
  if (!address) return;
  const result = consumeRateLimit(`otp-email:${address}`, MAX_CODES_PER_EMAIL, WINDOW_SEC * 1000, now);
  if (result.allowed) return;
  throw new APIError(
    'TOO_MANY_REQUESTS',
    { code: OTP_EMAIL_RATE_LIMITED, message: 'Too many sign-in codes requested for this email. Try again later.' },
    { 'X-Retry-After': String(result.retryAfterSec) },
  );
}

export const otpEmailLimitHook = createAuthMiddleware(async (ctx) => {
  if (!OTP_PATHS.includes(ctx.path)) return;
  assertOtpEmailAllowed(otpRecipient(ctx.path, ctx.body));
});
