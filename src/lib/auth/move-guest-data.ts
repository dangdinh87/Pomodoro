import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { db } from '@/db';
import { feedbacks, focusSessions, tasks, userTags } from '@/db/schema';
import { MAX_USER_TAGS } from '@/lib/tasks/tag-limits';

/**
 * Re-homes a guest's data onto the account they just signed in to. Runs inside
 * Better Auth's link hook, right before the anonymous user (and anything still
 * pointing at it, via ON DELETE CASCADE) is deleted.
 */
export async function moveGuestData(guestId: string, userId: string) {
  if (guestId === userId) return;
  await db.transaction(async (tx) => {
    await tx.update(tasks).set({ userId }).where(eq(tasks.userId, guestId));
    // A phase finished in two windows (one still the guest, one already the account) has one
    // clientSessionId in both; the account's copy wins, or the unique (user_id, client_session_id)
    // would fail this whole transaction and with it the sign-in.
    await tx.delete(focusSessions).where(
      and(
        eq(focusSessions.userId, guestId),
        inArray(
          focusSessions.clientSessionId,
          tx
            .select({ id: focusSessions.clientSessionId })
            .from(focusSessions)
            .where(and(eq(focusSessions.userId, userId), isNotNull(focusSessions.clientSessionId))),
        ),
      ),
    );
    await tx.update(focusSessions).set({ userId }).where(eq(focusSessions.userId, guestId));
    await tx.update(feedbacks).set({ userId }).where(eq(feedbacks.userId, guestId));

    const rows = await tx
      .select()
      .from(userTags)
      .where(inArray(userTags.userId, [guestId, userId]));
    const guestTags = rows.find((r) => r.userId === guestId)?.tags ?? [];
    if (guestTags.length === 0) return;
    const ownTags = rows.find((r) => r.userId === userId)?.tags ?? [];
    const merged = Array.from(new Set([...ownTags, ...guestTags])).slice(0, MAX_USER_TAGS);
    await tx
      .insert(userTags)
      .values({ userId, tags: merged })
      .onConflictDoUpdate({ target: userTags.userId, set: { tags: merged } });
  });
}
