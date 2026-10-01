import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { consumeRateLimit, getClientIp } from '@/lib/api/in-memory-rate-limiter';
import { validateFeedback } from './feedback-schema';

// Anonymous endpoint: throttle per client IP to limit spam.
const FEEDBACK_LIMIT_PER_WINDOW = 5;
const FEEDBACK_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
    const rateLimit = consumeRateLimit(
        `feedback:${getClientIp(req)}`,
        FEEDBACK_LIMIT_PER_WINDOW,
        FEEDBACK_WINDOW_MS,
    );
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Too many feedback submissions. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSec) } }
        );
    }

    try {
        const supabase = await createClient();

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: 'Request body must be valid JSON' },
                { status: 400 }
            );
        }

        const parsed = validateFeedback(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        // Get authenticated user (optional - anonymous feedback allowed)
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('feedbacks')
            .insert({
                user_id: user?.id || null,
                ...parsed.data,
            });

        if (error) {
            console.error('Feedback insert error:', error);
            return NextResponse.json(
                { error: 'Failed to save feedback' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Feedback error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
