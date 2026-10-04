import { after } from 'next/server';
import { reportError, type ErrorReport } from './error-reporter';

/**
 * Report after the response is sent (`after` keeps the serverless function alive until the Sentry
 * call finishes). Outside a request scope (tests, scripts) `after` throws, so run it right away.
 */
export function scheduleReport(report: Partial<Record<keyof ErrorReport, unknown>>): void {
  const task = () => reportError(report);
  try {
    after(task);
  } catch {
    void task();
  }
}
