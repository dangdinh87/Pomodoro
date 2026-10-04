/**
 * One place every error goes through: client boundaries, API 500s, `onRequestError`, CSP reports.
 * Each report becomes one structured JSON log line (Vercel runtime logs) and, when `SENTRY_DSN`
 * is set, one event at Sentry. Nothing here may carry personal data: only message, name, digest,
 * route pattern, method and a bounded stack. Cookies, headers and bodies are never read.
 */
import { parseSentryDsn, sendToSentry } from './sentry';

export type ReportSource = 'server' | 'client' | 'csp';
const SOURCES: readonly ReportSource[] = ['server', 'client', 'csp'];

export interface ErrorReport {
  source: ReportSource;
  level: 'error' | 'warning';
  name: string;
  message: string;
  digest?: string;
  /** Route pattern or page path, never a query string. */
  route?: string;
  method?: string;
  stack?: string;
  tags?: Record<string, string>;
}

const MAX_MESSAGE = 500;
const MAX_STACK = 2000;
const MAX_ROUTE = 200;
const MAX_FIELD = 100;

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const AUTH_TOKEN = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi;
const URL_QUERY = /\?[\w%.-]+=[^\s"')]*/g;
// drizzle's "Failed query: <sql>\nparams: <bound values>" would otherwise ship task titles and ids
const QUERY_PARAMS = /\bparams:[\s\S]*$/i;

/** Free text made safe to log: emails, auth tokens and URL query strings removed, length bounded. */
export function scrubText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(QUERY_PARAMS, 'params: [redacted]')
    .replace(EMAIL, '[email]')
    .replace(AUTH_TOKEN, '$1 [redacted]')
    .replace(URL_QUERY, '?[redacted]')
    .trim()
    .slice(0, max);
}

/** Path (or URL) without query string and fragment. */
function stripQuery(value: unknown): string {
  return typeof value === 'string' ? (value.split(/[?#]/)[0] ?? '').slice(0, MAX_ROUTE) : '';
}

/**
 * V8 stacks start with a line that repeats the message (scrubbed on its own), so keep only the
 * `at ...` frames. Firefox/Safari stacks have no such line and are kept whole.
 */
function stackFrames(stack: unknown): string {
  if (typeof stack !== 'string') return '';
  const firstFrame = stack.search(/\n\s+at /);
  return firstFrame === -1 ? stack : stack.slice(firstFrame + 1);
}

/** Untrusted or loosely typed input -> a report whose every field is bounded and scrubbed. */
export function normalizeReport(raw: Partial<Record<keyof ErrorReport, unknown>>): ErrorReport {
  const source = SOURCES.find((s) => s === raw.source) ?? 'client';
  const optional = (value: string) => value || undefined;
  const tags: Record<string, string> = {};
  if (raw.tags && typeof raw.tags === 'object') {
    for (const [key, value] of Object.entries(raw.tags).slice(0, 10)) {
      const clean = scrubText(value, MAX_FIELD);
      if (clean) tags[scrubText(key, 32)] = clean;
    }
  }
  return {
    source,
    level: raw.level === 'warning' ? 'warning' : 'error',
    name: scrubText(raw.name, MAX_FIELD) || 'Error',
    message: scrubText(raw.message, MAX_MESSAGE) || 'Unknown error',
    digest: optional(scrubText(raw.digest, MAX_FIELD)),
    route: optional(stripQuery(raw.route)),
    method: optional(scrubText(raw.method, 10).toUpperCase()),
    stack: optional(scrubText(stackFrames(raw.stack), MAX_STACK)),
    tags: Object.keys(tags).length ? tags : undefined,
  };
}

/** Next's `onRequestError` arguments -> report. `request.headers` and any body are deliberately not touched. */
export function buildServerErrorReport(
  error: unknown,
  request?: { path?: string; method?: string },
  context?: { routePath?: string; routeType?: string; renderSource?: string },
): ErrorReport {
  const err = (error ?? {}) as { name?: unknown; message?: unknown; digest?: unknown; stack?: unknown };
  const tags: Record<string, string> = {};
  if (context?.routeType) tags.routeType = context.routeType;
  if (context?.renderSource) tags.renderSource = context.renderSource;
  return normalizeReport({
    source: 'server',
    name: err.name,
    message: typeof error === 'string' ? error : (err.message ?? 'Unknown error'),
    digest: err.digest,
    route: context?.routePath || request?.path,
    method: request?.method,
    stack: err.stack,
    tags,
  });
}

export interface ReportOptions {
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

function log(report: ErrorReport) {
  const line = JSON.stringify({ event: 'app_error', ...report });
  if (report.level === 'warning') console.warn(line);
  else console.error(line);
}

/** Log the report and forward it to Sentry when configured. Never throws. */
export async function reportError(report: Partial<Record<keyof ErrorReport, unknown>>, options: ReportOptions = {}): Promise<void> {
  try {
    const clean = normalizeReport(report);
    log(clean);
    const env = options.env ?? process.env;
    const target = parseSentryDsn(env.SENTRY_DSN);
    if (!target) return;
    await sendToSentry(clean, target, {
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      environment: env.VERCEL_ENV ?? env.NODE_ENV,
      release: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12),
    });
  } catch {
    // Reporting is best effort by contract.
  }
}
