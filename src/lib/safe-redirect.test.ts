import { toSafeRedirectPath } from './safe-redirect';

describe('toSafeRedirectPath', () => {
  it.each([
    ['/tasks', '/tasks'],
    ['/tasks?view=board#top', '/tasks?view=board#top'],
    ['/reset-password', '/reset-password'],
    ['history', '/history'],
  ])('keeps same-origin path %p', (input, expected) => {
    expect(toSafeRedirectPath(input)).toBe(expected);
  });

  it.each([
    ['https://evil.com'],
    ['//evil.com'],
    ['/\\evil.com'],
    ['/\\/evil.com'],
    ['\\\\evil.com'],
    ['javascript:alert(1)'],
    ['https:evil.com'],
    // Dot segments that normalize into a protocol-relative path
    ['/.//evil.com'],
    ['/..//evil.com'],
    ['/a/..//evil.com'],
    ['/%2e//evil.com'],
    ['/./\\evil.com'],
  ])('rejects cross-origin target %p', (input) => {
    const result = toSafeRedirectPath(input);
    expect(result).toBe('/timer');
    // Whatever we return must stay on our origin when resolved by the caller
    expect(new URL(result, 'https://www.pomodoro-focus.site').origin).toBe(
      'https://www.pomodoro-focus.site',
    );
  });

  it('keeps encoded slashes harmless (they stay in the path)', () => {
    const result = toSafeRedirectPath('/%2F/evil.com');
    expect(new URL(result, 'https://app.test').origin).toBe('https://app.test');
  });

  it('falls back when target is missing', () => {
    expect(toSafeRedirectPath(null)).toBe('/timer');
    expect(toSafeRedirectPath(undefined)).toBe('/timer');
    expect(toSafeRedirectPath('')).toBe('/timer');
  });

  it('uses the provided fallback', () => {
    expect(toSafeRedirectPath('//evil.com', '/login')).toBe('/login');
  });
});
