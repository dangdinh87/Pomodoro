import { NextResponse } from 'next/server';
import { consumeRateLimit, getClientIp } from '@/lib/api/in-memory-rate-limiter';
import { readCappedText } from '@/lib/api/read-capped-text';
import { badRequest } from '@/lib/api/responses';
import { sameOriginJsonGuard } from '@/lib/api/same-origin-json-guard';
import { scheduleGatedReport } from '@/lib/observability/report-gate';
import { validateClientError } from './client-error-schema';

const MAX_BODY_BYTES = 8 * 1024;
const LIMIT_PER_WINDOW = 20;
const WINDOW_MS = 60 * 1000;

/**
 * Error boundaries post here, so browser-side crashes reach the same log/Sentry pipeline as server errors.
 * The endpoint is public (a same-origin check does not stop `curl`), so reports pass the report gate:
 * repeats, extension noise and anything over the per-instance cap are answered 204 and not forwarded.
 */
export async function POST(request: Request) {
  const blocked = sameOriginJsonGuard(request, { requireJson: true });
  if (blocked) return blocked;

  const limit = consumeRateLimit(`client-error:${getClientIp(request)}`, LIMIT_PER_WINDOW, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many reports' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
    );
  }

  const text = await readCappedText(request, MAX_BODY_BYTES);
  if (text === null) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return badRequest('Request body must be valid JSON');
  }
  const parsed = validateClientError(body);
  if (!parsed.success) return badRequest(parsed.error);

  const { boundary, path, ...error } = parsed.data;
  scheduleGatedReport({ source: 'client', ...error, route: path, tags: { boundary } });
  return new NextResponse(null, { status: 204 });
}
