'use client';

import AnimatedCircularProgressBar from '@/components/ui/animated-circular-progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useBackground } from '@/contexts/background-context';
import { cn } from '@/lib/utils';
import { useSystemStore } from '@/stores/system-store';
import { TimerMode, useTimerStore, type TimerSettings } from '@/stores/timer-store';
import {
  Briefcase,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  SkipForwardIcon,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import {
  AnalogClock,
  DigitalClock,
  FlipClock,
  ProgressBarClock,
} from './clocks';
import { PomodoroGuide } from './pomodoro-guide';

// -----------------------------------------------------------------------------
// Sub-components moved outside to prevent re-creation on every render
// -----------------------------------------------------------------------------

interface ClockDisplayProps {
  settings: TimerSettings;
  formattedTime: string;
  timeLeft: number;
  totalTimeForMode: number;
  progressPercent: number;
  timeRef: React.RefObject<HTMLDivElement>;
  isRunning: boolean;
}

const ClockDisplay = memo(
  ({
    settings,
    formattedTime,
    timeLeft,
    totalTimeForMode,
    progressPercent,
    timeRef,
    isRunning,
  }: ClockDisplayProps) => {
    const lowWarnEnabled = settings.lowTimeWarningEnabled ?? true;
    switch (settings.clockType) {
      case 'analog':
        return (
          <AnalogClock
            formattedTime={formattedTime}
            totalTimeForMode={totalTimeForMode}
            timeLeft={timeLeft}
          />
        );
      case 'progress':
        return (
          <ProgressBarClock
            formattedTime={formattedTime}
            progressPercent={progressPercent}
          />
        );
      case 'flip':
        return (
          <FlipClock
            formattedTime={formattedTime}
            progressPercent={progressPercent}
            timeLeft={timeLeft}
          />
        );
      case 'ring':
        return (
          <div className="text-center">
            <AnimatedCircularProgressBar
              value={progressPercent}
              className="my-2"
            >
              <div className={cn('text-3xl font-bold timer-state-transition')}>
                {formattedTime}
              </div>
            </AnimatedCircularProgressBar>
          </div>
        );
      case 'digital':
      default:
        return (
          <DigitalClock
            timeRef={timeRef}
            formattedTime={formattedTime}
            isRunning={isRunning}
            progressPercent={progressPercent}
            lowWarnEnabled={lowWarnEnabled}
            timeLeft={timeLeft}
          />
        );
    }
  },
);
ClockDisplay.displayName = 'ClockDisplay';

interface TimerControlsProps {
  isRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  handleSessionComplete: () => void;
}

const TimerControls = memo(
  ({
    isRunning,
    toggleTimer,
    resetTimer,
    handleSessionComplete,
  }: TimerControlsProps) => {
    return (
      <div className="flex justify-center gap-3">
        <Button
          onClick={toggleTimer}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          aria-pressed={isRunning}
          title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
          className="min-w-[100px]"
        >
          {isRunning ? (
            <span className="inline-flex items-center gap-2">
              <Pause size={18} /> Pause
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Play size={18} /> Start
            </span>
          )}
        </Button>
        <Button
          onClick={resetTimer}
          aria-label="Reset timer"
          title="Reset (R)"
          variant="outline"
        >
          <span className="inline-flex items-center gap-2">
            <RotateCcw size={18} /> Reset
          </span>
        </Button>

        <Button
          onClick={handleSessionComplete}
          variant="outline"
          title="Skip session"
        >
          <span className="inline-flex items-center gap-2">
            <SkipForwardIcon size={18} /> Skip
          </span>
        </Button>
      </div>
    );
  },
);
TimerControls.displayName = 'TimerControls';

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function EnhancedTimer() {
  const {
    mode,
    timeLeft,
    isRunning,
    sessionCount,
    totalFocusTime,
    settings,
    setMode,
    setTimeLeft,
    setIsRunning,
    incrementSessionCount,
    incrementCompletedSessions,
    setTotalFocusTime,
    resetTimer,
  } = useTimerStore();

  const { soundSettings } = useSystemStore();
  const { background } = useBackground();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimeRef = useRef<number>(totalFocusTime);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const timeLeftRef = useRef<number>(timeLeft);
  const timerEndRef = useRef<number | null>(null);
  const prevRemainingRef = useRef<number>(timeLeft);
  const initialTitleRef = useRef<string | null>(null);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/alarm.mp3');
      audio.volume = Math.max(0, Math.min(1, soundSettings.volume / 100));
      audio.play().catch(() => {});
      setTimeout(() => {
        audio.pause();
      }, 5000);
    } catch {
      // no-op: best-effort
    }
  }, [soundSettings.volume]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);

    if (mode === 'work') {
      incrementCompletedSessions();
      toast.success('Work session completed! Time for a break.');
    } else {
      toast.success('Break completed! Time to focus.');
    }

    playNotificationSound();

    // Determine next mode
    if (mode === 'work') {
      // We need to calculate next session count here because sessionCount from store
      // might be stale if we didn't depend on it, but here we depend on it.
      // Wait, useCallback depends on sessionCount.
      // Ideally we should use functional updates if possible, but store actions
      // like incrementSessionCount update the store.
      // Let's assume sessionCount is current from the hook.
      const newSessionCount = sessionCount + 1;
      incrementSessionCount();

      if (newSessionCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
        if (settings.autoStartBreak) setIsRunning(true);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
        if (settings.autoStartBreak) setIsRunning(true);
      }
    } else {
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
      if (settings.autoStartWork) setIsRunning(true);
    }
  }, [
    mode,
    setIsRunning,
    incrementCompletedSessions,
    playNotificationSound,
    sessionCount,
    incrementSessionCount,
    settings,
    setMode,
    setTimeLeft,
  ]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      timerEndRef.current = null;
      return;
    }

    // initialize deadline when starting
    if (!timerEndRef.current) {
      timerEndRef.current = Date.now() + timeLeftRef.current * 1000;
      prevRemainingRef.current = timeLeftRef.current;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const deadline = timerEndRef.current!;
      // Use ceil with clamped ms to ensure a monotonic, accurate countdown without second "jumps"
      const remainingMs = Math.max(0, deadline - now);
      const remaining = Math.ceil(remainingMs / 1000);

      if (remaining !== timeLeftRef.current) {
        const delta = Math.max(0, prevRemainingRef.current - remaining);
        if (delta > 0 && mode === 'work') {
          focusTimeRef.current += delta;
          setTotalFocusTime(focusTimeRef.current);
        }
        prevRemainingRef.current = remaining;
        timeLeftRef.current = remaining;
        setTimeLeft(remaining);
      }

      if (remaining <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        timerEndRef.current = null;
        setTimeout(() => handleSessionComplete(), 0);
      }
    }, 250);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isRunning,
    mode,
    setTimeLeft,
    setTotalFocusTime,
    handleSessionComplete,
  ]);

  // Per-second pulse synced via rAF on time change
  useEffect(() => {
    const el = timeRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      el.classList.remove('timer-pulse');
      // force reflow to restart animation
      void el.offsetWidth;
      el.classList.add('timer-pulse');
    });
    return () => cancelAnimationFrame(frame);
  }, [timeLeft]);

  const totalTimeForMode = useMemo(() => {
    switch (mode) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      default:
        return settings.workDuration * 60;
    }
  }, [mode, settings]);

  const progressPercent = useMemo(() => {
    const total = totalTimeForMode || 1;
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, totalTimeForMode]);

  const toggleTimer = useCallback(() => {
    if (!isRunning) {
      // starting
      timerEndRef.current = Date.now() + timeLeftRef.current * 1000;
      prevRemainingRef.current = timeLeftRef.current;
      setIsRunning(true);
    } else {
      // pausing
      setIsRunning(false);
      timerEndRef.current = null;
    }
  }, [isRunning, setIsRunning]);

  // Keyboard shortcuts: Space => Start/Pause, R => Reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetTimer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resetTimer, toggleTimer]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      // stop and clear deadline, then set new baseline time
      setIsRunning(false);
      timerEndRef.current = null;

      setMode(newMode);

      if (newMode === 'work') {
        setTimeLeft(settings.workDuration * 60);
      } else if (newMode === 'shortBreak') {
        setTimeLeft(settings.shortBreakDuration * 60);
      } else {
        setTimeLeft(settings.longBreakDuration * 60);
      }
    },
    [setIsRunning, setMode, setTimeLeft, settings],
  );

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  const formattedTime = useMemo(
    () => formatTime(timeLeft),
    [timeLeft, formatTime],
  );

  // Capture original title on mount and restore on unmount
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (initialTitleRef.current === null) {
      initialTitleRef.current = document.title;
    }
    return () => {
      if (initialTitleRef.current !== null) {
        document.title = initialTitleRef.current;
      }
    };
  }, []);

  // Reflect countdown in the browser tab title
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prefix =
      mode === 'work' ? 'Work' : mode === 'shortBreak' ? 'Break' : 'Long Break';
    const paused = isRunning ? '' : ' ⏸';
    document.title = `${formattedTime} • ${prefix}${paused}`;
  }, [formattedTime, mode, isRunning]);

  // Determine if background is image or video for transparent UI
  const hasImageOrVideoBackground = background.type === 'image';

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className={cn('bg-transparent border-0')}>
        <CardHeader className="text-center relative">
          {/* Mode selection as tags */}
          <div className="mb-6 flex justify-center gap-3">
            <Button
              variant={mode === 'work' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchMode('work')}
            >
              <Briefcase size={14} className="mr-1" />
              Work
            </Button>
            <Button
              variant={mode === 'shortBreak' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchMode('shortBreak')}
            >
              <Coffee size={14} className="mr-1" />
              Short Break
            </Button>
            <Button
              variant={mode === 'longBreak' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchMode('longBreak')}
            >
              <Coffee size={14} className="mr-1" />
              Long Break
            </Button>
          </div>

          <ClockDisplay
            settings={settings}
            formattedTime={formattedTime}
            timeLeft={timeLeft}
            totalTimeForMode={totalTimeForMode}
            progressPercent={progressPercent}
            timeRef={timeRef}
            isRunning={isRunning}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <TimerControls
            isRunning={isRunning}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            handleSessionComplete={handleSessionComplete}
          />
        </CardContent>
      </Card>

      <PomodoroGuide />
    </div>
  );
}
export default memo(EnhancedTimer);
