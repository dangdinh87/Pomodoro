/**
 * Keeps the two public report endpoints (`/api/client-error`, `/api/csp-report`) from turning anyone's
 * `curl` loop (or one noisy page) into the month's Sentry quota and a wall of runtime logs. A report is
 * dropped when it
 *  - comes from a browser extension (its stack or message names a `*-extension://` url),
 *  - is a CSP report that missed the 10% sample,
 *  - repeats a fingerprint (source, name, message, route) already forwarded in the last 5 minutes,
 *  - or exceeds 30 forwarded reports a minute on this instance.
 * State is per server instance, like the rate limiter: it bounds what one instance sends, not a global
 * total. What the dedupe and the cap hold back is counted and shows up as one summary log line a minute.
 */
import { normalizeReport, type ErrorReport } from './error-reporter';
import { scheduleReport } from './schedule-report';

const DEDUPE_WINDOW_MS = 5 * 60_000;
const WINDOW_MS = 60_000;
const MAX_FORWARDED_PER_WINDOW = 30;
/** Most CSP reports are the same few violations repeated by every visitor. */
const SAMPLE_RATE: Partial<Record<ErrorReport['source'], number>> = { csp: 0.1 };
const EXTENSION_URL = /(?:chrome|moz|safari|safari-web|ms-browser)-extension:\/\//i;

// Only forwarded reports are remembered, so this holds at most the cap times the dedupe window (150 entries)
const lastForwarded = new Map<string, number>();
let windowStart = 0;
let forwarded = 0;
let suppressed = 0;

function rollWindow(now: number) {
  if (now >= windowStart && now - windowStart < WINDOW_MS) return;
  if (suppressed > 0) console.warn(JSON.stringify({ event: 'app_error_suppressed', count: suppressed }));
  suppressed = 0;
  forwarded = 0;
  windowStart = now;
  lastForwarded.forEach((at, key) => {
    if (now - at >= DEDUPE_WINDOW_MS) lastForwarded.delete(key);
  });
}

/** Should this report reach the logs and Sentry? Counts it toward the dedupe and the cap when it does. */
export function shouldForwardReport(raw: Partial<Record<keyof ErrorReport, unknown>>, now: number = Date.now()): boolean {
  const report = normalizeReport(raw);
  if (EXTENSION_URL.test(`${report.message}\n${report.stack ?? ''}`)) return false;

  rollWindow(now);

  const rate = SAMPLE_RATE[report.source] ?? 1;
  if (rate < 1 && Math.random() >= rate) {
    suppressed += 1;
    return false;
  }

  const fingerprint = [report.source, report.name, report.message, report.route ?? ''].join('|');
  const seenAt = lastForwarded.get(fingerprint);
  if (seenAt !== undefined && now - seenAt < DEDUPE_WINDOW_MS) {
    suppressed += 1;
    return false;
  }
  if (forwarded >= MAX_FORWARDED_PER_WINDOW) {
    suppressed += 1;
    return false;
  }

  forwarded += 1;
  lastForwarded.set(fingerprint, now);
  return true;
}

/** `scheduleReport` behind the gate: for endpoints anyone on the internet can post to. */
export function scheduleGatedReport(report: Partial<Record<keyof ErrorReport, unknown>>): void {
  if (shouldForwardReport(report)) scheduleReport(report);
}

/** Test helper: forget all state. */
export function resetReportGateForTests() {
  lastForwarded.clear();
  windowStart = 0;
  forwarded = 0;
  suppressed = 0;
}
