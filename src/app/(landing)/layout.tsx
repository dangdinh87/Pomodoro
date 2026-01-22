/**
 * Landing Layout - with client providers for interactive components
 * SSR components use server-side translations
 * Client components (HowItWorks, Pricing, FAQ, etc.) use I18nProvider
 */
import { ThemeProvider } from '@/components/layout/theme-provider';
import { I18nProvider } from '@/contexts/i18n-context';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <div className="min-h-screen relative">
          <main className="relative z-10">{children}</main>
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}
