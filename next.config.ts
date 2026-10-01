import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content-Security-Policy, shipped as Report-Only first: violations show up in
 * the browser console without breaking anything. Once a deploy shows no
 * unexpected reports, rename the header to `Content-Security-Policy` to enforce.
 * External origins: YouTube iframe API/embeds, Google Analytics.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.youtube.com https://s.ytimg.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // youtube.com: oEmbed lookups (src/lib/youtube-utils.ts); the rest: GA4 beacons
  "connect-src 'self' https://www.youtube.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com",
  "media-src 'self' data: blob: https:",
  'frame-src https://www.youtube.com https://www.youtube-nocookie.com',
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
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

const nextConfig: NextConfig = {
  // Type and lint errors fail the build (also enforced in CI).
  poweredByHeader: false,
  // PGlite loads its WASM and data files from disk at runtime.
  serverExternalPackages: ['@electric-sql/pglite'],
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
    ];
  },
};

export default nextConfig;
