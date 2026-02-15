import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { rateLimiter } from '@/lib/rate-limit';

export async function POST(req: Request) {
    try {
        const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
        const isAllowed = rateLimiter.check(ip, 5, 60 * 60 * 1000); // 5 requests per hour

        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const supabase = await createClient();
        const body = await req.json();
        const { name, email, type, message, rating } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        if (!type || !['feature', 'bug', 'question', 'other'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid feedback type' },
                { status: 400 }
            );
        }

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Get authenticated user (optional - anonymous feedback allowed)
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('feedbacks')
            .insert({
                user_id: user?.id || null,
                type,
                message,
                rating: rating || null,
                name: name || null,
                email: email || null,
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
