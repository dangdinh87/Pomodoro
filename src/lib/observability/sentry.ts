/**
 * Minimal Sentry client: parse the DSN and POST one event to the envelope endpoint.
 * No SDK on purpose (no dependency, no bundle weight). Works in the Node and Edge runtimes.
 */
import type { ErrorReport } from './error-reporter';

export interface SentryTarget {
  /** `<scheme>://<host>[/<prefix>]/api/<projectId>/envelope/` */
  endpoint: string;
  publicKey: string;
  /** The DSN without any legacy secret; goes into the envelope header. */
  dsn: string;
}

/** `https://<publicKey>[:<secret>]@<host>[/<prefix>]/<projectId>`; null when it is not one. */
export function parseSentryDsn(raw: string | undefined): SentryTarget | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    const segments = url.pathname.split('/').filter(Boolean);
    const projectId = segments.pop();
    if (!url.username || !projectId || !/^\d+$/.test(projectId)) return null;
    const prefix = segments.length ? `/${segments.join('/')}` : '';
    return {
      endpoint: `${url.protocol}//${url.host}${prefix}/api/${projectId}/envelope/`,
      publicKey: decodeURIComponent(url.username),
      dsn: `${url.protocol}//${url.username}@${url.host}${prefix}/${projectId}`,
    };
  } catch {
    return null;
  }
}

interface EnvelopeContext {
  eventId: string;
  now: Date;
  environment?: string;
  release?: string;
}

export function buildSentryEnvelope(report: ErrorReport, target: SentryTarget, ctx: EnvelopeContext): string {
  const tags: Record<string, string> = { source: report.source };
  if (report.route) tags.route = report.route;
  if (report.method) tags.method = report.method;
  if (report.digest) tags.digest = report.digest;
  Object.assign(tags, report.tags);

  const event = {
    event_id: ctx.eventId,
    timestamp: ctx.now.getTime() / 1000,
    platform: 'javascript',
    level: report.level,
    logger: report.source,
    environment: ctx.environment,
    release: ctx.release,
    transaction: report.route,
    exception: { values: [{ type: report.name, value: report.message }] },
    tags,
    extra: report.stack ? { stack: report.stack } : undefined,
  };
  const header = { event_id: ctx.eventId, sent_at: ctx.now.toISOString(), dsn: target.dsn };
  return [header, { type: 'event' }, event].map((part) => JSON.stringify(part)).join('\n');
}

export interface SendOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  environment?: string;
  release?: string;
}

/** Fire one event at Sentry. Bounded by a timeout and never throws: reporting must not break a request. */
export async function sendToSentry(report: ErrorReport, target: SentryTarget, options: SendOptions = {}): Promise<void> {
  const { fetchImpl = fetch, timeoutMs = 2000, environment, release } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const eventId = crypto.randomUUID().replace(/-/g, '');
    await fetchImpl(target.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=study-bro/1, sentry_key=${target.publicKey}`,
      },
      body: buildSentryEnvelope(report, target, { eventId, now: new Date(), environment, release }),
      signal: controller.signal,
    });
  } catch {
    // Offline, timed out or rejected: the structured log line is still there.
  } finally {
    clearTimeout(timer);
  }
}
