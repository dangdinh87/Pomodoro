'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/i18n-context';
import { onSessionsDropped } from './session-recorder';

/** Tells the user, once, when offline sessions were too old (or too many) to be saved. */
export function useOutboxDropNotice() {
  const { t } = useI18n();
  // The subscription outlives renders; keep the language it speaks current
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(
    () =>
      onSessionsDropped(() => {
        toast.info(tRef.current('timer.outbox.dropped'), { id: 'outbox-dropped' });
      }),
    [],
  );
}
