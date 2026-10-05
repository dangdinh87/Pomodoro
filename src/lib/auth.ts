import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { anonymous, emailOTP } from 'better-auth/plugins';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { sendOtpEmail } from '@/lib/email/send-otp-email';
import { moveGuestData } from '@/lib/auth/move-guest-data';
import { otpEmailLimitHook, otpSendIpRateRules } from '@/lib/auth/otp-limits';
import { authBaseURL } from '@/lib/auth/base-url';
import { getGoogleCredentials } from '@/lib/auth/providers';
import { buildServerErrorReport } from '@/lib/observability/error-reporter';
import { scheduleReport } from '@/lib/observability/schedule-report';

const google = getGoogleCredentials();

export const auth = betterAuth({
  // BETTER_AUTH_URL, else the site origin (or this deployment's own host); from the request in `next dev`
  baseURL: authBaseURL(),
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  socialProviders: google ? { google } : {},
  session: {
    expiresIn: 60 * 60 * 24 * 60,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // In memory, per server instance: the limiter checks every auth request
  // (get-session included), and a database store would turn each page load
  // into a write. Fluid compute reuses instances, so the limits still bite.
  rateLimit: {
    enabled: true,
    storage: 'memory',
    // Every guest sign-in creates a user row, and a guest's first session is
    // recorded through one. Generous on purpose: a school or dorm shares one
    // IP (NAT) between many first-time visitors.
    customRules: {
      '/sign-in/anonymous': { window: 10 * 60, max: 30 },
      // Sign-in codes cost an email each: 3 per 10 minutes per IP (the per-address limit is the hook below)
      ...otpSendIpRateRules,
    },
  },
  hooks: { before: otpEmailLimitHook },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60,
      storeOTP: 'hashed',
      sendVerificationOTP: async ({ email, otp }) => {
        try {
          await sendOtpEmail(email, otp);
        } catch (error) {
          // Better Auth logs and swallows what this throws; report it so a broken Resend setup is not silent.
          const report = buildServerErrorReport(error);
          scheduleReport({ ...report, message: `Sending the sign-in code failed: ${report.message}` });
          throw error;
        }
      },
    }),
    // Guests get a session lazily on their first write; signing in later
    // re-homes their data onto the real account before the guest row is dropped.
    anonymous({
      onLinkAccount: ({ anonymousUser, newUser }) =>
        moveGuestData(anonymousUser.user.id, newUser.user.id),
    }),
    nextCookies(),
  ],
});
