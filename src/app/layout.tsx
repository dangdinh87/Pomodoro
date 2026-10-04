/**
 * Root Layout - Server Component
 * NO client providers here to enable SSR for landing page
 * Providers are added in group-specific layouts ((main), (auth))
 */
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { InitialLangProvider } from '@/contexts/i18n-context';
import { SITE_URL } from '@/config/site';
import { LOCALE_COOKIE, normalizeLang } from '@/lib/i18n/negotiate-locale';
import { Baloo_2, Nunito, JetBrains_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@/components/trackings/ga';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// Both are variable fonts (Baloo 2 uses 600-800, Nunito 500-800): leaving `weight` out ships one
// file per subset for every weight instead of one per weight. Japanese has no web font on
// purpose; globals.css falls back to the system rounded Gothic.
const baloo2 = Baloo_2({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-baloo-2',
});

const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-nunito',
});

// Only shortcut hints and code use it: do not preload.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Study Bro App',
  description:
    'Free Pomodoro timer with task management, focus sounds, break mini games and focus history. No signup required.',
  manifest: '/manifest.json',
  metadataBase: new URL(SITE_URL),
  // No root canonical: each indexable page declares its own (see page metadata)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  keywords: [
    'pomodoro timer',
    'pomodoro timer online free',
    'study timer',
    'focus timer',
    'pomodoro timer with tasks',
    'free pomodoro timer no signup',
    'productivity tool',
    'Study Bro',
  ],
  openGraph: {
    title: 'Study Bro - Free Pomodoro Timer & Focus Tools',
    description:
      'Free Pomodoro timer with task management, focus sounds, break mini games and focus history.',
    // No `url` here: child pages would inherit the homepage og:url. Each
    // indexable page sets its own openGraph.url (see buildPageMetadata).
    siteName: 'Study Bro',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Bro - Free Pomodoro Timer & Focus Tools',
    description:
      'Free Pomodoro timer with task management, focus sounds and break mini games.',
  },
};

// Colors from globals.css: --surface-page in light (cream) and dark (chocolate)
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFF3E0' },
    { media: '(prefers-color-scheme: dark)', color: '#1A120F' },
  ],
};

export default async function RootLayout(
  {
    children,
  }: {
    children: React.ReactNode;
  }
) {
  // Locale cookie is set by middleware (Accept-Language) or the language switcher
  const lang = normalizeLang((await cookies()).get(LOCALE_COOKIE)?.value);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${baloo2.variable} ${nunito.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/* JSON-LD structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Study Bro',
              alternateName: 'Study Bro Pomodoro Timer',
              description:
                'Free online Pomodoro timer with task management, focus sounds, break mini games and focus history.',
              url: SITE_URL,
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web Browser',
              inLanguage: ['en', 'vi', 'ja'],
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Pomodoro Timer with Task Linking',
                'Mini Games for Breaks',
                'Focus Mode Analytics',
                'Daily Streaks',
                'Custom Themes & Ambient Sounds',
              ],
            }),
          }}
        />
        <GoogleAnalytics />
        <InitialLangProvider lang={lang}>{children}</InitialLangProvider>
        <Analytics />
      </body>
    </html>
  );
}
