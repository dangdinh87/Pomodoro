import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, type, message } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // In a real app, you would save this to a database
        // For now, we'll just log it to the console
        console.log('--- NEW FEEDBACK RECEIVED ---');
        console.log('Type:', type);
        console.log('From:', name || 'Anonymous', email ? `<${email}>` : '');
        console.log('Message:', message);
        console.log('-----------------------------');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Feedback error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
