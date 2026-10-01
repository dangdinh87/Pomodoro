'use client';

import { createAuthClient } from 'better-auth/react';
import { anonymousClient, emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), anonymousClient()],
});

export const { useSession, signOut } = authClient;

/** Guests get an anonymous session on their first write, never on a page view. */
export async function ensureSession(): Promise<void> {
  const { data } = await authClient.getSession();
  if (data) return;
  const { error } = await authClient.signIn.anonymous();
  if (error) throw new Error(error.message ?? 'Could not start a guest session');
}
