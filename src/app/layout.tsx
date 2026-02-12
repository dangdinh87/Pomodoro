/**
 * Root Layout - Server Component
 * NO client providers here to enable SSR for landing page
 * Providers are added in group-specific layouts ((main), (auth))
 */
import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Space_Grotesk, Nunito } from 'next/font/google';
import Script from 'next/script';
import { AuthCodeHandler } from '@/components/auth/auth-code-handler';
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
    'Free Pomodoro timer with task management, AI coach, mini games, focus analytics, and leaderboard. No signup required.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.pomodoro-focus.site'),
  alternates: {
    canonical: 'https://www.pomodoro-focus.site',
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
      'Free Pomodoro timer with task management, AI coach, mini games, focus analytics, and leaderboard.',
    url: 'https://www.pomodoro-focus.site',
    siteName: 'Study Bro',
    images: [
      {
        url: 'https://www.pomodoro-focus.site/card.jpg',
        width: 1200,
        height: 630,
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
      'Free Pomodoro timer with task management, AI coach, mini games, and analytics.',
    images: ['https://www.pomodoro-focus.site/card.jpg'],
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
              name: 'Study Bro',
              alternateName: 'Study Bro Pomodoro Timer',
              description:
                'Free online Pomodoro timer with AI coach, task management, mini games, leaderboard, and focus analytics.',
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
        {children}
      </body>
    </html>
  );
}
