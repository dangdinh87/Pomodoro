'use client';

import { createAuthClient } from 'better-auth/react';
import { anonymousClient, emailOTPClient } from 'better-auth/client/plugins';
import { TooManyRequestsError } from '@/lib/api/too-many-requests-error';

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), anonymousClient()],
});

export const { useSession, signOut } = authClient;

export interface SessionUser {
  id: string;
  isAnonymous: boolean;
}

/**
 * Guests get an anonymous session on their first write, never on a page view.
 * Resolves to the signed-in user (existing or just created). Throws
 * `TooManyRequestsError` on HTTP 429 (guest sign-ins are rate limited per IP).
 */
export async function ensureSession(): Promise<SessionUser> {
  const { data } = await authClient.getSession();
  if (data) return { id: data.user.id, isAnonymous: Boolean(data.user.isAnonymous) };
  const { data: created, error } = await authClient.signIn.anonymous();
  if (error || !created) {
    if (error?.status === 429) throw new TooManyRequestsError(error.message);
    throw new Error(error?.message ?? 'Could not start a guest session');
  }
  return { id: created.user.id, isAnonymous: true };
}
