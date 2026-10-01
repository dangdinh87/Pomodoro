/**
 * @jest-environment node
 */
import { POST } from './route';
import { createClient } from '@/lib/supabase-server';
import { SESSION_MAX_DURATION_SEC, SESSION_MAX_TOTAL_SEC_PER_DAY } from '@/config/constants';
import { createSupabaseMock, jsonRequest, type SupabaseMockOptions } from '@/test-utils/supabase-mock';

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }));

const URL = 'http://localhost:3000/api/tasks/session-complete';
const USER = { id: '11111111-1111-4111-8111-111111111111' };
const TASK_ID = '22222222-2222-4222-8222-222222222222';

function setup(tables: SupabaseMockOptions['tables'] = {}) {
  const mock = createSupabaseMock({
    user: USER,
    tables: {
      sessions: [{ data: [] }, { data: { id: 'session-1' } }],
      tasks: { data: { id: TASK_ID } },
      streaks: { data: null, error: { code: 'PGRST116' } },
      ...tables,
    },
  });
  (createClient as jest.Mock).mockResolvedValue(mock.client);
  return mock;
}

describe('POST /api/tasks/session-complete', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 without a user', async () => {
    const mock = createSupabaseMock({ user: null });
    (createClient as jest.Mock).mockResolvedValue(mock.client);

    const res = await POST(jsonRequest(URL, { durationSec: 1500, mode: 'work' }));
    expect(res.status).toBe(401);
  });

  it.each([
    [{ durationSec: 1500, mode: 'nap' }, 'unknown mode'],
    [{ mode: 'work' }, 'missing duration (previously recorded NaN)'],
    [{ durationSec: '1500', mode: 'work' }, 'string duration'],
    [{ durationSec: 0, mode: 'work' }, 'zero duration'],
    [{ durationSec: SESSION_MAX_DURATION_SEC + 1, mode: 'work' }, 'duration above cap'],
    [{ durationSec: 1e9, mode: 'work' }, 'forged huge duration'],
  ])('returns 400 for %p (%s)', async (body, _reason) => {
    const mock = setup();
    const res = await POST(jsonRequest(URL, body));
    expect(res.status).toBe(400);
    expect(mock.callsFor('sessions')).toHaveLength(0);
  });

  it('returns 400 for malformed JSON', async () => {
    setup();
    const res = await POST(jsonRequest(URL, '{not json'));
    expect(res.status).toBe(400);
  });

  it('returns 429 when the rolling 24h total would exceed a day', async () => {
    const mock = setup({
      sessions: { data: [{ duration: SESSION_MAX_TOTAL_SEC_PER_DAY - 100 }] },
    });
    const res = await POST(jsonRequest(URL, { durationSec: 200, mode: 'work' }));

    expect(res.status).toBe(429);
    expect(mock.callsFor('sessions').some((c) => c.method === 'insert')).toBe(false);
  });

  it('records a valid work session for an owned task', async () => {
    const mock = setup();
    const res = await POST(
      jsonRequest(URL, { taskId: TASK_ID, durationSec: 1499.6, mode: 'work' }),
    );

    expect(res.status).toBe(200);
    const insert = mock.callsFor('sessions').find((c) => c.method === 'insert');
    expect(insert?.args[0]).toEqual({
      user_id: USER.id,
      task_id: TASK_ID,
      duration: 1500,
      mode: 'work',
    });
    expect(mock.client.rpc).toHaveBeenCalledWith(
      'increment_task_pomodoro',
      expect.objectContaining({ task_id_input: TASK_ID }),
    );
  });

  it("records the session without a task when the task isn't owned", async () => {
    const mock = setup({ tasks: { data: null } });
    const res = await POST(
      jsonRequest(URL, { taskId: TASK_ID, durationSec: 300, mode: 'shortBreak' }),
    );

    expect(res.status).toBe(200);
    const insert = mock.callsFor('sessions').find((c) => c.method === 'insert');
    expect(insert?.args[0]).toEqual(expect.objectContaining({ task_id: null }));
    expect(mock.client.rpc).not.toHaveBeenCalled();
  });

  it('ignores a malformed taskId instead of querying with it', async () => {
    const mock = setup();
    const res = await POST(
      jsonRequest(URL, { taskId: 'x),id.neq.(y', durationSec: 300, mode: 'work' }),
    );

    expect(res.status).toBe(200);
    expect(mock.callsFor('tasks')).toHaveLength(0);
  });
});
