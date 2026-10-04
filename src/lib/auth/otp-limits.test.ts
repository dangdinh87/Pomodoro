/** @vitest-environment node */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { emailOTP } from 'better-auth/plugins';
import * as schema from '@/db/schema';
import { resetRateLimitsForTests } from '@/lib/api/in-memory-rate-limiter';
import { createTestDb, type TestDb } from '@/test-utils/test-db';
import {
  OTP_EMAIL_RATE_LIMITED,
  OTP_SEND_PATH,
  assertOtpEmailAllowed,
  otpEmailLimitHook,
  otpSendIpRateRules,
} from './otp-limits';

beforeEach(() => resetRateLimitsForTests());

const catchApiError = (fn: () => void) => {
  try {
    fn();
  } catch (error) {
    return error as APIError;
  }
  throw new Error('expected an APIError');
};

describe('assertOtpEmailAllowed', () => {
  it('lets 3 codes per email through in 10 minutes, then answers 429 with a typed code', () => {
    const now = Date.UTC(2026, 9, 5);
    for (let i = 0; i < 3; i++) expect(() => assertOtpEmailAllowed('a@example.com', now + i)).not.toThrow();

    const error = catchApiError(() => assertOtpEmailAllowed('a@example.com', now + 1000));
    expect(error).toBeInstanceOf(APIError);
    expect(error.statusCode).toBe(429);
    expect(error.body).toMatchObject({ code: OTP_EMAIL_RATE_LIMITED });
  });

  it('treats case and surrounding spaces as the same address, and other addresses as separate', () => {
    for (let i = 0; i < 3; i++) assertOtpEmailAllowed('Mixed@Example.com', 0);
    expect(() => assertOtpEmailAllowed(' mixed@example.com ', 1)).toThrow();
    expect(() => assertOtpEmailAllowed('other@example.com', 1)).not.toThrow();
  });

  it('frees the address once the 10 minute window is over', () => {
    for (let i = 0; i < 3; i++) assertOtpEmailAllowed('a@example.com', 0);
    expect(() => assertOtpEmailAllowed('a@example.com', 10 * 60 * 1000 + 1)).not.toThrow();
  });

  it('leaves malformed input to Better Auth validation', () => {
    for (let i = 0; i < 10; i++) expect(() => assertOtpEmailAllowed(undefined)).not.toThrow();
    expect(() => assertOtpEmailAllowed(42)).not.toThrow();
  });
});

describe('wired into Better Auth', () => {
  let db: TestDb;
  const sendVerificationOTP = vi.fn().mockResolvedValue(undefined);
  let auth: ReturnType<typeof makeAuth>;

  function makeAuth(database: TestDb) {
    return betterAuth({
      database: drizzleAdapter(database, { provider: 'pg', schema }),
      secret: 'test-secret-test-secret-test-secret-0123456789',
      baseURL: 'http://localhost:3000',
      // Same pieces src/lib/auth.ts uses
      rateLimit: { enabled: true, storage: 'memory', customRules: otpSendIpRateRules },
      hooks: { before: otpEmailLimitHook },
      plugins: [emailOTP({ storeOTP: 'hashed', sendVerificationOTP })],
    });
  }

  beforeAll(async () => {
    db = await createTestDb();
    auth = makeAuth(db);
  });
  beforeEach(() => sendVerificationOTP.mockClear());

  const requestCode = (email: string, ip: string) =>
    auth.handler(
      new Request(`http://localhost:3000/api/auth${OTP_SEND_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip, origin: 'http://localhost:3000' },
        body: JSON.stringify({ email, type: 'sign-in' }),
      }),
    );

  it('sends 3 codes to one address, then refuses the 4th with the typed error and sends nothing', async () => {
    for (let i = 0; i < 3; i++) expect((await requestCode('one@example.com', `10.0.0.${i + 1}`)).status).toBe(200);
    expect(sendVerificationOTP).toHaveBeenCalledTimes(3);

    const refused = await requestCode('one@example.com', '10.0.0.9');
    expect(refused.status).toBe(429);
    expect(await refused.json()).toMatchObject({ code: OTP_EMAIL_RATE_LIMITED });
    expect(sendVerificationOTP).toHaveBeenCalledTimes(3);
  });

  it('limits one IP to 3 code requests in 10 minutes, whatever the addresses', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      for (let i = 0; i < 3; i++) expect((await requestCode(`ip${i}@example.com`, '10.1.0.1')).status).toBe(200);

      // Past Better Auth's default 60 s window, inside our 10 minute one: only the custom rule still refuses.
      vi.setSystemTime(Date.now() + 2 * 60 * 1000);
      const refused = await requestCode('ip3@example.com', '10.1.0.1');
      expect(refused.status).toBe(429);
      expect(sendVerificationOTP).toHaveBeenCalledTimes(3);

      vi.setSystemTime(Date.now() + 9 * 60 * 1000);
      expect((await requestCode('ip4@example.com', '10.1.0.1')).status).toBe(200);
    } finally {
      vi.useRealTimers();
    }
  });
});
