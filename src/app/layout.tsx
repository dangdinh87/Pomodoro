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
  title: 'Study Bro App',
  description:
    'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.pomodoro-focus.site'),
  keywords: [
    'Pomodoro Timer',
    'Study Timer',
    'Focus Timer',
    'Productivity Tool',
    'Study Bro',
    'Focus Enhancement',
    'Time Management',
  ],
  openGraph: {
    title: 'Study Bro App',
    description:
      'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
    url: 'https://www.pomodoro-focus.site',
    siteName: 'Study Bro App',
    images: [
      {
        url: '/card.jpg',
        width: 1200,
        height: 630,
        alt: 'Study Bro App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Bro App',
    description:
      'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
    images: ['/card.jpg'],
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
              description: 'AI-Powered Pomodoro Timer for Maximum Focus and Productivity',
              url: 'https://www.pomodoro-focus.site',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Pomodoro Timer',
                'Task Management',
                'Progress Analytics',
                'Ambient Sounds',
                'Daily Streaks',
                'Custom Themes',
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
