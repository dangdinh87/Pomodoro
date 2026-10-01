import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { sameOriginJsonGuard } from '@/lib/api/same-origin-json-guard';

const DELETE_LITERAL = 'DELETE';

/** Tables wiped by user id column, in order. Messages cascade via conversations FK. */
const OWNED_TABLES: Array<{ table: string; column: string }> = [
  { table: 'sessions', column: 'user_id' },
  { table: 'tasks', column: 'user_id' },
  { table: 'streaks', column: 'user_id' },
  { table: 'user_tags', column: 'user_id' },
  { table: 'conversations', column: 'user_id' },
  { table: 'profiles', column: 'id' },
];

/** DELETE /api/account  body: { confirm: <email | "DELETE"> } */
export async function DELETE(request: Request) {
  const blocked = sameOriginJsonGuard(request, { requireJson: true });
  if (blocked) return blocked;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let confirm: unknown;
  try {
    ({ confirm } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const expected = user.email ?? DELETE_LITERAL;
  if (typeof confirm !== 'string' || confirm.trim().toLowerCase() !== expected.toLowerCase()) {
    return NextResponse.json({ error: 'Confirmation does not match' }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Account deletion is not configured' }, { status: 503 });
  }

  let step = 'feedbacks';
  let anyStepDone = false;
  try {
    // Keep feedback but detach it from the user.
    const feedbacks = await admin.from('feedbacks').update({ user_id: null }).eq('user_id', user.id);
    if (feedbacks.error) throw new Error(feedbacks.error.message);
    anyStepDone = true;

    for (const { table, column } of OWNED_TABLES) {
      step = table;
      const { error } = await admin.from(table).delete().eq(column, user.id);
      if (error) throw new Error(error.message);
    }

    step = 'auth user';
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteUserError) throw new Error(deleteUserError.message);
  } catch (error) {
    console.error(`Account deletion failed at step "${step}" for user ${user.id}:`, error);
    if (anyStepDone) {
      return NextResponse.json(
        { error: 'Account deletion partially failed. Please retry.', partial: true },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
