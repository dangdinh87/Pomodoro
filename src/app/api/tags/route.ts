import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userTags } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { badRequest, readJson, serverError, unauthorized } from '@/lib/api/responses';
import { MAX_TAG_LENGTH, MAX_USER_TAGS } from '@/lib/tasks/tag-limits';

async function readTags(userId: string) {
  const [row] = await db.select({ tags: userTags.tags }).from(userTags).where(eq(userTags.userId, userId));
  return row?.tags ?? [];
}

async function saveTags(userId: string, tags: string[]) {
  await db
    .insert(userTags)
    .values({ userId, tags })
    .onConflictDoUpdate({ target: userTags.userId, set: { tags } });
  return NextResponse.json({ tags });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  try {
    return NextResponse.json({ tags: await readTags(user.id) });
  } catch (error) {
    return serverError('Failed to load tags', error);
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (body === undefined) return badRequest('Request body must be valid JSON');
  const rawTag = (body as { tag?: unknown } | null)?.tag;
  const tag = typeof rawTag === 'string' ? rawTag.trim().toLowerCase() : '';
  if (!tag) return badRequest('Tag is required');
  if (tag.length > MAX_TAG_LENGTH) return badRequest(`Tag must be at most ${MAX_TAG_LENGTH} characters`);

  try {
    const current = await readTags(user.id);
    if (current.includes(tag)) return badRequest('Tag already exists');
    if (current.length >= MAX_USER_TAGS) return badRequest(`Maximum ${MAX_USER_TAGS} tags allowed`);
    return await saveTags(user.id, [...current, tag]);
  } catch (error) {
    return serverError('Failed to save tags', error);
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const tag = new URL(request.url).searchParams.get('tag')?.toLowerCase();
  if (!tag) return badRequest('Tag is required');

  try {
    const current = await readTags(user.id);
    return await saveTags(user.id, current.filter((t) => t !== tag));
  } catch (error) {
    return serverError('Failed to save tags', error);
  }
}
