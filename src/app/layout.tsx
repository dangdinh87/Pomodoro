import { BackgroundRenderer } from '@/components/background/background-renderer';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import GATracker from '@/components/trackings/ga';
import { I18nProvider } from '@/contexts/i18n-context';
import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'sonner';
import './globals.css';
import { SupabaseAuthProvider } from '@/components/providers/supabase-auth-provider';

import NextTopLoader from 'nextjs-toploader';

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
  title: 'Improcode App',
  description:
    'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.improcode.com'),
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
    title: 'Improcode App',
    description:
      'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
    url: 'https://www.improcode.com',
    siteName: 'Improcode App',
    images: [
      {
        url: '/card.jpg',
        width: 1200,
        height: 630,
        alt: 'Improcode App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Improcode App',
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
      <body className={`${spaceGrotesk.variable} ${beVietnamPro.variable}`}>
        {/* Static content for bots/crawlers that don't execute JavaScript */}
        <noscript>
          <div id="seo-content">
            <h1>Improcode - AI-Powered Pomodoro Timer</h1>
            <p>
              Boost your productivity with Improcode. A comprehensive Pomodoro Timer
              web application featuring AI-powered insights, task management, ambient sounds,
              and detailed analytics for focus enhancement and productivity tracking.
            </p>
            <h2>Key Features</h2>
            <ul>
              <li>Smart Timer - Customizable Pomodoro sessions with focus analytics</li>
              <li>Task Management - Create, organize and track your daily tasks</li>
              <li>Progress Analytics - Detailed statistics and productivity insights</li>
              <li>Ambient Sounds - Background music and sounds for better focus</li>
              <li>Daily Streaks - Build habits with streak tracking</li>
              <li>Custom Themes - Personalize your workspace</li>
            </ul>
            <h2>Pricing</h2>
            <p>Free plan available with all essential features. Pro plan for advanced analytics.</p>
            <a href="/signup">Get Started Free</a>
            <a href="/login">Login</a>
          </div>
        </noscript>
        {/* JSON-LD structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Improcode',
              description: 'AI-Powered Pomodoro Timer for Maximum Focus and Productivity',
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader
            color="hsl(var(--primary))"
            showSpinner={false}
            height={3}
            crawlSpeed={200}
            speed={200}
          />
          <I18nProvider>
            <QueryProvider>
              <SupabaseAuthProvider />
              <BackgroundRenderer />
              {process.env.NEXT_PUBLIC_GA_ID ? <GATracker /> : null}
              {children}
              <Toaster />
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
