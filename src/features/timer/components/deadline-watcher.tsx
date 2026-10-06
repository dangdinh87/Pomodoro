'use client';

import { useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/i18n-context';
import { claimAlarm, completionKey } from '@/lib/timer/completion-claim';
import { isEngineMounted, subscribeEnginePresence } from '@/lib/timer/engine-presence';
import {
  CATCH_UP_GRACE_MS,
  readRunningPhase,
  TIMER_STORAGE_KEY,
  type RunningPhase,
} from '@/lib/timer/persisted-phase';

type Translate = (key: string) => string;

type Bell = [typeof import('@/lib/timer/alarm'), typeof import('@/lib/timer/notifications')];

/** The bell and the notification texts: fetched only once there is a running phase to watch. */
let bell: Bell | null = null;
const loadBell = async (): Promise<Bell> =>
  (bell ??= await Promise.all([import('@/lib/timer/alarm'), import('@/lib/timer/notifications')]));

async function ring(phase: RunningPhase, t: Translate): Promise<void> {
  // The app came back in between (its engine rings), or the phase was paused, reset or replaced elsewhere
  if (isEngineMounted()) return;
  const current = readRunningPhase();
  if (!current || current.mode !== phase.mode || current.deadlineAt !== phase.deadlineAt) return;
  // Woke from sleep long after the end: like the engine, a phase that ended that long ago never rings
  if (Date.now() - phase.deadlineAt > CATCH_UP_GRACE_MS) return;
  // One ring per phase end across tabs: a tab with the app open claims the same bell
  if (!claimAlarm(completionKey(phase.mode, phase.deadlineAt))) return;
  try {
    // Loaded when the phase was armed, so it normally sounds right at the deadline, with no fetch in between
    const [{ playAlarm }, { notifyPhaseComplete }] = bell ?? (await loadBell());
    playAlarm();
    // Nothing else on a page without the timer says the phase is over, so notify even in view
    notifyPhaseComplete(phase.mode, t, { evenIfVisible: true });
  } catch {
    // The bell's chunk failed to load (offline, new deploy): nothing to ring with
  }
}

/**
 * Rings the end of a running phase in tabs where the timer engine is not mounted: the guide,
 * privacy and terms pages (the engine lives on the app page), and the app page itself in the
 * moment before its code arrives. It reads the deadline from storage, so these pages never load
 * the timer store, and fetches the bell only while a phase is running.
 *
 * It plays the chosen alarm once and shows the system notification. It never records the session
 * or touches the timer: when the user opens the app again the engine settles that phase exactly
 * once (quietly, since it has already rung).
 */
export function DeadlineWatcher() {
  const { t } = useI18n();
  const tRef = useRef<Translate>(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const disarm = () => {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    };
    const arm = () => {
      disarm();
      if (isEngineMounted()) return;
      const phase = readRunningPhase();
      // Already over when this page learned of it (a reopened tab): the engine settles it quietly in the app
      if (!phase || phase.deadlineAt <= Date.now()) return;
      // Fetch the sound now so it can play the instant the deadline hits
      void loadBell().then(([{ preloadAlarm }]) => preloadAlarm(), () => {});
      const fire = () => {
        timer = null;
        // A timer can wake a hair early
        if (Date.now() < phase.deadlineAt) {
          timer = setTimeout(fire, phase.deadlineAt - Date.now());
          return;
        }
        void ring(phase, tRef.current);
      };
      timer = setTimeout(fire, phase.deadlineAt - Date.now());
    };

    arm();
    // The engine mounting (back on the app page) disarms; unmounting (left for /guide) arms
    const unsubscribe = subscribeEnginePresence(arm);
    // Started, paused or reset in another tab
    const onStorage = (event: StorageEvent) => {
      if (event.key === TIMER_STORAGE_KEY || event.key === null) arm();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      disarm();
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return null;
}
