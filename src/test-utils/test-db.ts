import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@/db/schema';

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;

/** In-memory Postgres with the real migrations applied; one per test file. */
export async function createTestDb() {
  const db = drizzle({ client: new PGlite(), schema });
  await migrate(db, { migrationsFolder: 'drizzle' });
  return db;
}

export async function createTestUser(db: TestDb, id: string, isAnonymous = false) {
  await db.insert(schema.user).values({
    id,
    name: isAnonymous ? 'Anonymous' : `User ${id}`,
    email: `${id}@example.com`,
    isAnonymous,
  });
  return { id, email: `${id}@example.com`, isAnonymous };
}

/** Empties every app and auth table between tests (users cascade to everything else). */
export async function resetTestDb(db: TestDb) {
  await db.delete(schema.feedbacks);
  await db.delete(schema.user);
}

export function jsonRequest(url: string, body: unknown, init: RequestInit = {}) {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    ...init,
  });
}
