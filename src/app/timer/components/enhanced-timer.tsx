'use client';

import AnimatedCircularProgressBar from '@/components/ui/animated-circular-progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useBackground } from '@/contexts/background-context';
import { cn } from '@/lib/utils';
import { useSystemStore } from '@/stores/system-store';
import { TimerMode, useTimerStore } from '@/stores/timer-store';
import {
  Briefcase,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  SkipForwardIcon,
  Info,
  Sparkles,
  Target,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AnalogClock,
  DigitalClock,
  FlipClock,
  ProgressBarClock,
} from './clocks';

export function EnhancedTimer() {
  const {
    mode,
    timeLeft,
    isRunning,
    sessionCount,
    completedSessions,
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

  const [showGuide, setShowGuide] = useState<boolean>(true);
  const quotes = useMemo(
    () => [
      'Hãy tập trung vào điều bạn có thể kiểm soát — từng Pomodoro một.',
      'Nhỏ nhưng đều đặn sẽ tạo nên khác biệt lớn.',
      'Kỷ luật thắng tài năng khi tài năng thiếu kỷ luật.',
      'Làm việc sâu trong ngắn hạn, thành tựu lớn trong dài hạn.',
      'Bắt đầu ngay bây giờ — hành động đánh bại trì hoãn.',
    ],
    [],
  );
  const [quote, setQuote] = useState<string>('');
  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem('pomodoro-guide-dismissed') === '1';
    setShowGuide(!dismissed);
  }, []);

  const dismissGuide = () => {
    setShowGuide(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pomodoro-guide-dismissed', '1');
      }
    } catch {}
  };

  const reopenGuide = () => {
    setShowGuide(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pomodoro-guide-dismissed');
      }
    } catch {}
  };

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
  }, [isRunning, mode, setTimeLeft, setTotalFocusTime]);

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

  // Keyboard shortcuts effect moved below toggleTimer to avoid "used before declaration"

  const totalTimeForMode = useMemo(() => {
    switch (mode) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  }, [mode, settings]);

  const progressPercent = useMemo(() => {
    const total = totalTimeForMode || 1;
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, totalTimeForMode]);

  const handleSessionComplete = () => {
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
  };

  const playNotificationSound = () => {
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
  };

  const toggleTimer = () => {
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
  };

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

  const switchMode = (newMode: TimerMode) => {
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
  };

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

  const ClockDisplay = memo(() => {
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
  });

  const TimerControls = memo(
    ({
      isRunning,
      toggleTimer,
      resetTimer,
      handleSessionComplete,
    }: {
      isRunning: boolean;
      toggleTimer: () => void;
      resetTimer: () => void;
      handleSessionComplete: () => void;
      hasImageOrVideoBackground: boolean;
    }) => {
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

  // Determine if background is image or video for transparent UI
  const hasImageOrVideoBackground = background.type === 'image';

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className={cn('bg-transparent border-0')}>
        <CardHeader className="text-center relative">
          {/* Pomodoro guide moved to fixed bottom-right panel */}
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

          <ClockDisplay />
        </CardHeader>
        <CardContent className="space-y-6">
          <TimerControls
            isRunning={isRunning}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            handleSessionComplete={handleSessionComplete}
            hasImageOrVideoBackground={hasImageOrVideoBackground}
          />
        </CardContent>
      </Card>

      {/* Floating Pomodoro Guide at bottom-right */}
      {showGuide ? (
        <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,420px)]">
          <div className="rounded-xl border border-white/20 bg-background/95 backdrop-blur-md shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-primary">
                <Info className="h-4 w-4 opacity-90" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">Hướng dẫn Pomodoro</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={dismissGuide}
                    aria-label="Ẩn hướng dẫn"
                    title="Ẩn hướng dẫn"
                  >
                    Ẩn
                  </Button>
                </div>

                {/* 1) Giải thích */}
                <div className="mt-3 space-y-2 text-xs md:text-sm leading-relaxed text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>Giải thích</span>
                  </div>
                  <p>
                    Pomodoro = làm 25’, nghỉ 5’ để giữ tập trung và giảm xao
                    nhãng.
                  </p>
                  <p>Hoàn thành 4 phiên → nghỉ dài 15’ để phục hồi.</p>
                </div>

                {/* 2) Cách sử dụng */}
                <div className="pt-3 border-t space-y-2 text-xs md:text-sm leading-relaxed text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Target className="h-4 w-4" />
                    <span>Cách sử dụng</span>
                  </div>
                  <ol className="mt-1 list-decimal pl-4 space-y-1">
                    <li>Chọn nhiệm vụ và chế độ Work.</li>
                    <li>
                      Start/Pause (Space), Reset (R), Skip để chuyển phiên.
                    </li>
                    <li>Hết phiên → nghỉ Short; 4 Work → nghỉ Long.</li>
                    <li>Tùy chỉnh thời lượng/đồng hồ trong Cài đặt.</li>
                  </ol>
                </div>

                {/* 3) Mẹo */}
                <div className="pt-3 border-t space-y-2 text-xs md:text-sm leading-relaxed text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mẹo</span>
                  </div>
                  <ul className="mt-1 list-disc pl-4 space-y-1">
                    <li>Đặt mục tiêu nhỏ, cụ thể cho mỗi phiên.</li>
                    <li>Tắt thông báo và đóng tab không cần thiết.</li>
                    <li>Tránh đa nhiệm; ghi chú gián đoạn rồi quay lại.</li>
                  </ul>
                </div>

                {/* 4) Động lực */}
                <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 text-xs flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary" />
                  <p className="italic leading-relaxed">
                    {quote || 'Tập trung vào bước tiếp theo — rồi lặp lại.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={reopenGuide}
          aria-label="Mở hướng dẫn Pomodoro"
          className="fixed bottom-4 right-4 z-40 rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition px-3 py-2"
          variant="outline"
          title="Mở hướng dẫn Pomodoro"
        >
          <span className="inline-flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden md:inline">Hướng dẫn</span>
          </span>
        </Button>
      )}
    </div>
  );
}
export default memo(EnhancedTimer);
