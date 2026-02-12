'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Handles Supabase auth redirect when user lands on any page with ?code=.
 * Supabase may redirect to Site URL (e.g. landing) with code instead of /auth/callback.
 * This redirects to /auth/callback so the code can be properly exchanged.
 */
export function AuthCodeHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    // Don't redirect if we're already on the callback route
    if (pathname === '/auth/callback') return;

    // Preserve all params (code, type, next) for the callback
    const callbackUrl = `/auth/callback?${params.toString()}`;
    router.replace(callbackUrl);
  }, [pathname, router]);

  return null;
}
