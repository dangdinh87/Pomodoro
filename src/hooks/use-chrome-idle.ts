'use client';

import { useEffect } from 'react';

const IDLE_MS = 3000;

/**
 * While `enabled` (timer running), fades app chrome marked `data-chrome` after a few
 * seconds without pointer/keyboard activity. Styling lives in globals.css.
 */
export function useChromeIdle(enabled: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    if (!enabled) {
      delete root.dataset.chromeIdle;
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const wake = () => {
      delete root.dataset.chromeIdle;
      clearTimeout(timer);
      timer = setTimeout(() => {
        root.dataset.chromeIdle = 'true';
      }, IDLE_MS);
    };

    const events = ['pointermove', 'pointerdown', 'keydown', 'focusin', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    wake();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, wake));
      delete root.dataset.chromeIdle;
    };
  }, [enabled]);
}
