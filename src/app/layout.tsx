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

import Head from 'next/head';
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
  title: 'Study Bro App',
  description:
    'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Pomodoro Focus App',
    description: 'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
    url: 'https://www.pomodoro-focus.site',
    siteName: 'Pomodoro Focus App',
    images: [
      {
        url: 'https://www.pomodoro-focus.site/backgrounds/travelling7.jpg',
        width: 1200,
        height: 630,
        alt: 'Pomodoro Focus App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomodoro Focus App',
    description: 'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
    images: ['https://www.pomodoro-focus.site/backgrounds/travelling7.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  keywords: ['pomodoro', 'focus', 'productivity', 'timer', 'task management'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`${spaceGrotesk.variable} ${beVietnamPro.variable}`}>
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
