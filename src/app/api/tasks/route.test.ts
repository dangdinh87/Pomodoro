/**
 * @jest-environment node
 */
import { GET, POST } from './route';
import { createClient } from '@/lib/supabase-server';
import { createSupabaseMock, jsonRequest, type SupabaseMockOptions } from '@/test-utils/supabase-mock';

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }));

const USER = { id: '11111111-1111-4111-8111-111111111111' };
const PARENT_ID = '33333333-3333-4333-8333-333333333333';

function setup(tables: SupabaseMockOptions['tables'] = {}) {
  const mock = createSupabaseMock({
    user: USER,
    tables: { tasks: { data: [], count: 0 }, ...tables },
  });
  (createClient as jest.Mock).mockResolvedValue(mock.client);
  return mock;
}

const callArgs = (mock: ReturnType<typeof setup>, method: string) =>
  mock.callsFor('tasks').filter((c) => c.method === method).map((c) => c.args);

describe('GET /api/tasks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('strips filter syntax from the search term', async () => {
    const mock = setup();
    await GET(new Request('http://localhost/api/tasks?q=x),is_deleted.eq.true,(y'));

    expect(callArgs(mock, 'or')).toEqual([
      ['title.ilike.%x  is_deleted.eq.true  y%,description.ilike.%x  is_deleted.eq.true  y%'],
    ]);
  });

  it('clamps limit and falls back on garbage paging params', async () => {
    const mock = setup();
    const res = await GET(new Request('http://localhost/api/tasks?limit=100000&page=abc'));
    const body = await res.json();

    expect(body).toEqual(expect.objectContaining({ limit: 100, page: 1 }));
    expect(callArgs(mock, 'range')).toEqual([[0, 99]]);
  });

  it('only filters on whitelisted date fields', async () => {
    const mock = setup();
    await GET(
      new Request('http://localhost/api/tasks?dateField=user_id&from=2026-01-01&to=nope'),
    );

    expect(callArgs(mock, 'gte')).toEqual([['created_at', '2026-01-01']]);
    expect(callArgs(mock, 'lte')).toEqual([]);
  });

  it('returns 401 without a user', async () => {
    const mock = createSupabaseMock({ user: null });
    (createClient as jest.Mock).mockResolvedValue(mock.client);
    const res = await GET(new Request('http://localhost/api/tasks'));
    expect(res.status).toBe(401);
  });

  it.each([['a,b'], ['x}'], ['"q']])('rejects malformed tag filter %p', async (tag) => {
    const mock = setup();
    const res = await GET(new Request(`http://localhost/api/tasks?tag=${encodeURIComponent(tag)}`));

    expect(res.status).toBe(400);
    expect(callArgs(mock, 'contains')).toEqual([]);
  });

  it('caps the page number', async () => {
    const mock = setup();
    await GET(new Request('http://localhost/api/tasks?page=9007199254740991&limit=10'));
    expect(callArgs(mock, 'range')).toEqual([[99_990, 99_999]]);
  });

  it('strips LIKE wildcards from the search term', async () => {
    const mock = setup();
    await GET(new Request('http://localhost/api/tasks?q=%25%25%25*'));
    expect(callArgs(mock, 'or')).toEqual([]);
  });
});

describe('POST /api/tasks', () => {
  beforeEach(() => jest.clearAllMocks());

  it("rejects a parent task the user doesn't own", async () => {
    const mock = setup({ tasks: { data: null } });
    const res = await POST(
      jsonRequest('http://localhost/api/tasks', { title: 'Sub', parent_task_id: PARENT_ID }),
    );

    expect(res.status).toBe(400);
    expect(callArgs(mock, 'insert')).toEqual([]);
  });

  it('creates a subtask under an owned parent', async () => {
    const mock = setup({
      tasks: [{ data: { id: PARENT_ID } }, { data: { id: 'new-task' } }],
    });
    const res = await POST(
      jsonRequest('http://localhost/api/tasks', { title: 'Sub', parent_task_id: PARENT_ID }),
    );

    expect(res.status).toBe(201);
    expect(callArgs(mock, 'insert')[0][0]).toEqual(
      expect.objectContaining({ user_id: USER.id, parent_task_id: PARENT_ID }),
    );
  });

  it('does not leak database error messages', async () => {
    setup({ tasks: { data: null, error: { message: 'relation "tasks" column x does not exist' } } });
    const res = await POST(jsonRequest('http://localhost/api/tasks', { title: 'A' }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('relation');
  });

  it('returns 400 for malformed JSON', async () => {
    setup();
    const res = await POST(jsonRequest('http://localhost/api/tasks', '{oops'));
    expect(res.status).toBe(400);
  });
});
