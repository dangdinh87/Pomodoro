import { NextResponse } from 'next/server';
import { buildServerErrorReport } from '@/lib/observability/error-reporter';
import { scheduleReport } from '@/lib/observability/schedule-report';

export const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export const notFound = (message = 'Not found') =>
  NextResponse.json({ error: message }, { status: 404 });

export const badRequest = (message: string, details?: Record<string, string[]>) =>
  NextResponse.json({ error: message, details }, { status: 400 });

/** Handlers catch their own errors, so Next's `onRequestError` never sees them: report from here. */
export const serverError = (message: string, error: unknown) => {
  const report = buildServerErrorReport(error);
  scheduleReport({ ...report, message: `${message}: ${report.message}` });
  return NextResponse.json({ error: message }, { status: 500 });
};

/** Parsed JSON body, or `undefined` when the body is not valid JSON. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
