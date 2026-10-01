/** @jest-environment node */
const getUser = jest.fn();
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({ auth: { getUser } })),
}));

import { NextRequest } from 'next/server';
import { middleware, needsAuthCheck } from './middleware';

function req(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe('middleware locale cookie', () => {
  beforeEach(() => getUser.mockReset());

  it('sets cookie from Accept-Language on public pages without calling Supabase', async () => {
    const res = await middleware(req('/guide', { 'accept-language': 'vi-VN,vi;q=0.9' }));
    expect(res.cookies.get('app.lang')?.value).toBe('vi');
    expect(getUser).not.toHaveBeenCalled();
  });

  it('defaults to en', async () => {
    const res = await middleware(req('/'));
    expect(res.cookies.get('app.lang')?.value).toBe('en');
  });

  it('keeps an existing valid cookie untouched', async () => {
    const res = await middleware(
      req('/', { cookie: 'app.lang=ja', 'accept-language': 'vi' })
    );
    expect(res.cookies.get('app.lang')).toBeUndefined();
  });

  it('replaces an invalid cookie', async () => {
    const res = await middleware(req('/', { cookie: 'app.lang=xx', 'accept-language': 'ja' }));
    expect(res.cookies.get('app.lang')?.value).toBe('ja');
  });

  it('runs the Supabase check on auth paths and still sets the cookie', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await middleware(req('/tasks', { 'accept-language': 'ja' }));
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(res.cookies.get('app.lang')?.value).toBe('ja');
  });

  it('redirects logged-in users away from /login and keeps the cookie', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await middleware(req('/login'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/timer');
    expect(res.cookies.get('app.lang')?.value).toBe('en');
  });
});

describe('needsAuthCheck', () => {
  it('matches app/auth paths only', () => {
    expect(needsAuthCheck('/login')).toBe(true);
    expect(needsAuthCheck('/timer/x')).toBe(true);
    expect(needsAuthCheck('/')).toBe(false);
    expect(needsAuthCheck('/guide')).toBe(false);
    expect(needsAuthCheck('/timers')).toBe(false);
  });
});
