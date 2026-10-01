'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/contexts/i18n-context';
import { useTimerStore } from '@/stores/timer-store';
import { getTimerAnnouncement, type AnnouncerState } from './timer-announcement';

/** Visually hidden polite live region announcing timer events to screen readers. */
export function TimerLiveAnnouncer() {
  const { t } = useI18n();
  const tRef = useRef(t);
  tRef.current = t;
  const [message, setMessage] = useState('');

  useEffect(() => {
    const pick = (s: AnnouncerState): AnnouncerState => ({
      mode: s.mode,
      timeLeft: s.timeLeft,
      isRunning: s.isRunning,
    });
    let prev = pick(useTimerStore.getState());
    return useTimerStore.subscribe((state) => {
      const next = pick(state);
      const text = getTimerAnnouncement(prev, next, tRef.current);
      prev = next;
      if (text) setMessage(text);
    });
  }, []);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
