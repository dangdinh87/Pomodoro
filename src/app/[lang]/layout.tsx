/**
 * Root layout, one per language (`/`, `/vi`, `/ja`; English is served from `/en` via the proxy
 * rewrite). The language comes from the route param, never from a cookie or header, so every
 * page under it can be generated at build time. `generateStaticParams` + `dynamicParams = false`
 * make any other first segment a 404.
 * Providers other than i18n live in the group layouts ((main), (landing)).
 */
import type { Metadata, Viewport } from 'next';
import { I18nProvider } from '@/contexts/i18n-context';
import { SITE_URL } from '@/config/site';
import { LanguageSuggestion } from '@/components/layout/language-suggestion';
import { GoogleAnalytics } from '@/components/trackings/ga';
import { loadMessages } from '@/lib/i18n/messages';
import { SUPPORTED_LANGS } from '@/lib/i18n/negotiate-locale';
import { routeLang, type LangParams } from '@/lib/i18n/route-lang';
import { Analytics } from '@vercel/analytics/next';
import { fontVariables } from '../fonts';
import '../globals.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
} & LangParams) {
  const lang = await routeLang(params);
  const messages = await loadMessages(lang);

  return (
    <html lang={lang} suppressHydrationWarning className={fontVariables}>
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
        <I18nProvider locale={lang} messages={messages}>
          {children}
          <LanguageSuggestion />
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
