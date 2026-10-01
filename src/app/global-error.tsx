'use client';

import { useEffect } from 'react';

// Replaces the root layout when it fails: no providers, so static English only.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{ margin: 0, background: '#110f0e', color: '#f5f5f4' }}
        className="font-sans"
      >
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
        >
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-sm opacity-80">
            An unexpected error occurred. You can try again or head back home.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
            {/* Plain anchor: the router may be unusable at this level */}
            <a
              href="/"
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium"
            >
              Go to home
            </a>
          </div>
          {error.digest && (
            <p className="text-xs opacity-60">Reference: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
