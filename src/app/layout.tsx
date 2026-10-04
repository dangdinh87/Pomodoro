/**
 * Pass-through root layout. The document (<html lang>, <body>) is rendered one level down by
 * `[lang]/layout.tsx` (or `dev/layout.tsx`), because the language comes from the URL. Keeping a
 * real root layout here is what lets `[lang]/not-found.tsx` render inside its language; with
 * the `[lang]` layout as the root, a `notFound()` falls back to Next's client-rendered error shell.
 *
 * It owns the metadata that is the same in every language: the origin every relative URL is
 * resolved against, the title template (`Guide | Study Bro`), icons and the manifest.
 * Language-specific metadata is built per page (`@/lib/seo/page-metadata`).
 */
import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Study Bro',
  // Pages give a bare title ("Privacy Policy"); the home sets its own absolute one. The default
  // only shows on routes without metadata of their own (e.g. the 404 for an unknown language).
  title: { default: 'Study Bro: Free Pomodoro Timer', template: '%s | Study Bro' },
  // One manifest for every language: it installs the same app from `/` (start_url) whatever page it was added from
  manifest: '/manifest.json',
  // No root canonical or openGraph.url: each indexable page declares its own (see buildPageMetadata)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

// Colors from globals.css: --surface-page in light (cream) and dark (chocolate)
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFF3E0' },
    { media: '(prefers-color-scheme: dark)', color: '#1A120F' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
