/**
 * @jest-environment node
 */
import { createClient } from '@/lib/supabase-server';
import * as leaderboard from './leaderboard/route';

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }));

const req = (method = 'GET') => new Request('http://localhost/api/x', { method });

describe('feature-gated APIs return 404 when the flag is off', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD;
  });

  it.each([
    ['leaderboard GET', () => leaderboard.GET(req())],
    ['leaderboard POST', () => leaderboard.POST(req('POST'))],
  ])('%s', async (_name, call) => {
    const res = await call();
    expect(res.status).toBe(404);
    expect(createClient).not.toHaveBeenCalled();
  });
});
