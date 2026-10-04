'use client';

import { useEffect, useState } from 'react';
import { Tomo } from '@/components/brand/tomo';
import { localePath } from '@/lib/i18n/locale-path';
import { DEFAULT_LANG, type Lang } from '@/lib/i18n/negotiate-locale';
import { detectErrorLang, globalErrorCopy } from '@/lib/i18n/global-error-copy';
import { reportClientError } from '@/lib/observability/report-client-error';

/*
 * Replaces the root layout when it fails: no providers, no globals.css, no next/font. So the page
 * is self-contained: its own <html>/<body>, its own en/vi/ja copy and its own small stylesheet with
 * the same sticker tokens (values copied from globals.css). Tomo reads the --candy-* / --outline /
 * --on-accent variables, so they are declared here too. Only plain CSS is used, nothing relies on Tailwind.
 */
const LIGHT = `
  --surface-page:#FFF3E0; --surface:#FFFCF6; --ink:#2A1A14; --ink-secondary:#5A4038;
  --outline:#2A1A14; --on-accent:#2A1A14; --accent:#C2330F;`;
const DARK = `
  --surface-page:#1A120F; --surface:#2E221C; --ink:#FFF3E0; --ink-secondary:#E8D5C0;
  --outline:#0B0705; --accent:#FF8A6B;`;

const CSS = `
  html { ${LIGHT}
    --candy-tomato:#FF5A36; --candy-butter:#FFD45C; --candy-sky:#7CC8FF; --candy-mint:#7BDCB5; --candy-lilac:#C9B6FF;
    color-scheme: light; }
  html[data-theme='dark'] { ${DARK} color-scheme: dark; }
  @media (prefers-color-scheme: dark) { html[data-theme='system'] { ${DARK} color-scheme: dark; } }
  body { margin:0; min-height:100vh; min-height:100dvh; display:grid; place-items:center; padding:48px 16px; box-sizing:border-box;
    background:var(--surface-page); color:var(--ink);
    font-family: ui-rounded, system-ui, -apple-system, 'Segoe UI', 'Hiragino Maru Gothic ProN', 'Yu Gothic', Meiryo, sans-serif;
    line-height:1.6; -webkit-font-smoothing:antialiased; }
  .ge-card { width:100%; max-width:28rem; box-sizing:border-box; padding:32px; text-align:center; background:var(--surface);
    border:2.5px solid var(--outline); border-radius:28px; box-shadow:6px 6px 0 var(--outline); }
  .ge-card h1 { margin:16px 0 0; font-size:1.625rem; font-weight:800; line-height:1.15; letter-spacing:-0.02em; }
  .ge-card p { margin:12px 0 0; color:var(--ink-secondary); }
  .ge-actions { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-top:28px; }
  .ge-btn { display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; height:50px; padding:0 24px;
    border:2.5px solid var(--outline); border-radius:12px; box-shadow:4px 4px 0 var(--outline); color:var(--ink);
    font:inherit; font-weight:800; font-size:1rem; line-height:1; text-decoration:none; cursor:pointer;
    transition:transform .08s ease, box-shadow .08s ease; }
  .ge-btn:hover { transform:translate(-1px,-1px); box-shadow:5px 5px 0 var(--outline); }
  .ge-btn:active { transform:translate(4px,4px); box-shadow:0 0 0 var(--outline); }
  .ge-btn:focus-visible { outline:3px solid var(--accent); outline-offset:3px; }
  .ge-primary { background:#FF5A36; color:#2A1A14; }
  .ge-secondary { background:var(--surface); }
  .ge-ref { font-size:.75rem; word-break:break-all; }
  @media (prefers-reduced-motion: reduce) { .ge-btn { transition:none; } }
`;

type SavedTheme = 'light' | 'dark' | 'system';

/** next-themes keeps the choice under `theme` in localStorage; anything unknown means the default, light. */
function readSavedTheme(): SavedTheme {
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || saved === 'system' ? saved : 'light';
  } catch {
    return 'light';
  }
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // English and light on the server and first paint, then the language of the URL and the saved theme once the browser is known
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [theme, setTheme] = useState<SavedTheme>('light');
  useEffect(() => {
    setLang(detectErrorLang(window.location.pathname));
    setTheme(readSavedTheme());
  }, []);
  const copy = globalErrorCopy(lang);

  useEffect(() => {
    console.error(error);
    reportClientError(error, 'global-error');
  }, [error]);

  return (
    <html lang={lang} data-theme={theme}>
      <body>
        {/* React hoists <title> into the head; the stylesheet stays here so it works without any head control */}
        <title>{copy.title}</title>
        <style>{CSS}</style>
        <div role="alert" className="ge-card">
          <Tomo face="worried" size={128} />
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <div className="ge-actions">
            <button type="button" onClick={() => reset()} className="ge-btn ge-primary">
              {copy.retry}
            </button>
            {/* Plain anchor: the router may be unusable at this level */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href={localePath(lang, '/')} className="ge-btn ge-secondary">
              {copy.goHome}
            </a>
          </div>
          {error.digest && <p className="ge-ref">{copy.reference(error.digest)}</p>}
        </div>
      </body>
    </html>
  );
}
