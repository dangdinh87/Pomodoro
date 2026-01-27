import { useEffect, useRef } from 'react';
import { useTimerStore, TimerMode } from '@/stores/timer-store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useTimerEngine() {
  const isRunning = useTimerStore((state) => state.isRunning);
  const mode = useTimerStore((state) => state.mode);
  const settings = useTimerStore((state) => state.settings);

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
  const totalFocusTimeRef = useRef(useTimerStore.getState().totalFocusTime);

  // Sync refs with store changes (one-way sync for loop usage)
  useEffect(() => {
    // Subscribe to store changes to update refs without re-rendering parent
    const unsub = useTimerStore.subscribe((state) => {
      timeLeftRef.current = state.timeLeft;
      totalFocusTimeRef.current = state.totalFocusTime;
    });
    return () => unsub();
  }, []);

  const queryClient = useQueryClient();

  // Helper: Completion Logic (replicated from original to ensure engine handles auto-completion)
  // NOTE: This logic is slightly duplicated in TimerControls for manual skip.
  // Ideally, we'd extract this to a shared "SessionManager" helper class or hook.
  // For this refactor, we focus on re-render, so keeping it inside the engine loop is safe.
  const handleLoopComplete = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timerEndRef.current = null;
    setDeadlineAt(null);
    setIsRunning(false);

    // Completion logic
    const currentMode = useTimerStore.getState().mode; // Read fresh state
    const currentSettings = useTimerStore.getState().settings;
    const currentSessionCount = useTimerStore.getState().sessionCount;

    try {
      // Play sound
      const audio = new Audio('/sounds/alarm.mp3');
      // TODO: Get volume from system store if possible, or default
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}

    // Record session
    const duration =
      (currentMode === 'work'
        ? currentSettings.workDuration
        : currentMode === 'shortBreak'
          ? currentSettings.shortBreakDuration
          : currentSettings.longBreakDuration) * 60; // Approximate for auto-complete

    if (currentMode === 'work') {
      incrementCompletedSessions();
      try {
        const { activeTaskId } = await import('@/stores/task-store').then((m) =>
          m.useTasksStore.getState(),
        );
        await fetch('/api/tasks/session-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: activeTaskId || null,
            durationSec: duration,
            mode: 'work',
          }),
        });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['history'] });
      } catch (error) {
        console.error('Session record error', error);
      }
    } else {
      // Break recording...
      try {
        await fetch('/api/tasks/session-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: null,
            durationSec: duration,
            mode: currentMode,
          }),
        });
      } catch {}
    }

    // Auto-Transition
    if (currentMode === 'work') {
      const newCount = currentSessionCount + 1;
      incrementSessionCount();
      if (newCount % currentSettings.longBreakInterval === 0) {
        setMode('longBreak');
        const newDuration = currentSettings.longBreakDuration * 60;
        setTimeLeft(newDuration);
        useTimerStore.getState().setLastSessionTimeLeft(newDuration);
        if (currentSettings.autoStartBreak) setIsRunning(true);
      } else {
        setMode('shortBreak');
        const newDuration = currentSettings.shortBreakDuration * 60;
        setTimeLeft(newDuration);
        useTimerStore.getState().setLastSessionTimeLeft(newDuration);
        if (currentSettings.autoStartBreak) setIsRunning(true);
      }
    } else {
      setMode('work');
      const newDuration = currentSettings.workDuration * 60;
      setTimeLeft(newDuration);
      useTimerStore.getState().setLastSessionTimeLeft(newDuration);
      if (currentSettings.autoStartWork) setIsRunning(true);
    }
  };

  // The Main Engine Loop
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      timerEndRef.current = null;
      setDeadlineAt(null);
      return;
    }

    const deadlineAt = useTimerStore.getState().deadlineAt; // Check if deadline exists
    if (!timerEndRef.current) {
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

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const deadline = timerEndRef.current!;
      const remainingMs = Math.max(0, deadline - now);
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

        // CRITICAL: This updates the store, which triggers subscribers (ClockDisplay).
        // But it DOES NOT trigger this hook unless dependencies change.
        setTimeLeft(remaining);
      }

      if (remaining <= 0) {
        handleLoopComplete();
      }
    }, 250);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, mode, setDeadlineAt, setTimeLeft, setTotalFocusTime, setMode]);

  // Return nothing. This hook is a pure engine.
}
