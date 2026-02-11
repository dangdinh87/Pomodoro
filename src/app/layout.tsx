/**
 * Root Layout - Server Component
 * NO client providers here to enable SSR for landing page
 * Providers are added in group-specific layouts ((main), (auth))
 */
import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Space_Grotesk, Nunito } from 'next/font/google';
import Script from 'next/script';
import { JsonLd } from '@/components/seo/JsonLd';
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
    template: '%s | Improcode',
    default: 'Improcode - Focus Timer & Productivity AI',
  },
  description:
    'Free Pomodoro timer with task management, AI coach, mini games, focus analytics, and leaderboard. No signup required.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://improcode.com'),
  alternates: {
    canonical: 'https://improcode.com',
  },
  keywords: [
    'pomodoro timer',
    'pomodoro timer online free',
    'study timer',
    'focus timer',
    'pomodoro timer with tasks',
    'free pomodoro timer no signup',
    'productivity tool',
    'Improcode',
    'Improcode AI',
    'focus app',
    'study with me',
  ],
  openGraph: {
    title: 'Improcode - Master Your Focus with AI & Pomodoro',
    description:
      'Free Pomodoro timer with task management, AI coach, mini games, focus analytics, and leaderboard.',
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
    title: 'Improcode - Master Your Focus with AI & Pomodoro',
    description:
      'Free Pomodoro timer with task management, AI coach, mini games, and analytics.',
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
        <JsonLd />
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
