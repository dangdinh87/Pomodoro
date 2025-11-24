'use client';

import { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase-client';
import { useAuthStore } from '@/stores/auth-store';

function mapSupabaseUser(user: User) {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email ?? undefined,
    name:
      metadata.full_name ||
      metadata.name ||
      metadata.preferred_username ||
      metadata.user_name ||
      user.email ||
      'Người dùng',
    avatarUrl: metadata.avatar_url || metadata.picture || undefined,
    provider: user.app_metadata?.provider,
  };
}

export function SupabaseAuthProvider() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const syncUser = (sessionUser: User | null) => {
      if (!sessionUser) {
        setUser(null);
        return;
      }
      setUser(mapSupabaseUser(sessionUser));
    };

    setLoading(true);

    supabase.auth
      .getSession()
      .then(({ data }) => syncUser(data?.session?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const {
      data: subscription,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, [setUser, setLoading]);

  return null;
}



