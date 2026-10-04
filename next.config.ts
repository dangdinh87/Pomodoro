import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content-Security-Policy, shipped as Report-Only first: violations show up in
 * the browser console without breaking anything, and are posted to /api/csp-report
 * (report-uri for Firefox/Safari, report-to + Reporting-Endpoints for Chrome), which
 * logs them. Once a deploy shows no unexpected reports, rename the header to
 * `Content-Security-Policy` to enforce.
 * External origins: YouTube iframe API/embeds, Google Analytics, Open-Meteo.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.youtube.com https://s.ytimg.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // youtube.com: oEmbed lookups (src/lib/youtube-utils.ts); open-meteo: forecast and place search
  // for the ambient-mood feature; the rest: GA4 beacons
  "connect-src 'self' https://www.youtube.com https://api.open-meteo.com https://geocoding-api.open-meteo.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com",
  "media-src 'self' data: blob: https:",
  'frame-src https://www.youtube.com https://www.youtube-nocookie.com',
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'report-uri /api/csp-report',
  'report-to csp-endpoint',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
  // Names the `csp-endpoint` group used by `report-to` above
  { key: 'Reporting-Endpoints', value: 'csp-endpoint="/api/csp-report"' },
  // Clickjacking protection. This is the ONLY framing protection for now:
  // browsers ignore frame-ancestors in a Report-Only policy. DENY also blocks
  // embedding the timer in other sites (e.g. Notion); relax deliberately if wanted.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Features the app never uses; fullscreen and autoplay stay allowed (timer, audio)
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  // HSTS is already sent by Vercel (max-age=63072000)
];

// Domain move: the old domain and www.<new> 308 to the canonical origin (src/config/site.ts).
// Off until the new domain serves this project — turning it on earlier would send
// every visitor of the old domain to an address that doesn't resolve. Set DOMAIN_MOVE=1.
const domainMoveRedirects =
  process.env.DOMAIN_MOVE === '1'
    ? [
        {
          source: '/:path*',
          has: [{ type: 'host' as const, value: '(?:(?:www\\.)?pomodoro-focus\\.site|www\\.studywithbro\\.com)' }],
          destination: 'https://studywithbro.com/:path*',
          permanent: true,
        },
      ]
    : [];

const nextConfig: NextConfig = {
  // Type and lint errors fail the build (also enforced in CI).
  poweredByHeader: false,
  // PGlite loads its WASM and data files from disk at runtime.
  serverExternalPackages: ['@electric-sql/pglite'],
  // PGlite is local-only (src/db/index.ts needs DATABASE_URL on Vercel), but the file tracer follows
  // even a string-literal dynamic import, so its ~10 MB of WASM and data would still ship in every
  // serverless function. pnpm keeps the real files under node_modules/.pnpm, hence two patterns.
  outputFileTracingExcludes: {
    '/*': ['node_modules/@electric-sql/pglite/**', 'node_modules/.pnpm/@electric-sql+pglite@*/**'],
  },
  // The /dist/ssr barrel re-exports ~1500 icons; without this every page compiles all of them.
  modularizeImports: {
    '@phosphor-icons/react/dist/ssr': {
      transform: '@phosphor-icons/react/dist/ssr/{{member}}',
      skipDefaultConversion: true,
    },
  },
  images: {
    // Only hosts the app actually renders through next/image. A wildcard here
    // turns /_next/image into an open proxy billed to this project.
    remotePatterns: [
      { protocol: 'https', hostname: '**.googleusercontent.com' }, // Google OAuth avatars
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      ...domainMoveRedirects,
      // One-page app: former pages open as panels on `/` (see src/features/app-shell).
      { source: '/timer', destination: '/', permanent: true },
      { source: '/tasks', destination: '/?panel=tasks', permanent: true },
      { source: '/history', destination: '/?panel=stats', permanent: true },
      { source: '/progress', destination: '/?panel=stats', permanent: true },
      { source: '/focus', destination: '/?panel=stats', permanent: true },
      { source: '/settings', destination: '/?panel=settings', permanent: true },
      { source: '/entertainment', destination: '/?panel=arcade', permanent: true },
      { source: '/feedback', destination: '/?panel=feedback', permanent: true },
      { source: '/login', destination: '/?panel=login', permanent: true },
      { source: '/signup', destination: '/?panel=login', permanent: true },
      { source: '/reset-password', destination: '/?panel=login', permanent: true },
      // Pages that were cut for good: old links and search results land on the app
      { source: '/leaderboard', destination: '/', permanent: true },
      { source: '/chat', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
