import { BackgroundRenderer } from '@/components/background/background-renderer';
import AppInitializer from '@/components/layout/app-initializer';
import { ThemeProvider } from '@/components/layout/theme-provider';
import GATracker from '@/components/trackings/ga';
import GlobalLoader from '@/components/ui/global-loader';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'sonner';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pomodoro Focus App',
  description:
    'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
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
          <AppInitializer>
            <BackgroundRenderer />
            <GATracker />
            {children}
            <Toaster />
            <GlobalLoader />
          </AppInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
