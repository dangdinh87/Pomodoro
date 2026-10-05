'use client';

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Globe, X } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import {
  LANG_SUGGESTION_COPY,
  SUGGESTION_DISMISSED_KEY,
  suggestedLang,
} from '@/lib/i18n/lang-suggestion';

function wasDismissed(): boolean {
  try {
    return window.localStorage.getItem(SUGGESTION_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberDismissed() {
  try {
    window.localStorage.setItem(SUGGESTION_DISMISSED_KEY, '1');
  } catch {}
}

const noSubscription = () => () => {};

/** Height of the bar, read by the app stage in globals.css. */
const BANNER_HEIGHT_VAR = '--lang-banner-h';

/**
 * "This page is also available in Tiếng Việt": offered once when the browser (or an earlier
 * pick) prefers another supported language than the page's. It decides after mount, so the
 * server HTML, and what crawlers see, never contains it.
 *
 * An in-flow bar above the page, not a floating card: a fixed card always ended up over something (the
 * mascot bubble at 360px, the H1 of the guide, article text on desktop). The bar pushes the page down
 * instead and publishes its height as `--lang-banner-h`; the one-screen app stage (globals.css) hands that
 * height back, so bar + stage still fit one viewport and the timer card never meets the dock.
 */
export function LanguageSuggestion() {
  const { lang, setLang } = useI18n();
  const [closed, setClosed] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  // Read from the browser (cookie, navigator, storage); the server snapshot is "nothing", so
  // hydration matches the HTML and the banner shows right after it.
  const offer = useSyncExternalStore(
    noSubscription,
    () => {
      const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
      return suggestedLang({ current: lang, cookie: document.cookie, languages, dismissed: wasDismissed() });
    },
    () => null,
  );

  const visible = Boolean(offer) && !closed;

  // Publish the bar's height (it wraps to more lines on a narrow screen) and take it back when it goes away.
  useLayoutEffect(() => {
    const el = bar.current;
    if (!visible || !el) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty(BANNER_HEIGHT_VAR, `${el.offsetHeight}px`);
    publish();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(publish);
    observer?.observe(el);
    return () => {
      observer?.disconnect();
      root.style.removeProperty(BANNER_HEIGHT_VAR);
    };
  }, [visible]);

  if (!offer || closed) return null;
  const copy = LANG_SUGGESTION_COPY[offer];

  const dismiss = () => {
    rememberDismissed();
    setClosed(true);
  };

  return (
    <div
      ref={bar}
      role="region"
      aria-label={copy.message}
      lang={offer}
      data-lang-suggestion
      className="border-b-[length:var(--outline-w)] border-outline bg-surface-raised px-[clamp(16px,4vw,32px)] py-2.5 text-ink"
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-3 gap-y-2">
        <p className="flex min-w-0 grow basis-64 items-center gap-2.5 text-sm font-semibold leading-snug">
          <Globe size={22} weight="bold" className="shrink-0 text-ink-secondary" aria-hidden="true" />
          <span className="min-w-0">{copy.message}</span>
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Button
            size="sm"
            onClick={() => {
              // Taking the offer is not a "no thanks": the cookie now remembers the choice
              setClosed(true);
              setLang(offer);
            }}
          >
            {copy.action}
          </Button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={copy.dismiss}
            className="focus-ring shrink-0 rounded-md p-1.5 text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
