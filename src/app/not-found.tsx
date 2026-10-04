/**
 * 404 for a first segment that is not a language (`/fr`, `/fr/guide`): there is no language
 * to translate into, so it is English. Unknown paths under a real language use `[lang]/not-found.tsx`.
 * It renders its own document because the root layout is a pass-through.
 */
import { NotFoundCard } from '@/components/shared/not-found-card';
import { getT } from '@/lib/server-translations';
import { fontVariables } from './fonts';
import './globals.css';

export default function RootNotFound() {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body>
        <NotFoundCard t={getT('en')} homeHref="/" guideHref="/guide" />
      </body>
    </html>
  );
}
