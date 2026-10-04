import { NextResponse } from 'next/server';
import { consumeRateLimit, getClientIp } from '@/lib/api/in-memory-rate-limiter';
import { readCappedText } from '@/lib/api/read-capped-text';
import { badRequest } from '@/lib/api/responses';
import { cspViolationToReport, parseCspReports } from '@/lib/observability/csp-report';
import { scheduleGatedReport } from '@/lib/observability/report-gate';

const MAX_BODY_BYTES = 16 * 1024;
const LIMIT_PER_WINDOW = 60;
const WINDOW_MS = 60 * 1000;
// report-uri sends application/csp-report, report-to sends application/reports+json
const ACCEPTED_TYPES = ['application/csp-report', 'application/reports+json', 'application/json'];

/**
 * Where the Content-Security-Policy `report-uri` / `report-to` point. Browsers send these without
 * credentials and ignore the answer, so there is no auth or origin check; the size cap and the
 * per-IP limit keep it from being a log-flooding tool, and the report gate (sampling, dedupe, a
 * per-instance cap) keeps it from draining the Sentry quota.
 */
export async function POST(request: Request) {
  const limit = consumeRateLimit(`csp-report:${getClientIp(request)}`, LIMIT_PER_WINDOW, WINDOW_MS);
  if (!limit.allowed) {
    return new NextResponse(null, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } });
  }

  const contentType = (request.headers.get('content-type') ?? '').toLowerCase();
  if (!ACCEPTED_TYPES.some((type) => contentType.startsWith(type))) {
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
  }

  const raw = await readCappedText(request, MAX_BODY_BYTES);
  if (raw === null) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return badRequest('Request body must be valid JSON');
  }
  const looksLikeReport = Array.isArray(body) || (!!body && typeof body === 'object' && 'csp-report' in body);
  if (!looksLikeReport) return badRequest('Not a CSP report');

  for (const violation of parseCspReports(body)) scheduleGatedReport(cspViolationToReport(violation));
  return new NextResponse(null, { status: 204 });
}
