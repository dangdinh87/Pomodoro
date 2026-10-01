
import { featureGate } from '@/config/feature-gate';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const MAX_LEADERBOARD_SIZE = 100;
const LEADERBOARD_COLUMNS = 'user_id, name, avatar_url, total_focus_time, tasks_completed';

const MAX_DISPLAY_NAME_LENGTH = 50;

function toPublicDisplayName(value: unknown): string {
  if (typeof value !== 'string') return 'User';
  const trimmed = value.trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
  return trimmed || 'User';
}

/** Only https URLs are published; anything else (javascript:, http:, junk) is dropped. */
function toPublicAvatarUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    return new URL(value).protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return MAX_LEADERBOARD_SIZE;
  return Math.min(parsed, MAX_LEADERBOARD_SIZE);
}

export async function GET(request: Request) {
  const gated = featureGate('leaderboard');
  if (gated) return gated;

  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sortBy') || 'time'; // 'time' | 'tasks'
  const limit = parseLimit(searchParams.get('limit'));

  try {
    let query = supabase
      .from('leaderboard')
      .select(LEADERBOARD_COLUMNS);

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
  const gated = featureGate('leaderboard');
  if (gated) return gated;

  const supabase = await createClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync profile. Profiles are public (leaderboard) and user_metadata is
    // user-editable, so sanitize it; never derive the display name from the
    // email address ('User' matches the signup trigger).
    const metadata = user.user_metadata ?? {};
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: toPublicDisplayName(metadata.full_name ?? metadata.name),
        avatar_url: toPublicAvatarUrl(metadata.avatar_url ?? metadata.picture),
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
