/**
 * Root Layout - Server Component
 * NO client providers here to enable SSR for landing page
 * Providers are added in group-specific layouts ((main), (auth))
 */
import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Space_Grotesk, Nunito } from 'next/font/google';
import Script from 'next/script';
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
  title: {
    default: 'Improcode - Focus Timer & Productivity',
    template: '%s | Improcode',
  },
  description:
    'Improcode - The ultimate Pomodoro timer with task management, AI coach, focus analytics, and gamification. Boost your productivity today. No signup required.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://improcode.com'),
  alternates: {
    canonical: 'https://improcode.com',
  },
  keywords: [
    'Improcode',
    'Improcode AI',
    'pomodoro timer',
    'focus timer',
    'pomodoro timer online free',
    'study timer',
    'pomodoro timer with tasks',
    'productivity tool',
    'gamified focus timer',
  ],
  openGraph: {
    title: 'Improcode - Focus Timer & Productivity',
    description:
      'The ultimate Pomodoro timer with task management, AI coach, focus analytics, and gamification. Boost your productivity today.',
    url: 'https://improcode.com',
    siteName: 'Improcode',
    images: [
      {
        url: 'https://improcode.com/card.jpg',
        width: 1200,
        height: 630,
        alt: 'Improcode - Pomodoro Timer App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Improcode - Focus Timer & Productivity',
    description:
      'The ultimate Pomodoro timer with task management, AI coach, focus analytics, and gamification.',
    images: ['https://improcode.com/card.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${beVietnamPro.variable} ${nunito.variable}`}>
        {/* JSON-LD structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Improcode',
              alternateName: 'Improcode Pomodoro Timer',
              description:
                'Free online Pomodoro timer with AI coach, task management, mini games, leaderboard, and focus analytics.',
              url: 'https://improcode.com',
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
                'AI Study Coach (Improcode AI)',
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
        {children}
      </body>
    </html>
  );
}
