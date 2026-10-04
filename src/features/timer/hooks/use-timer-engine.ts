import { useEffect, useRef } from 'react';
import { useTimerStore, CATCH_UP_GRACE_MS } from '@/stores/timer-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTasksStore } from '@/stores/task-store';
import { useSessionRecorder } from '@/lib/timer/use-session-recorder';
import { shouldFlushOnAuthChange } from '@/lib/timer/session-recorder';
import { useOutboxDropNotice } from '@/lib/timer/use-outbox-drop-notice';
import { playAlarm, preloadAlarm } from '@/lib/timer/alarm';
import { mayAutoChain } from '@/lib/timer/auto-chain';
import { claimCompletion, completionKey } from '@/lib/timer/completion-claim';
import { notifyPhaseComplete } from '@/lib/timer/notifications';
import { useI18n } from '@/contexts/i18n-context';
import { announceFocusComplete } from '@/features/mascot/celebration-store';

/** Any of these means somebody is at the screen. */
const PRESENCE_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel', 'focus'] as const;

export function useTimerEngine() {
  const { t } = useI18n();
  // The loop closures outlive renders; keep the language they notify in current
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const isRunning = useTimerStore((state) => state.isRunning);
  // Re-arm the interval when only the deadline changes (pause/resume coalesced
  // across tabs, or adopting another tab's state)
  const storeDeadlineAt = useTimerStore((state) => state.deadlineAt);
  const mode = useTimerStore((state) => state.mode);

  // Actions only (stable refs usually)
  const setTimeLeft = useTimerStore((state) => state.setTimeLeft);
  const setTotalFocusTime = useTimerStore((state) => state.setTotalFocusTime);
  const setDeadlineAt = useTimerStore((state) => state.setDeadlineAt);
  const setIsRunning = useTimerStore((state) => state.setIsRunning);
  const incrementSessionCount = useTimerStore(
    (state) => state.incrementSessionCount,
  );
  const incrementCompletedSessions = useTimerStore(
    (state) => state.incrementCompletedSessions,
  );
  const setMode = useTimerStore((state) => state.setMode);

  // Refs for interval loop to access latest logic without triggering re-effects
  const timeLeftRef = useRef(useTimerStore.getState().timeLeft);
  const timerEndRef = useRef<number | null>(null);
  const prevRemainingRef = useRef(timeLeftRef.current);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Fires exactly at the deadline. The interval alone is not enough: hidden tabs
  // get repeating timers throttled to about once a minute, a late alarm.
  const deadlineTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Auto-chain guard: did anyone touch the page since the current focus phase began
  // (reset whenever a fresh focus starts). Mounting counts as presence.
  const interactedRef = useRef(true);
  const totalFocusTimeRef = useRef(useTimerStore.getState().totalFocusTime);
  // BUG-05 FIX: Mutex to prevent concurrent handleLoopComplete calls
  const isCompletingRef = useRef(false);

  // Sync refs with store changes (one-way sync for loop usage)
  useEffect(() => {
    // Subscribe to store changes to update refs without re-rendering parent
    const unsub = useTimerStore.subscribe((state) => {
      timeLeftRef.current = state.timeLeft;
      totalFocusTimeRef.current = state.totalFocusTime;
    });
    return () => unsub();
  }, []);

  // Presence (pointer / key / focus / tab visible) feeds the auto-chain guard;
  // coming back to the tab also rolls the daily session counter over.
  useEffect(() => {
    const present = () => {
      interactedRef.current = true;
    };
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      present();
      useTimerStore.getState().syncSessionDay();
    };
    useTimerStore.getState().syncSessionDay();
    for (const type of PRESENCE_EVENTS) window.addEventListener(type, present, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      for (const type of PRESENCE_EVENTS) window.removeEventListener(type, present);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // BUG-03 FIX: Reset refs when mode changes to prevent stale values
  useEffect(() => {
    const currentTimeLeft = useTimerStore.getState().timeLeft;
    timeLeftRef.current = currentTimeLeft;
    prevRemainingRef.current = currentTimeLeft;
    // Clear timerEndRef so new deadline is calculated on next start
    timerEndRef.current = null;
  }, [mode]);

  const { record, flush } = useSessionRecorder();
  // Declared before the flush below, so a drop found on startup has a listener
  useOutboxDropNotice();

  // Retry sessions that failed to save (offline / 5xx / guest sign-in refused):
  // on mount, when back online, and as soon as auth resolves or the user changes.
  useEffect(() => {
    void flush();
    const onOnline = () => void flush();
    window.addEventListener('online', onOnline);
    const unsubAuth = useAuthStore.subscribe((state, prev) => {
      if (shouldFlushOnAuthChange(state, prev)) void flush();
    });
    return () => {
      window.removeEventListener('online', onOnline);
      unsubAuth();
    };
  }, [flush]);

  // Cross-tab sync: adopt start/pause/mode changes made in another tab.
  // Only these fields trigger a rehydrate (not timeLeft ticks) so two tabs
  // can never ping-pong writes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'timer-storage' || !e.newValue) return;
      try {
        const next = JSON.parse(e.newValue)?.state;
        const cur = useTimerStore.getState();
        if (
          next &&
          (next.isRunning !== cur.isRunning ||
            next.mode !== cur.mode ||
            next.deadlineAt !== cur.deadlineAt)
        ) {
          void useTimerStore.persist.rehydrate();
        }
      } catch {
        // Malformed storage payload: ignore
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Completion logic. NOTE: manual skip lives in TimerControls.
  // `catchUp` = the deadline elapsed while the app was closed: no alarm/confetti
  // and never auto-start. Recent (<= CATCH_UP_GRACE_MS) completions are still
  // recorded; older ones just advance the phase without crediting anything.
  const handleLoopComplete = (catchUp = false) => {
    // BUG-05 FIX: Prevent concurrent completion calls
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (deadlineTimeoutRef.current) {
        clearTimeout(deadlineTimeoutRef.current);
        deadlineTimeoutRef.current = null;
      }
      timerEndRef.current = null;

      // Several tabs run this engine on the same persisted state: exactly one
      // may record + alarm + advance. The others adopt the winner's state.
      const state = useTimerStore.getState();
      if (!claimCompletion(completionKey(state.mode, state.deadlineAt))) {
        void useTimerStore.persist.rehydrate();
        return;
      }

      setDeadlineAt(null);
      setIsRunning(false);

      // A count carried over from an earlier study day must not decide today's long break
      useTimerStore.getState().syncSessionDay();

      const stale =
        catchUp &&
        state.deadlineAt !== null &&
        Date.now() - state.deadlineAt > CATCH_UP_GRACE_MS;

      const currentMode = state.mode;
      const currentSettings = state.settings;
      const currentSessionCount = useTimerStore.getState().sessionCount;

      if (!catchUp) {
        playAlarm();
        notifyPhaseComplete(currentMode, tRef.current);
      }

      // The unrecorded segment started at `lastSessionTimeLeft` remaining and
      // the phase just ran to 0, so that is exactly the time focused since the
      // last recorded segment (persisted, so it survives reloads).
      const configDuration =
        (currentMode === 'work'
          ? currentSettings.workDuration
          : currentMode === 'shortBreak'
            ? currentSettings.shortBreakDuration
            : currentSettings.longBreakDuration) * 60;
      const duration =
        state.lastSessionTimeLeft > 0
          ? state.lastSessionTimeLeft
          : configDuration;

      // The phase really ended at its deadline, even if this tab noticed late
      // (throttled in the background, or reopened within the grace window)
      const endedAt = state.deadlineAt ?? undefined;

      if (stale) {
        // Too old to be a real session: no record, no counters, no streak
      } else if (currentMode === 'work') {
        if (!catchUp) {
          // Hands the moment to the celebration (confetti included); the alarm and the notification stay here
          announceFocusComplete(configDuration / 60);
        }
        incrementCompletedSessions();
        void record({
          taskId: useTasksStore.getState().activeTaskId || null,
          durationSec: duration,
          mode: 'work',
          // Ran to its deadline: the only way to earn the task a pomodoro
          completedFullSession: true,
          endedAt,
        });
      } else {
        void record({ taskId: null, durationSec: duration, mode: currentMode, endedAt });
      }

      // Auto-Transition (new phase starts a fresh baseline). A break only rolls
      // into the next focus if somebody was around since the previous focus began,
      // and never out of a long break; otherwise it waits on the start screen.
      const autoStart = !catchUp && mayAutoChain(currentMode, interactedRef.current);
      const next = (
        nextMode: 'work' | 'shortBreak' | 'longBreak',
        minutes: number,
        shouldStart: boolean,
      ) => {
        setMode(nextMode);
        const newDuration = minutes * 60;
        setTimeLeft(newDuration);
        useTimerStore.getState().setLastSessionTimeLeft(newDuration);
        if (shouldStart && autoStart) {
          setIsRunning(true);
        }
      };

      if (currentMode === 'work') {
        const newCount = stale ? currentSessionCount : currentSessionCount + 1;
        if (!stale) incrementSessionCount();
        if (!stale && newCount % currentSettings.longBreakInterval === 0) {
          next(
            'longBreak',
            currentSettings.longBreakDuration,
            currentSettings.autoStartBreak,
          );
        } else {
          next(
            'shortBreak',
            currentSettings.shortBreakDuration,
            currentSettings.autoStartBreak,
          );
        }
      } else {
        next('work', currentSettings.workDuration, currentSettings.autoStartWork);
      }
    } finally {
      // BUG-05 FIX: Always reset mutex
      isCompletingRef.current = false;
    }
  };

  // The Main Engine Loop
  useEffect(() => {
    // Read the live store too: with StrictMode double effects the captured
    // `isRunning` can be stale right after a catch-up completion paused it.
    if (!isRunning || !useTimerStore.getState().isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (deadlineTimeoutRef.current) {
        clearTimeout(deadlineTimeoutRef.current);
        deadlineTimeoutRef.current = null;
      }
      timerEndRef.current = null;
      setDeadlineAt(null);
      return;
    }

    // Deadline elapsed while the app was closed (rehydrated as running at 0)
    if (useTimerStore.getState().timeLeft <= 0) {
      handleLoopComplete(true);
      return;
    }

    const armedBefore = timerEndRef.current !== null;
    const deadlineAt = useTimerStore.getState().deadlineAt; // Check if deadline exists
    // Also re-evaluate when the store holds a different deadline than we armed
    // (adopted from another tab)
    if (
      !timerEndRef.current ||
      (deadlineAt && deadlineAt !== timerEndRef.current)
    ) {
      // Validate deadline matches expected remaining time (2s tolerance for drift)
      // This prevents stale deadlines from being reused after mode transitions
      const expectedDeadline = Date.now() + timeLeftRef.current * 1000;
      const deadlineIsValid =
        deadlineAt &&
        deadlineAt > Date.now() &&
        Math.abs(deadlineAt - expectedDeadline) < 2000;

      if (deadlineIsValid) {
        timerEndRef.current = deadlineAt;
      } else {
        timerEndRef.current = expectedDeadline;
        setDeadlineAt(timerEndRef.current);
      }
      prevRemainingRef.current = timeLeftRef.current;
    }

    // A fresh focus (auto-started or by hand) opens a new attendance window; a
    // resume mid-phase keeps what the user already did during it.
    const freshFocus =
      useTimerStore.getState().mode === 'work' &&
      timeLeftRef.current >= useTimerStore.getState().settings.workDuration * 60;
    if (freshFocus && !armedBefore) interactedRef.current = false;

    // Fetch the bell now so it can sound the instant the deadline hits
    preloadAlarm();

    const tick = () => {
      const deadline = timerEndRef.current;
      if (deadline === null) return; // completed (or paused) in between
      const remainingMs = Math.max(0, deadline - Date.now());
      const remaining = Math.ceil(remainingMs / 1000);

      if (remaining !== timeLeftRef.current) {
        // Focus Logic
        const delta = Math.max(0, prevRemainingRef.current - remaining);
        if (delta > 0 && useTimerStore.getState().mode === 'work') {
          totalFocusTimeRef.current += delta;
          setTotalFocusTime(totalFocusTimeRef.current);
        }

        prevRemainingRef.current = remaining;
        timeLeftRef.current = remaining;

        // Completion owns the final state (and may belong to another tab), so
        // do not persist a transient 0 here.
        if (remaining > 0) {
          // CRITICAL: This updates the store, which triggers subscribers (ClockDisplay).
          // But it DOES NOT trigger this hook unless dependencies change.
          setTimeLeft(remaining);
        }
      }

      if (remaining <= 0) {
        handleLoopComplete();
      }
    };

    // One-shot timer aimed at the deadline itself. Idempotent with the interval
    // and with other tabs: whichever gets there first completes, the rest hit
    // the isCompleting mutex / the completion claim.
    const armDeadlineTimeout = () => {
      if (deadlineTimeoutRef.current) clearTimeout(deadlineTimeoutRef.current);
      const deadline = timerEndRef.current;
      if (deadline === null) return;
      deadlineTimeoutRef.current = setTimeout(
        () => {
          deadlineTimeoutRef.current = null;
          // Never complete early if the timer woke up a hair too soon
          if (Date.now() < deadline) armDeadlineTimeout();
          else tick();
        },
        Math.max(0, deadline - Date.now()),
      );
    };

    intervalRef.current = setInterval(tick, 250);
    armDeadlineTimeout();

    // A hidden tab can be throttled or frozen: when visibility changes, catch
    // up immediately (completes a deadline that already passed) and re-aim.
    const onVisibility = () => {
      tick();
      if (timerEndRef.current !== null) armDeadlineTimeout();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (deadlineTimeoutRef.current) {
        clearTimeout(deadlineTimeoutRef.current);
        deadlineTimeoutRef.current = null;
      }
    };
  }, [isRunning, mode, storeDeadlineAt, setDeadlineAt, setTimeLeft, setTotalFocusTime, setMode]);

  // Return nothing. This hook is a pure engine.
}
