/**
 * @jest-environment node
 */
import { PATCH, DELETE } from './route';
import { createClient } from '@/lib/supabase-server';
import { createSupabaseMock, jsonRequest, type SupabaseMockOptions } from '@/test-utils/supabase-mock';

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }));

const USER = { id: '11111111-1111-4111-8111-111111111111' };
const TASK_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TASK_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const URL = `http://localhost/api/tasks/${TASK_A}`;

function setup(tables: SupabaseMockOptions['tables'] = {}) {
  const mock = createSupabaseMock({ user: USER, tables });
  (createClient as jest.Mock).mockResolvedValue(mock.client);
  return mock;
}

const patch = (body: unknown) =>
  PATCH(jsonRequest(URL, body, { method: 'PATCH' }), { params: Promise.resolve({ id: TASK_A }) });

const updates = (mock: ReturnType<typeof setup>) =>
  mock.callsFor('tasks').filter((c) => c.method === 'update');

describe('PATCH /api/tasks/[id]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects nesting a task under itself', async () => {
    const mock = setup({ tasks: { data: { id: TASK_A, parent_task_id: null } } });
    const res = await patch({ parent_task_id: TASK_A });

    expect(res.status).toBe(400);
    expect(updates(mock)).toHaveLength(0);
  });

  it('rejects a parent cycle (A under B while B is under A)', async () => {
    const mock = setup({
      tasks: [
        { data: { id: TASK_B } }, // ownership check of B
        { data: { parent_task_id: TASK_A } }, // B's parent is A → cycle
      ],
    });
    const res = await patch({ parent_task_id: TASK_B });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.details.parent_task_id[0]).toMatch(/itself or its subtasks/);
    expect(updates(mock)).toHaveLength(0);
  });

  it('allows a parent outside the subtree', async () => {
    const mock = setup({
      tasks: [
        { data: { id: TASK_B } }, // ownership
        { data: { parent_task_id: null } }, // B is a root task
        { data: { id: TASK_A, parent_task_id: TASK_B } }, // update result
      ],
    });
    const res = await patch({ parent_task_id: TASK_B });

    expect(res.status).toBe(200);
    expect(updates(mock)).toHaveLength(1);
  });

  it('returns 404 when the task does not exist for this user', async () => {
    setup({ tasks: { data: null, error: { code: 'PGRST116', message: 'no rows' } } });
    const res = await patch({ title: 'Renamed' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for malformed JSON', async () => {
    setup();
    const res = await PATCH(jsonRequest(URL, '{bad', { method: 'PATCH' }), { params: Promise.resolve({ id: TASK_A }) });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/tasks/[id]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 404 when soft-deleting a missing task', async () => {
    setup({ tasks: { data: null, error: { code: 'PGRST116', message: 'no rows' } } });
    const res = await DELETE(new Request(URL, { method: 'DELETE' }), { params: Promise.resolve({ id: TASK_A }) });
    expect(res.status).toBe(404);
  });

  it('returns 401 without a user', async () => {
    const mock = createSupabaseMock({ user: null });
    (createClient as jest.Mock).mockResolvedValue(mock.client);
    const res = await DELETE(new Request(URL, { method: 'DELETE' }), { params: Promise.resolve({ id: TASK_A }) });
    expect(res.status).toBe(401);
  });
});
