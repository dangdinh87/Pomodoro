/**
 * Root layout of the dev-only gallery (/dev/ui, a 404 in production). It sits outside the
 * `[lang]` tree on purpose (the proxy leaves /dev alone), so it brings its own document and an
 * English-only i18n provider.
 */
import { I18nProvider } from '@/contexts/i18n-context';
import { loadMessages } from '@/lib/i18n/messages';
import { fontVariables } from '../fonts';
import '../globals.css';

export default async function DevLayout({ children }: { children: React.ReactNode }) {
  const messages = await loadMessages('en');
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body>
        <I18nProvider locale="en" messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
