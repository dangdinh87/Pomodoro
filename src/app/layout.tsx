import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { BackgroundRenderer } from '@/components/background/background-renderer';
import { Toaster } from 'sonner';
import AppInitializer from '@/components/layout/app-initializer';
import GlobalLoader from '@/components/ui/global-loader';

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppInitializer>
            <BackgroundRenderer />
            {children}
            <Toaster />
            <GlobalLoader />
          </AppInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
