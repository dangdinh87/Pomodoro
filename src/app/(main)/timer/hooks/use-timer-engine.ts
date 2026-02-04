import { useEffect, useRef } from 'react';
import { useTimerStore, TimerMode } from '@/stores/timer-store';
import { useTasksStore } from '@/stores/task-store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Confetti celebration for work session completion
const fireWorkCompleteConfetti = () => {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      zIndex: 9999,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

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

  // BUG-03 FIX: Reset refs when mode changes to prevent stale values
  useEffect(() => {
    const currentTimeLeft = useTimerStore.getState().timeLeft;
    timeLeftRef.current = currentTimeLeft;
    prevRemainingRef.current = currentTimeLeft;
    // Clear timerEndRef so new deadline is calculated on next start
    timerEndRef.current = null;
  }, [mode]);

  const queryClient = useQueryClient();

  // Helper: Completion Logic (replicated from original to ensure engine handles auto-completion)
  // NOTE: This logic is slightly duplicated in TimerControls for manual skip.
  // Ideally, we'd extract this to a shared "SessionManager" helper class or hook.
  // For this refactor, we focus on re-render, so keeping it inside the engine loop is safe.
  const handleLoopComplete = () => {
    // BUG-05 FIX: Prevent concurrent completion calls
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    try {
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

    // FIX: Calculate duration BEFORE using it in toast
    const lastSessionTimeLeft = useTimerStore.getState().lastSessionTimeLeft;
    const configDuration = (currentMode === 'work'
      ? currentSettings.workDuration
      : currentMode === 'shortBreak'
        ? currentSettings.shortBreakDuration
        : currentSettings.longBreakDuration) * 60;
    const duration = lastSessionTimeLeft > 0 ? lastSessionTimeLeft : configDuration;

    // Toast notification for session completion
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    };

    if (currentMode === 'work') {
      // Fire confetti celebration
      fireWorkCompleteConfetti();
      toast.success(`🍅 Work session complete!`, {
        description: `${formatDuration(configDuration)} of focused work`,
      });
    } else {
      toast.success(
        currentMode === 'shortBreak' ? `☕ Short break complete!` : `🍊 Long break complete!`,
        { description: `Ready to focus again` }
      );
    }

    if (currentMode === 'work') {
      incrementCompletedSessions();
      // Use imported store directly instead of dynamic import
      const activeTaskId = useTasksStore.getState().activeTaskId;
      fetch('/api/tasks/session-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: activeTaskId || null,
          durationSec: duration,
          mode: 'work',
        }),
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['history'] });
      }).catch((error) => {
        console.error('Session record error', error);
      });
    } else {
      // Break recording (non-blocking)
      fetch('/api/tasks/session-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: null,
          durationSec: duration,
          mode: currentMode,
        }),
      }).catch(() => {});
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
    } finally {
      // BUG-05 FIX: Always reset mutex
      isCompletingRef.current = false;
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
