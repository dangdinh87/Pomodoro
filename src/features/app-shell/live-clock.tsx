'use client';

import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/contexts/i18n-context';

const INTL_LOCALE: Record<string, string> = { en: 'en-US', vi: 'vi-VN', ja: 'ja-JP' };

/**
 * Live wall-clock time (HH:MM:SS), separate from the Pomodoro countdown.
 * This whole app shell loads client-only (`app-home-client-only.tsx`, `ssr: false`),
 * so there is no server-rendered HTML to mismatch against — a plain client tick is safe.
 */
export function LiveClock({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(INTL_LOCALE[lang] ?? 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    [lang],
  );
  const formatted = formatter.format(now);

  return (
    <span
      className={`sticker-sm hidden h-9 items-center px-3 font-heading text-sm font-extrabold tabular-nums text-ink sm:inline-flex ${className}`}
      aria-label={`${t('shell.liveClock')} ${formatted}`}
    >
      {formatted}
    </span>
  );
}
