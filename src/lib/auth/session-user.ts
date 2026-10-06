import 'server-only';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export type SessionUser = { id: string; email: string; isAnonymous: boolean };

/** The signed-in user (guest sessions included) for the current request, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, email, isAnonymous } = session.user;
  return { id, email, isAnonymous: Boolean(isAnonymous) };
}
