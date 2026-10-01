import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feedbacks } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { consumeRateLimit, getClientIp } from '@/lib/api/in-memory-rate-limiter';
import { badRequest, readJson, serverError } from '@/lib/api/responses';
import { validateFeedback } from './feedback-schema';

const FEEDBACK_LIMIT_PER_WINDOW = 5;
const FEEDBACK_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(
    `feedback:${getClientIp(request)}`,
    FEEDBACK_LIMIT_PER_WINDOW,
    FEEDBACK_WINDOW_MS,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many feedback submissions. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSec) } },
    );
  }

  const body = await readJson(request);
  if (body === undefined) return badRequest('Request body must be valid JSON');
  const parsed = validateFeedback(body);
  if (!parsed.success) return badRequest(parsed.error);

  try {
    const user = await getSessionUser();
    await db.insert(feedbacks).values({ userId: user?.id ?? null, ...parsed.data });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Failed to save feedback', error);
  }
}
