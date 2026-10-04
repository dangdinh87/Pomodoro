'use client';

import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Tomo, type TomoFace } from '@/components/brand/tomo';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

const POP = { type: 'spring', stiffness: 420, damping: 22 } as const;
const storageKey = (id: string) => `tomo-bubble:dismissed:${id}`;

// sessionStorage has no change events we care about: dismissals are written by this component only.
const subscribe = () => () => {};

function wasDismissed(id: string): boolean {
  try {
    return window.sessionStorage.getItem(storageKey(id)) === '1';
  } catch {
    return false;
  }
}

function rememberDismissed(id: string) {
  try {
    window.sessionStorage.setItem(storageKey(id), '1');
  } catch {
    // Private mode or blocked storage: the bubble still hides for this mount.
  }
}

interface TomoBubbleProps {
  face?: TomoFace;
  /** What Tomo says: one or two short sentences. */
  children: ReactNode;
  /** Called once when the bubble is dismissed. */
  onDismiss?: () => void;
  /** Remembers the dismissal for this browser session (sessionStorage). Without an id the bubble reappears on remount. */
  id?: string;
  /** Tomo's size in px. */
  tomoSize?: number;
  className?: string;
}

/**
 * Tomo with a speech bubble beside it. Pressing the bubble hides it; Tomo stays.
 * The bubble appears after hydration so a dismissed one never flashes. Tomo breathes unless reduced motion is on.
 */
export function TomoBubble({ face = 'happy', children, onDismiss, id, tomoSize = 64, className }: TomoBubbleProps) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  // Server and hydration render "dismissed" (no bubble); the client then reads the real answer from sessionStorage.
  const storedDismissed = useSyncExternalStore(subscribe, () => (id ? wasDismissed(id) : false), () => true);
  const [dismissedNow, setDismissedNow] = useState(false);
  const visible = !storedDismissed && !dismissedNow;

  const dismiss = () => {
    if (id) rememberDismissed(id);
    setDismissedNow(true);
    onDismiss?.();
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.div
        className="shrink-0"
        animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <Tomo face={face} size={tomoSize} />
      </motion.div>
      {visible && (
        <motion.button
          type="button"
          onClick={dismiss}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : POP}
          style={{ originX: 0, originY: 0.5 }}
          className="focus-ring relative min-w-0 flex-1 border-sticker rounded-lg bg-surface px-4 py-2.5 text-left text-[0.9375rem] font-semibold leading-snug text-ink shadow-sticker-sm"
        >
          {/* tail pointing at Tomo */}
          <span
            aria-hidden="true"
            className="absolute -left-[9px] top-1/2 size-4 -translate-y-1/2 rotate-45 border-b-[length:var(--outline-w)] border-l-[length:var(--outline-w)] border-outline bg-surface"
          />
          <span className="relative">{children}</span>{' '}
          <span className="sr-only">{t('tomoBubble.dismiss')}</span>
        </motion.button>
      )}
    </div>
  );
}
