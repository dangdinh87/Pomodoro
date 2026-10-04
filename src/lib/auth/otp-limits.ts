/**
 * Limits on emailing sign-in codes, so nobody can use the form to flood an inbox or burn the
 * Resend quota. Two layers:
 *  - per IP: Better Auth's own rate limiter (`otpSendIpRateRules`), 3 per 10 minutes;
 *  - per email address: `otpEmailLimitHook`, 3 per 10 minutes, whoever asks.
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

export const OTP_SEND_PATH = '/email-otp/send-verification-otp';
/** Also mails a code to an existing address, so it gets the same limits. */
const OTP_RESET_PATH = '/email-otp/request-password-reset';
const OTP_PATHS: readonly string[] = [OTP_SEND_PATH, OTP_RESET_PATH];

export const OTP_EMAIL_RATE_LIMITED = 'OTP_EMAIL_RATE_LIMITED';

const WINDOW_SEC = 10 * 60;
const MAX_CODES = 3;

/** Better Auth `rateLimit.customRules`: window in seconds, per client IP. */
export const otpSendIpRateRules = Object.fromEntries(
  OTP_PATHS.map((path) => [path, { window: WINDOW_SEC, max: MAX_CODES }]),
);

/** Throws an HTTP 429 APIError when this address already received 3 codes in the last 10 minutes. */
export function assertOtpEmailAllowed(email: unknown, now: number = Date.now()): void {
  if (typeof email !== 'string') return; // Better Auth rejects it with a proper validation error
  const result = consumeRateLimit(`otp-email:${email.trim().toLowerCase()}`, MAX_CODES, WINDOW_SEC * 1000, now);
  if (result.allowed) return;
  throw new APIError(
    'TOO_MANY_REQUESTS',
    { code: OTP_EMAIL_RATE_LIMITED, message: 'Too many sign-in codes requested for this email. Try again later.' },
    { 'X-Retry-After': String(result.retryAfterSec) },
  );
}

export const otpEmailLimitHook = createAuthMiddleware(async (ctx) => {
  if (!OTP_PATHS.includes(ctx.path)) return;
  assertOtpEmailAllowed((ctx.body as { email?: unknown } | undefined)?.email);
});
