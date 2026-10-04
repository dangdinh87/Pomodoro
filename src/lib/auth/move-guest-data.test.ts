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

  // Two windows of one browser: one finished the phase as the guest, the other already as the account
  // (same clientSessionId, see phaseSessionId). The unique (user_id, client_session_id) would reject the move.
  it('drops a guest session the account already has (same clientSessionId) instead of failing the sign-in', async () => {
    await mockDb.insert(focusSessions).values([
      { userId: 'member', mode: 'work', durationSec: 1500, clientSessionId: 'work_1800000000000' },
      { userId: 'guest', mode: 'work', durationSec: 1500, clientSessionId: 'work_1800000000000' },
      { userId: 'guest', mode: 'shortBreak', durationSec: 300, clientSessionId: 'shortBreak_1800001500000' },
      { userId: 'guest', mode: 'work', durationSec: 60, clientSessionId: null },
      { userId: 'guest', mode: 'work', durationSec: 90, clientSessionId: null },
    ]);

    await moveGuestData('guest', 'member');

    const rows = await mockDb.select().from(focusSessions);
    expect(rows.every((r) => r.userId === 'member')).toBe(true);
    expect(rows).toHaveLength(4); // the repeated phase is kept once; sessions without an id all move
    expect(rows.filter((r) => r.clientSessionId === 'work_1800000000000')).toHaveLength(1);
    expect(rows.some((r) => r.clientSessionId === 'shortBreak_1800001500000')).toBe(true);
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
