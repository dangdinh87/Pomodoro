/** @vitest-environment node */
import { createTestDb, createTestUser, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { focusSessions, tasks, userTags } from '@/db/schema';
import { moveGuestData } from './move-guest-data';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  await createTestUser(mockDb, 'guest', true);
  await createTestUser(mockDb, 'member');
});

describe('moveGuestData', () => {
  it("moves the guest's tasks and sessions to the account", async () => {
    await mockDb.insert(tasks).values([{ userId: 'guest', title: 'g' }, { userId: 'member', title: 'm' }]);
    await mockDb.insert(focusSessions).values({ userId: 'guest', mode: 'work', durationSec: 60 });

    await moveGuestData('guest', 'member');

    expect((await mockDb.select().from(tasks)).every((t) => t.userId === 'member')).toBe(true);
    expect((await mockDb.select().from(focusSessions))[0].userId).toBe('member');
  });

  it('merges tags without duplicates', async () => {
    await mockDb.insert(userTags).values([
      { userId: 'guest', tags: ['math', 'ielts'] },
      { userId: 'member', tags: ['math'] },
    ]);
    await moveGuestData('guest', 'member');
    const rows = await mockDb.select().from(userTags);
    expect(rows.find((r) => r.userId === 'member')?.tags).toEqual(['math', 'ielts']);
  });
});
