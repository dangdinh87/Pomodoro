
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sortBy') || 'time'; // 'time' | 'tasks'
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    let query = supabase
      .from('leaderboard')
      .select('*');

    if (sortBy === 'tasks') {
      query = query.order('tasks_completed', { ascending: false });
    } else {
      query = query.order('total_focus_time', { ascending: false });
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync profile
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing profile:', error);
    return NextResponse.json(
      { error: 'Failed to sync profile' },
      { status: 500 }
    );
  }
}
