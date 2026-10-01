/**
 * Root Layout - Server Component
 * NO client providers here to enable SSR for landing page
 * Providers are added in group-specific layouts ((main), (auth))
 */
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { InitialLangProvider } from '@/contexts/i18n-context';
import { LOCALE_COOKIE, normalizeLang } from '@/lib/i18n/negotiate-locale';
import { Be_Vietnam_Pro, Space_Grotesk, Nunito } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { AuthCodeHandler } from '@/components/auth/auth-code-handler';
import { LocatorSetup } from '@/components/dev/locator-setup';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Study Bro App',
  description:
    'Free Pomodoro timer with task management, focus sounds, break mini games and focus history. No signup required.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.pomodoro-focus.site'),
  // No root canonical: each indexable page declares its own (see page metadata)
  icons: {
    icon: [
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
    images: [
      {
        url: 'https://www.pomodoro-focus.site/card.jpg',
        width: 1280,
        height: 664,
        alt: 'Study Bro - Pomodoro Timer App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Bro - Free Pomodoro Timer & Focus Tools',
    description:
      'Free Pomodoro timer with task management, focus sounds and break mini games.',
    images: ['https://www.pomodoro-focus.site/card.jpg'],
  },
};

// Colors from globals.css: light --background (white), dark --background (24 10% 6%)
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#110f0e' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Locale cookie is set by middleware (Accept-Language) or the language switcher
  const lang = normalizeLang(cookies().get(LOCALE_COOKIE)?.value);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${beVietnamPro.variable} ${nunito.variable}`}>
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
              url: 'https://www.pomodoro-focus.site',
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
                'AI Study Coach (Bro Chat)',
                'Mini Games for Breaks',
                'Focus Mode Analytics',
                'Daily Streaks & Leaderboard',
                'Custom Themes & Ambient Sounds',
              ],
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              id="ga-loader"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}</Script>
          </>
        ) : null}
        <AuthCodeHandler />
        <InitialLangProvider lang={lang}>{children}</InitialLangProvider>
        <LocatorSetup />
        <Analytics />
      </body>
    </html>
  );
}
