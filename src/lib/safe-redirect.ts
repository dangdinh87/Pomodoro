// Any fixed origin works: it is only used to resolve relative targets and then
// compared against, never exposed to the user.
const PLACEHOLDER_ORIGIN = 'http://placeholder.invalid';

/**
 * Normalize an untrusted redirect target (e.g. a `?next=` / `?redirect=` query
 * param) into a same-origin path.
 *
 * A plain `startsWith('/') && !startsWith('//')` check is NOT enough: browsers
 * and the WHATWG URL parser treat `\` like `/`, so `/\evil.com` resolves to
 * `https://evil.com`. Resolving against a placeholder origin and comparing
 * origins rejects every cross-origin form (absolute URLs, protocol-relative
 * URLs, backslash tricks, `javascript:` URLs).
 *
 * The normalized path is checked again: dot segments can collapse into a
 * protocol-relative path (`/.//evil.com`, `/a/..//evil.com`, `/%2e//evil.com`
 * all normalize to `//evil.com`), which callers would resolve to another host.
 */
export function toSafeRedirectPath(
  target: string | null | undefined,
  fallback = '/timer',
): string {
  if (!target) return fallback;

  try {
    const url = new URL(target, PLACEHOLDER_ORIGIN);
    if (url.origin !== PLACEHOLDER_ORIGIN) return fallback;

    const path = `${url.pathname}${url.search}${url.hash}`;
    if (/^\/[/\\]/.test(path)) return fallback;
    return path;
  } catch {
    return fallback;
  }
}
