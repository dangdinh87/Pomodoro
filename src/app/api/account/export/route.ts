import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sameOriginJsonGuard } from '@/lib/api/same-origin-json-guard';
import { consumeRateLimit } from '@/lib/api/in-memory-rate-limiter';

const EXPORT_LIMIT = 3;
const EXPORT_WINDOW_MS = 60 * 60 * 1000;

/** GET /api/account/export: caller's own data as a JSON download. */
export async function GET(request: Request) {
  const blocked = sameOriginJsonGuard(request);
  if (blocked) return blocked;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = consumeRateLimit(`account-export:${user.id}`, EXPORT_LIMIT, EXPORT_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many export requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
    );
  }

  try {
    const [profile, tasks, sessions, streaks, tags, conversations] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id),
      supabase.from('tasks').select('*').eq('user_id', user.id),
      supabase.from('sessions').select('*').eq('user_id', user.id),
      supabase.from('streaks').select('*').eq('user_id', user.id),
      supabase.from('user_tags').select('*').eq('user_id', user.id),
      supabase.from('conversations').select('*').eq('user_id', user.id),
    ]);

    const failed = [profile, tasks, sessions, streaks, tags, conversations].find((r) => r.error);
    if (failed) {
      console.error('Account export query failed:', failed.error);
      return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }

    const conversationRows = (conversations.data ?? []) as Array<{ id: string }>;
    let messageRows: unknown[] = [];
    if (conversationRows.length > 0) {
      const messages = await supabase
        .from('messages')
        .select('*')
        .in(
          'conversation_id',
          conversationRows.map((c) => c.id),
        );
      if (messages.error) {
        console.error('Account export messages query failed:', messages.error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
      }
      messageRows = messages.data ?? [];
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      account: { id: user.id, email: user.email ?? null },
      profile: profile.data?.[0] ?? null,
      tasks: tasks.data ?? [],
      sessions: sessions.data ?? [],
      streaks: streaks.data ?? [],
      user_tags: tags.data ?? [],
      conversations: conversationRows,
      messages: messageRows,
    };

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="studybro-data-${date}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Account export failed:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
