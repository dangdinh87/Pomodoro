/**
 * @jest-environment node
 */
import { DELETE } from './route';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createSupabaseMock, createQueryBuilder } from '@/test-utils/supabase-mock';

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }));
jest.mock('@/lib/supabase-admin', () => ({ createAdminClient: jest.fn() }));

const USER = { id: 'user-1', email: 'a@b.co' };
const del = (body: unknown, headers: Record<string, string> = {}) =>
  DELETE(
    new Request('http://localhost/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
  );

function setupAdmin(failTable?: string) {
  const fromCalls: string[] = [];
  const builders: Record<string, ReturnType<typeof createQueryBuilder>> = {};
  const admin = {
    from: jest.fn((table: string) => {
      fromCalls.push(table);
      return (builders[table] = createQueryBuilder(
        table === failTable ? { error: { message: 'boom' } } : {},
      ));
    }),
    auth: { admin: { deleteUser: jest.fn().mockResolvedValue({ error: null }) } },
  };
  (createAdminClient as jest.Mock).mockReturnValue(admin);
  return { admin, fromCalls, builders };
}

describe('DELETE /api/account', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(createSupabaseMock({ user: USER }).client);
  });

  it('rejects cross-site Origin and non-JSON content type with 403', async () => {
    expect((await del({ confirm: 'a@b.co' }, { origin: 'https://evil.test' })).status).toBe(403);
    const plain = new Request('http://localhost/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ confirm: 'a@b.co' }),
    });
    expect((await DELETE(plain)).status).toBe(403);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('returns 401 when unauthenticated', async () => {
    (createClient as jest.Mock).mockResolvedValue(createSupabaseMock({ user: null }).client);
    expect((await del({ confirm: 'a@b.co' })).status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('returns 400 for a wrong confirmation', async () => {
    expect((await del({ confirm: 'other@b.co' })).status).toBe(400);
    expect((await del({})).status).toBe(400);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('returns 503 when the service key is not configured', async () => {
    (createAdminClient as jest.Mock).mockReturnValue(null);
    const res = await del({ confirm: 'a@b.co' });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'Account deletion is not configured' });
  });

  it('deletes every table then the auth user', async () => {
    const { admin, fromCalls, builders } = setupAdmin();
    const res = await del({ confirm: 'A@B.co' });
    expect(res.status).toBe(200);
    expect(fromCalls).toEqual(['feedbacks', 'sessions', 'tasks', 'streaks', 'user_tags', 'conversations', 'profiles']);
    expect(builders.feedbacks.calls[0]).toEqual({ method: 'update', args: [{ user_id: null }] });
    expect(builders.profiles.calls).toContainEqual({ method: 'eq', args: ['id', 'user-1'] });
    expect(builders.tasks.calls).toContainEqual({ method: 'eq', args: ['user_id', 'user-1'] });
    expect(admin.auth.admin.deleteUser).toHaveBeenCalledWith('user-1');
  });

  it('accepts the literal DELETE for users without an email', async () => {
    (createClient as jest.Mock).mockResolvedValue(createSupabaseMock({ user: { id: 'u2' } }).client);
    const { admin } = setupAdmin();
    expect((await del({ confirm: 'DELETE' })).status).toBe(200);
    expect(admin.auth.admin.deleteUser).toHaveBeenCalledWith('u2');
  });

  it('flags a partial failure when a later step fails', async () => {
    const { admin } = setupAdmin('profiles');
    const res = await del({ confirm: 'a@b.co' });
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ partial: true });
    expect(admin.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it('aborts with 500 on the first failure without deleting the auth user', async () => {
    const { admin, fromCalls } = setupAdmin('tasks');
    const res = await del({ confirm: 'a@b.co' });
    expect(res.status).toBe(500);
    expect(fromCalls).toEqual(['feedbacks', 'sessions', 'tasks']);
    expect(admin.auth.admin.deleteUser).not.toHaveBeenCalled();
  });
});
