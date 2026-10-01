/** @vitest-environment node */
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

function req(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe('proxy locale cookie', () => {
  it('sets the cookie from Accept-Language', () => {
    const res = proxy(req('/guide', { 'accept-language': 'vi-VN,vi;q=0.9' }));
    expect(res.cookies.get('app.lang')?.value).toBe('vi');
  });

  it('defaults to en', () => {
    expect(proxy(req('/')).cookies.get('app.lang')?.value).toBe('en');
  });

  it('keeps an existing valid cookie untouched', () => {
    const res = proxy(req('/', { cookie: 'app.lang=ja', 'accept-language': 'vi' }));
    expect(res.cookies.get('app.lang')).toBeUndefined();
  });

  it('replaces an invalid cookie', () => {
    const res = proxy(req('/', { cookie: 'app.lang=xx', 'accept-language': 'ja' }));
    expect(res.cookies.get('app.lang')?.value).toBe('ja');
  });
});
