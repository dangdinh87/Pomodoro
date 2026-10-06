import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { user as users } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { sameOriginJsonGuard } from '@/lib/api/same-origin-json-guard';
import { badRequest, readJson, serverError, unauthorized } from '@/lib/api/responses';

const DELETE_LITERAL = 'DELETE';

/**
 * Deletes the account and everything it owns. Sessions, linked providers,
 * tasks, focus sessions and tags go with it through ON DELETE CASCADE;
 * feedback is kept but detached (ON DELETE SET NULL).
 */
export async function DELETE(request: Request) {
  const blocked = sameOriginJsonGuard(request, { requireJson: true });
  if (blocked) return blocked;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = (await readJson(request)) as { confirm?: unknown } | undefined;
  if (body === undefined) return badRequest('Invalid JSON body');
  const expected = user.isAnonymous ? DELETE_LITERAL : user.email;
  if (typeof body?.confirm !== 'string' || body.confirm.trim().toLowerCase() !== expected.toLowerCase()) {
    return badRequest('Confirmation does not match');
  }

  try {
    await db.delete(users).where(eq(users.id, user.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Failed to delete account', error);
  }
}
