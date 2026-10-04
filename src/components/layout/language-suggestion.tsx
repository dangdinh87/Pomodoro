'use client';

import { useState, useSyncExternalStore } from 'react';
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

/**
 * "This page is also available in Tiếng Việt": offered once when the browser (or an earlier
 * pick) prefers another supported language than the page's. It decides after mount, so the
 * server HTML, and what crawlers see, never contains it. Fixed (no layout shift): under the top bar on
 * small screens, bottom-left on large ones, where it covers neither the timer nor the dock.
 */
export function LanguageSuggestion() {
  const { lang, setLang } = useI18n();
  const [closed, setClosed] = useState(false);
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

  if (!offer || closed) return null;
  const copy = LANG_SUGGESTION_COPY[offer];

  const dismiss = () => {
    rememberDismissed();
    setClosed(true);
  };

  return (
    <div
      role="region"
      aria-label={copy.message}
      lang={offer}
      className="fixed inset-x-3 top-[calc(4rem+env(safe-area-inset-top))] z-40 mx-auto flex max-w-lg items-center gap-3 rounded-lg border-sticker bg-surface p-3 text-ink shadow-sticker-sm lg:inset-x-auto lg:bottom-4 lg:left-4 lg:top-auto lg:mx-0 lg:max-w-lg"
    >
      <Globe size={22} weight="bold" className="shrink-0 text-ink-secondary" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">{copy.message}</p>
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
        className="focus-ring -mr-1 shrink-0 rounded-md p-1.5 text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
      >
        <X size={16} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}
