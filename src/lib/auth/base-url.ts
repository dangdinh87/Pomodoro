import type { BetterAuthOptions } from 'better-auth';
import { SITE_HOST, SITE_URL } from '@/config/site';

type Env = Record<string, string | undefined>;

/** `example.com` and `www.example.com` both reach the site until the domain move redirects one of them. */
function withAndWithoutWww(host: string): string[] {
  return host.startsWith('www.') ? [host, host.slice(4)] : [host, `www.${host}`];
}

/**
 * The origin Better Auth builds its links from and checks POST `Origin` headers against.
 *
 * 1. `BETTER_AUTH_URL` when set (production sets it: README).
 * 2. `next dev`: none, so Better Auth takes each request's origin (localhost, or a LAN IP from a phone).
 * 3. Every other run without it (CI and local builds, `next start`, previews): the site origin
 *    (`SITE_URL`), or the request's own host when it is this deployment's (the hosts Vercel names in
 *    `VERCEL_URL` and friends) or a local one. A fixed SITE_URL alone would make a preview reject its
 *    own sign-in POSTs as cross-origin; no base URL at all made each `next build` worker print
 *    "Base URL is not set".
 */
export function authBaseURL(env: Env = process.env): BetterAuthOptions['baseURL'] {
  const explicit = env.BETTER_AUTH_URL?.trim();
  if (explicit) return explicit;
  if (env.NODE_ENV === 'development') return undefined;

  const deploymentHosts = [env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL]
    .map((host) => host?.trim())
    .filter((host): host is string => Boolean(host));
  return {
    allowedHosts: [...new Set([...withAndWithoutWww(SITE_HOST), ...deploymentHosts, 'localhost:*', '127.0.0.1:*'])],
    fallback: SITE_URL,
  };
}
