/**
 * Browser side of error tracking: error boundaries call this and the server route logs it / forwards
 * it to Sentry. Sends the message, name, digest, a bounded stack and the page path only (no query
 * string, no cookies). Fire and forget: a report must never break the error screen itself.
 */
export type ErrorBoundaryName = 'route-error' | 'global-error';

const REPORT_ENDPOINT = '/api/client-error';
const MAX_MESSAGE = 1000;
const MAX_STACK = 4000;
const MAX_REMEMBERED = 20;

// A boundary effect can run twice (StrictMode) and "Try again" can fail the same way repeatedly.
const alreadyReported = new Set<string>();

export function resetClientErrorDedupeForTests() {
  alreadyReported.clear();
}

export function reportClientError(error: Error & { digest?: string }, boundary: ErrorBoundaryName): void {
  try {
    const key = error.digest || `${error.name}:${error.message}`;
    if (alreadyReported.has(key)) return;
    if (alreadyReported.size >= MAX_REMEMBERED) alreadyReported.clear();
    alreadyReported.add(key);

    const payload = {
      boundary,
      message: (error.message || error.name || 'Error').slice(0, MAX_MESSAGE),
      name: error.name,
      digest: error.digest,
      stack: error.stack?.slice(0, MAX_STACK),
      path: window.location.pathname,
    };
    void fetch(REPORT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit',
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore: see above
  }
}
