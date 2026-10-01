import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { anonymous, emailOTP } from 'better-auth/plugins';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { sendOtpEmail } from '@/lib/email/send-otp-email';
import { moveGuestData } from '@/lib/auth/move-guest-data';
import { getGoogleCredentials } from '@/lib/auth/providers';

const google = getGoogleCredentials();

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  socialProviders: google ? { google } : {},
  session: {
    expiresIn: 60 * 60 * 24 * 60,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: {
    enabled: true,
    storage: 'database',
    modelName: 'rateLimit',
    // Every guest sign-in creates a user row; a real visitor needs one.
    customRules: { '/sign-in/anonymous': { window: 10 * 60, max: 5 } },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60,
      storeOTP: 'hashed',
      sendVerificationOTP: ({ email, otp }) => sendOtpEmail(email, otp),
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
