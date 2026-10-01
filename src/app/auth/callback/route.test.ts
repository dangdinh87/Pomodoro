/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';

const exchangeCodeForSession = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({ auth: { exchangeCodeForSession } })),
}));

const ORIGIN = 'http://localhost:3000';

async function callback(query: string) {
  const res = await GET(new NextRequest(`${ORIGIN}/auth/callback?${query}`));
  return res.headers.get('location');
}

describe('GET /auth/callback', () => {
  beforeEach(() => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it('redirects to a same-origin next path', async () => {
    expect(await callback('code=abc&next=/tasks')).toBe(`${ORIGIN}/tasks`);
  });

  it.each([
    ['https://evil.com'],
    ['//evil.com'],
    ['/\\evil.com'],
    ['/.//evil.com'],
    ['/a/..//evil.com'],
  ])('never redirects off-site for next=%p', async (next) => {
    const location = await callback(`code=abc&next=${encodeURIComponent(next)}`);
    expect(location).toBe(`${ORIGIN}/timer`);
  });

  it('sends password recovery to /reset-password', async () => {
    expect(await callback('code=abc&type=recovery&next=//evil.com')).toBe(
      `${ORIGIN}/reset-password`,
    );
  });

  it('redirects to /login without a code', async () => {
    expect(await callback('next=/tasks')).toBe(`${ORIGIN}/login`);
  });

  it('redirects to /login with an error when the exchange fails', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: 'expired' } });
    expect(await callback('code=abc')).toBe(`${ORIGIN}/login?error=expired`);
  });
});
