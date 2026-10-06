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
  otpRecipient,
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
  it('lets 7 codes per email through in 10 minutes, then answers 429 with a typed code', () => {
    const now = Date.UTC(2026, 9, 5);
    for (let i = 0; i < 7; i++) expect(() => assertOtpEmailAllowed('a@example.com', now + i)).not.toThrow();

    const error = catchApiError(() => assertOtpEmailAllowed('a@example.com', now + 1000));
    expect(error).toBeInstanceOf(APIError);
    expect(error.statusCode).toBe(429);
    expect(error.body).toMatchObject({ code: OTP_EMAIL_RATE_LIMITED });
  });

  it('treats case and surrounding spaces as the same address, and other addresses as separate', () => {
    for (let i = 0; i < 7; i++) assertOtpEmailAllowed('Mixed@Example.com', 0);
    expect(() => assertOtpEmailAllowed(' mixed@example.com ', 1)).toThrow();
    expect(() => assertOtpEmailAllowed('other@example.com', 1)).not.toThrow();
  });

  it('frees the address once the 10 minute window is over', () => {
    for (let i = 0; i < 7; i++) assertOtpEmailAllowed('a@example.com', 0);
    expect(() => assertOtpEmailAllowed('a@example.com', 10 * 60 * 1000 + 1)).not.toThrow();
  });

  it('leaves malformed input to Better Auth validation', () => {
    for (let i = 0; i < 10; i++) expect(() => assertOtpEmailAllowed(undefined)).not.toThrow();
    expect(() => assertOtpEmailAllowed(42)).not.toThrow();
    for (let i = 0; i < 10; i++) expect(() => assertOtpEmailAllowed('   ')).not.toThrow();
  });

  describe('address length (the address becomes a key held in memory)', () => {
    const local = (length: number) => `${'a'.repeat(length - '@example.com'.length)}@example.com`;

    it('accepts the longest address that can exist (254 characters), even padded with spaces', () => {
      expect(() => assertOtpEmailAllowed(local(254), 0)).not.toThrow();
      expect(() => assertOtpEmailAllowed(`  ${local(254)}  `, 1)).not.toThrow();
    });

    it('refuses a longer one as an invalid email, before the limiter ever sees it', () => {
      for (let i = 0; i < 20; i++) {
        const error = catchApiError(() => assertOtpEmailAllowed(local(255 + i), 0));
        expect(error.statusCode).toBe(400);
        expect(error.body).toMatchObject({ code: 'INVALID_EMAIL' });
      }
      // never 429: nothing was counted
      expect(catchApiError(() => assertOtpEmailAllowed(local(300), 0)).statusCode).toBe(400);
    });

    it('does not even look at a megabyte of garbage', () => {
      const error = catchApiError(() => assertOtpEmailAllowed('x'.repeat(2_000_000), 0));
      expect(error.statusCode).toBe(400);
    });
  });
});

describe('otpRecipient: whose inbox the code goes to', () => {
  it('is `email` for the sign-in, password-reset and deprecated forget-password routes', () => {
    for (const path of [OTP_SEND_PATH, '/email-otp/request-password-reset', '/forget-password/email-otp']) {
      expect(otpRecipient(path, { email: 'a@example.com' })).toBe('a@example.com');
    }
  });

  it('is `newEmail` for the email-change request, which mails the new address', () => {
    expect(otpRecipient('/email-otp/request-email-change', { newEmail: 'new@example.com', email: 'ignored@example.com' })).toBe('new@example.com');
  });

  it('is undefined for any other route or a missing body', () => {
    expect(otpRecipient('/sign-in/email-otp', { email: 'a@example.com' })).toBeUndefined();
    expect(otpRecipient(OTP_SEND_PATH, undefined)).toBeUndefined();
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

  it('sends 7 codes to one address, then refuses the 8th with the typed error and sends nothing', async () => {
    // 3 per IP: three IPs are needed to reach the address limit
    for (let i = 0; i < 7; i++) expect((await requestCode('one@example.com', `10.0.${Math.floor(i / 3)}.${i + 1}`)).status).toBe(200);
    expect(sendVerificationOTP).toHaveBeenCalledTimes(7);

    const refused = await requestCode('one@example.com', '10.0.9.9');
    expect(refused.status).toBe(429);
    expect(await refused.json()).toMatchObject({ code: OTP_EMAIL_RATE_LIMITED });
    expect(sendVerificationOTP).toHaveBeenCalledTimes(7);
  });

  it('one IP alone cannot lock an address out: the owner still gets a code from another network', async () => {
    for (let i = 0; i < 3; i++) expect((await requestCode('victim@example.com', '203.0.113.1')).status).toBe(200);
    expect((await requestCode('victim@example.com', '203.0.113.1')).status).toBe(429); // the attacker is stopped by the IP rule

    sendVerificationOTP.mockClear();
    expect((await requestCode('victim@example.com', '198.51.100.7')).status).toBe(200); // the owner is not
    expect(sendVerificationOTP).toHaveBeenCalledTimes(1);
  });

  it('guards the deprecated forget-password route and shares the address budget with the others', async () => {
    const forgetPassword = (email: string, ip: string) =>
      auth.handler(
        new Request('http://localhost:3000/api/auth/forget-password/email-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip, origin: 'http://localhost:3000' },
          body: JSON.stringify({ email }),
        }),
      );
    // 4 through the main route + 3 through the deprecated one = 7 for one address
    for (let i = 0; i < 4; i++) await requestCode('shared@example.com', `10.2.${i}.1`);
    for (let i = 0; i < 3; i++) expect((await forgetPassword('shared@example.com', `10.3.${i}.1`)).status).toBe(200);

    const refused = await forgetPassword('shared@example.com', '10.4.0.1');
    expect(refused.status).toBe(429);
    expect(await refused.json()).toMatchObject({ code: OTP_EMAIL_RATE_LIMITED });

    // and the per-IP rule applies to it as well
    for (let i = 0; i < 3; i++) await forgetPassword(`ipcap${i}@example.com`, '10.5.0.1');
    const ipLimited = await forgetPassword('ipcap9@example.com', '10.5.0.1');
    expect(ipLimited.status).toBe(429);
    expect(await ipLimited.json()).not.toMatchObject({ code: OTP_EMAIL_RATE_LIMITED });
  });

  it('guards the email-change request too (it mails the new address)', async () => {
    const changeEmail = (newEmail: string, ip: string) =>
      auth.handler(
        new Request('http://localhost:3000/api/auth/email-otp/request-email-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip, origin: 'http://localhost:3000' },
          body: JSON.stringify({ newEmail }),
        }),
      );
    for (let i = 0; i < 7; i++) {
      const res = await changeEmail('new@example.com', `10.6.${Math.floor(i / 3)}.${i + 1}`);
      expect(res.status).not.toBe(429); // answered by the endpoint (no session), not by the limiter
    }
    expect((await changeEmail('new@example.com', '10.6.9.9')).status).toBe(429);
  });

  it('answers an oversized address with 400, not a hang or a 429', async () => {
    const res = await requestCode(`${'a'.repeat(300)}@example.com`, '10.7.0.1');
    expect(res.status).toBe(400);
    expect(sendVerificationOTP).not.toHaveBeenCalled();
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
