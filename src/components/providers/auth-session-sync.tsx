'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { useAuthStore } from '@/stores/auth-store';

export function AuthSessionSync() {
  const { data, isPending } = useSession();
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (isPending) return;
    const sessionUser = data?.user;
    const isAnonymous = Boolean(sessionUser?.isAnonymous);
    useAuthStore.getState().setUser(
      sessionUser
        ? {
            id: sessionUser.id,
            // Guests carry a placeholder address that must never be shown.
            email: isAnonymous ? undefined : sessionUser.email,
            // Email-code sign-ups start without a name.
            name: isAnonymous ? undefined : sessionUser.name || undefined,
            avatarUrl: sessionUser.image ?? undefined,
            isAnonymous,
          }
        : null,
    );

    const userId = sessionUser?.id ?? null;
    // Another account (or none): cached data belongs to the previous one.
    if (previousUserId.current !== undefined && previousUserId.current !== userId) {
      void queryClient.resetQueries();
    }
    previousUserId.current = userId;
  }, [data, isPending, queryClient]);

  return null;
}
