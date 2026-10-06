/** Error code of the per-address limit on sign-in codes (src/lib/auth/otp-limits.ts); the login form reads it. */
export const OTP_EMAIL_RATE_LIMITED = 'OTP_EMAIL_RATE_LIMITED';

/** Error code (HTTP 400) when the address is malformed: Better Auth's own, and the same one our limiter throws for an address too long to exist. */
export const OTP_INVALID_EMAIL = 'INVALID_EMAIL';
