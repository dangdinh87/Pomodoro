import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback - exchanges auth code for session (OAuth, email confirm, password recovery).
 * Supabase redirects here with ?code=xxx. After exchange, redirects user appropriately.
 * Uses request/response cookie pattern so session cookies persist with the redirect.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  }

  // Determine redirect destination (only allow same-origin paths)
  let redirectTo: URL;
  if (type === 'recovery') {
    redirectTo = new URL('/reset-password', requestUrl.origin);
  } else if (next?.startsWith('/') && !next.startsWith('//')) {
    redirectTo = new URL(next, requestUrl.origin);
  } else {
    redirectTo = new URL('/timer', requestUrl.origin);
  }

  // Build response so we can attach session cookies to it
  let response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth callback error:', error.message);
    response = NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    );
  }

  return response;
}
