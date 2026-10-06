/** @vitest-environment node */
import { sql } from 'drizzle-orm';
import {
  FEEDBACK_TYPES,
  SESSION_MODES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  feedbacks,
  focusSessions,
  tasks,
} from '@/db/schema';
import { createTestDb, createTestUser, type TestDb } from '@/test-utils/test-db';

let db: TestDb;

beforeAll(async () => {
  db = await createTestDb();
  await createTestUser(db, 'u1');
});

/** Insert with a value the TypeScript enum would never allow, the way a buggy writer or a manual SQL fix could. */
const rejectedBy = async (constraint: string, run: () => Promise<unknown>) => {
  const error = await run().then(
    () => null,
    (e: unknown) => e as Error & { cause?: Error },
  );
  expect(error, `expected ${constraint} to reject the row`).not.toBeNull();
  expect(`${error!.message} ${error!.cause?.message ?? ''}`).toContain(constraint);
};

describe('CHECK constraints on enum-like columns', () => {
  it('tasks.priority and tasks.status only take the values the code uses', async () => {
    for (const priority of TASK_PRIORITIES) {
      await db.insert(tasks).values({ userId: 'u1', title: 'ok', priority });
    }
    for (const status of TASK_STATUSES) {
      await db.insert(tasks).values({ userId: 'u1', title: 'ok', status });
    }
    await rejectedBy('tasks_priority_check', () =>
      db.execute(sql`insert into tasks (user_id, title, priority) values ('u1', 'x', 'URGENT')`),
    );
    await rejectedBy('tasks_status_check', () =>
      db.execute(sql`insert into tasks (user_id, title, status) values ('u1', 'x', 'ARCHIVED')`),
    );
  });

  it('focus_sessions.mode', async () => {
    for (const mode of SESSION_MODES) {
      await db.insert(focusSessions).values({ userId: 'u1', mode, durationSec: 60 });
    }
    await rejectedBy('focus_sessions_mode_check', () =>
      db.execute(sql`insert into focus_sessions (user_id, mode, duration_sec) values ('u1', 'nap', 60)`),
    );
  });

  it('feedbacks.type', async () => {
    for (const type of FEEDBACK_TYPES) {
      await db.insert(feedbacks).values({ type, message: 'hi' });
    }
    await rejectedBy('feedbacks_type_check', () =>
      db.execute(sql`insert into feedbacks (type, message) values ('rant', 'hi')`),
    );
  });
});

describe('indexes added for hot queries and ON DELETE SET NULL', () => {
  it('exist after the migrations run', async () => {
    const { rows } = await db.execute<{ indexname: string; indexdef: string }>(
      sql`select indexname, indexdef from pg_indexes where schemaname = 'public'`,
    );
    const defs = Object.fromEntries(rows.map((r) => [r.indexname, r.indexdef]));

    expect(defs['focus_sessions_user_mode_created_idx']).toMatch(/\(user_id, mode, created_at\)/);
    expect(defs['focus_sessions_task_id_idx']).toMatch(/\(task_id\)/);
    expect(defs['feedbacks_user_id_idx']).toMatch(/\(user_id\)/);
    // the earlier ones stay
    expect(defs['focus_sessions_user_created_idx']).toBeDefined();
    expect(defs['tasks_user_order_idx']).toBeDefined();
  });
});
