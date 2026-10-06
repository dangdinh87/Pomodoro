'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Tomo } from '@/components/brand/tomo';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { StreakPill } from '@/components/ui/streak-pill';
import { useI18n } from '@/contexts/i18n-context';
import { useTimerStore } from '@/stores/timer-store';
import { type Celebration, useCelebrationStore } from './celebration-store';
import { fireCelebrationConfetti } from './fire-celebration-confetti';
import { pickTomoMood } from './pick-tomo-mood';
import { useTodayStats } from './use-today-stats';

/** With auto-start break on, the break is already running: the modal only lingers this long. */
const AUTO_CLOSE_MS = 5000;

/** Runs `fn` now if the tab is in view, otherwise the moment it comes back. Returns the cleanup. */
function whenVisible(fn: () => void): () => void {
  if (document.visibilityState === 'visible') {
    fn();
    return () => {};
  }
  const onChange = () => {
    if (document.visibilityState !== 'visible') return;
    document.removeEventListener('visibilitychange', onChange);
    fn();
  };
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

/**
 * The "session done" moment (spec §4.3): a tilted sticker with Tomo partying, a title from Tomo's lines,
 * the minutes and streak as pills, and a confetti burst. Opens only for a focus session that ran to its end
 * on its own (the engine announces it); skip, stop and reset never get here. The alarm and the browser
 * notification stay with the engine, so this adds nothing audible.
 */
export function SessionCelebration() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const pending = useCelebrationStore((state) => state.pending);
  const dismiss = useCelebrationStore((state) => state.dismiss);
  const { streak, todayFocusMinutes } = useTodayStats();

  // Keep the last celebration around so the content survives the exit animation after `pending` clears
  const [shown, setShown] = useState<Celebration | null>(null);
  if (pending && shown?.id !== pending.id) setShown(pending);

  const lineKey = useMemo(
    () =>
      pickTomoMood({
        mode: 'work',
        isRunning: false,
        justCompleted: true,
        streak: 0,
        todayFocusMinutes: 0,
        now: new Date(shown?.at ?? 0),
      }).lineKey,
    [shown?.at],
  );

  const id = pending?.id;
  useEffect(() => {
    if (id === undefined) return;
    const cleanups = [whenVisible(() => !reduceMotion && fireCelebrationConfetti())];
    if (useTimerStore.getState().settings.autoStartBreak) {
      cleanups.push(
        whenVisible(() => {
          const timer = window.setTimeout(dismiss, AUTO_CLOSE_MS);
          cleanups.push(() => window.clearTimeout(timer));
        }),
      );
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [id, reduceMotion, dismiss]);

  const takeBreak = () => {
    const { mode, isRunning, timeLeft, resumeTimer } = useTimerStore.getState();
    // The break was queued by the engine; with auto-start it is running already and this only closes
    if (mode !== 'work' && !isRunning && timeLeft > 0) resumeTimer();
    dismiss();
  };

  // The stats may not include this session yet (it is posted in the background): until they do, today still
  // reads zero and the streak lacks today, so count it here. Once they land the number stays the same.
  const days = todayFocusMinutes === 0 ? streak + 1 : Math.max(streak, 1);

  return (
    <Dialog open={pending !== null} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="tilt-l max-w-sm justify-items-center gap-3 text-center">
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -12, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5, ease: 'easeInOut' }}
        >
          <Tomo face="party" size={128} />
        </motion.div>
        <DialogTitle className="text-3xl">{lineKey ? t(lineKey) : ''}</DialogTitle>
        <DialogDescription className="sr-only">{t('tomo.celebration.summary', { count: shown?.minutes ?? 0 })}</DialogDescription>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex h-8 items-center rounded-full border-2 border-outline bg-candy-mint px-3 font-heading text-base font-extrabold leading-none text-on-accent tabular-nums shadow-sticker-sm">
            {t('tomo.celebration.minutes', { count: shown?.minutes ?? 0 })}
          </span>
          <StreakPill count={days} />
        </div>
        <div className="mt-2 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={takeBreak} className="w-full sm:w-auto">
            {t('tomo.celebration.takeBreak')}
          </Button>
          <Button variant="ghost" size="lg" onClick={dismiss} className="w-full sm:w-auto">
            {t('tomo.celebration.later')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
