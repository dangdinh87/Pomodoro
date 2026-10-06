'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

const isMember = () => {
  const user = useAuthStore.getState().user;
  return Boolean(user && !user.isAnonymous);
};

/**
 * The SEO content below the app (features, how it works, FAQ). It is in the server HTML for
 * everyone, so the page is identical for crawlers and can be static; signed-in members, who
 * need none of it, lose it once the browser knows who they are. The server snapshot is
 * "not a member", which keeps hydration identical to the HTML.
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const member = useSyncExternalStore(useAuthStore.subscribe, isMember, () => false);
  return member ? null : <>{children}</>;
}
