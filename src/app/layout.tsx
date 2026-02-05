/**
 * Root Layout - Server Component
 * NO client providers here to enable SSR for landing page
 * Providers are added in group-specific layouts ((main), (auth))
 */
import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Space_Grotesk } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Improcode - Pomodoro Focus Timer',
  description:
    'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking. Improcode Every Day.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://improcode.com'),
  keywords: [
    'Pomodoro Timer',
    'Study Timer',
    'Focus Timer',
    'Productivity Tool',
    'Improcode',
    'Focus Enhancement',
    'Time Management',
  ],
  openGraph: {
    title: 'Improcode - Pomodoro Focus Timer',
    description:
      'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking. Improcode Every Day.',
    url: 'https://improcode.com',
    siteName: 'Improcode',
    images: [
      {
        url: '/card.jpg',
        width: 1200,
        height: 630,
        alt: 'Improcode',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Improcode - Pomodoro Focus Timer',
    description:
      'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking. Improcode Every Day.',
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
      <body className={`${spaceGrotesk.variable} ${beVietnamPro.variable}`}>
        {/* JSON-LD structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Improcode',
              description: 'AI-Powered Pomodoro Timer for Maximum Focus and Productivity. Improcode Every Day.',
              url: 'https://improcode.com',
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
