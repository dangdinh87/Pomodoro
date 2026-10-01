import { NextResponse } from 'next/server';

interface GuardOptions {
  /** Require `Content-Type: application/json` (forces a CORS preflight cross-site). */
  requireJson?: boolean;
}

function requestHost(request: Request): string {
  return (
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host') ||
    new URL(request.url).host
  );
}

/**
 * CSRF hardening for cookie-authenticated endpoints. Returns a 403 response
 * when the request is not same-origin (Origin header present and mismatched)
 * or, with `requireJson`, is not sent as application/json. Otherwise null.
 */
export function sameOriginJsonGuard(
  request: Request,
  { requireJson = false }: GuardOptions = {},
): NextResponse | null {
  const forbidden = () => NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const origin = request.headers.get('origin');
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return forbidden();
    }
    if (originHost !== requestHost(request)) return forbidden();
  }

  if (requireJson) {
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().startsWith('application/json')) return forbidden();
  }

  return null;
}
