'use client';

import { Suspense, useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { parseGaId, type GaConfig } from './ga-id';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// How long to wait for gtag.js (blocked by an ad blocker, or slow) before giving up
const GTAG_POLL_MS = 200;
const GTAG_GIVE_UP_MS = 10_000;

/** Official Tag Manager loader. The ID is validated by `parseGaId`, so it is safe inside the script. */
const gtmSnippet = (id: string) =>
  `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;

/**
 * Google Analytics 4 (`G-…`, gtag.js) or Tag Manager (`GTM-…`), chosen by the shape of
 * NEXT_PUBLIC_GA_ID. Renders nothing for an empty or malformed ID.
 *
 * With gtag the automatic page_view is switched off: `GATracking` sends one per route
 * change, the first load included, so nothing is counted twice.
 */
export function GoogleAnalytics() {
  const ga = parseGaId(process.env.NEXT_PUBLIC_GA_ID);
  if (!ga) return null;

  return (
    <>
      {ga.kind === 'gtm' ? (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {gtmSnippet(ga.id)}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${ga.id}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      ) : (
        <>
          <Script
            id="ga-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga.id}`}
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga.id}', { send_page_view: false });
          `}</Script>
        </>
      )}
      {/* useSearchParams needs a Suspense boundary so static pages stay static */}
      <Suspense fallback={null}>
        <GATracking />
      </Suspense>
    </>
  );
}

/** Runs `send` once gtag exists (the init script may not have run yet); returns a canceller. */
function whenGtagReady(send: () => void): () => void {
  if (typeof window.gtag === 'function') {
    send();
    return () => {};
  }
  const poll = setInterval(() => {
    if (typeof window.gtag === 'function') {
      clearInterval(poll);
      clearTimeout(giveUp);
      send();
    }
  }, GTAG_POLL_MS);
  const giveUp = setTimeout(() => clearInterval(poll), GTAG_GIVE_UP_MS);
  return () => {
    clearInterval(poll);
    clearTimeout(giveUp);
  };
}

function reportPageView(ga: GaConfig, params: Record<string, string>, isFirst: boolean, done: () => void) {
  if (ga.kind === 'gtm') {
    // The container reports the first load itself; it needs a dataLayer event for each later route
    if (!isFirst) {
      (window.dataLayer ??= []).push({ event: 'page_view', ...params });
    }
    done();
    return () => {};
  }
  return whenGtagReady(() => {
    window.gtag?.('event', 'page_view', params);
    done();
  });
}

/** One page_view per route change (App Router navigations do not reload the page). */
export default function GATracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrl = useRef<string | null>(null);
  const reportedOnce = useRef(false);

  useEffect(() => {
    const ga = parseGaId(process.env.NEXT_PUBLIC_GA_ID);
    if (!ga) return;
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (lastUrl.current === url) return;

    return reportPageView(
      ga,
      { page_path: url, page_location: window.location.href, page_title: document.title },
      !reportedOnce.current,
      () => {
        // Remembered only once it was really sent, so a re-run (StrictMode) still sends it
        lastUrl.current = url;
        reportedOnce.current = true;
      },
    );
  }, [pathname, searchParams]);

  return null;
}
