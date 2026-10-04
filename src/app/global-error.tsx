'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LANG, type Lang } from '@/lib/i18n/negotiate-locale';
import { detectErrorLang, globalErrorCopy } from '@/lib/i18n/global-error-copy';

// Replaces the root layout when it fails: no providers, so it carries its own en/vi/ja copy.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // English on the server and first paint, then the visitor's language once the browser is known
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  useEffect(() => {
    setLang(detectErrorLang(document.cookie, navigator.language));
  }, []);
  const copy = globalErrorCopy(lang);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={lang}>
      <body
        style={{ margin: 0, background: '#110f0e', color: '#f5f5f4' }}
        className="font-sans"
      >
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
        >
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="max-w-md text-sm opacity-80">
            {copy.description}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white"
            >
              {copy.retry}
            </button>
            {/* Plain anchor: the router may be unusable at this level */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium"
            >
              {copy.goHome}
            </a>
          </div>
          {error.digest && (
            <p className="text-xs opacity-60">{copy.reference(error.digest)}</p>
          )}
        </div>
      </body>
    </html>
  );
}
