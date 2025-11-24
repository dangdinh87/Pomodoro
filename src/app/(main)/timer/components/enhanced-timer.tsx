'use client';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useBackground } from '@/contexts/background-context';
import { useTranslation } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { useSystemStore } from '@/stores/system-store';
import { TimerMode, useTimerStore } from '@/stores/timer-store';
import {
    Briefcase,
    CheckCircle2,
    Coffee,
    Image as ImageIcon,
    Music,
    Settings,
    Pause,
    Play,
    RotateCcw,
    SkipForwardIcon,
    Maximize2,
    Minimize2,
    Wallpaper,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    AnalogClock,
    DigitalClock,
    FlipClock,
    ProgressBarClock,
} from './clocks';
import { TaskSelector } from './task-selector';
import { useStats } from '@/hooks/use-stats';
import { useQueryClient } from '@tanstack/react-query';
import { TimerSettingsModal } from '@/components/settings/timer-settings-modal';
import { AudioSettingsModal } from '@/components/settings/audio-settings-modal';
import BackgroundSettingsModal from '@/components/settings/background-settings-modal';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import { useSidebar } from '@/components/ui/sidebar';

export function EnhancedTimer() {
    const { t } = useTranslation();
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
        setDeadlineAt,
        resetTimer,
        deadlineAt,
        pauseTimer,
        resumeTimer,
    } = useTimerStore();

    const { soundSettings } = useSystemStore();
    const { background } = useBackground();
    const { state: sidebarState, setOpen: setSidebarOpen } = useSidebar();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const getDurationForMode = (m: TimerMode, s: typeof settings) => {
        switch (m) {
            case 'work': return s.workDuration * 60;
            case 'shortBreak': return s.shortBreakDuration * 60;
            case 'longBreak': return s.longBreakDuration * 60;
        }
    };

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const focusTimeRef = useRef<number>(totalFocusTime);
    const timeRef = useRef<HTMLDivElement | null>(null);
    const timeLeftRef = useRef<number>(timeLeft);
    const timerEndRef = useRef<number | null>(null);
    const prevRemainingRef = useRef<number>(timeLeft);
    const initialTitleRef = useRef<string | null>(null);
    const sessionDurationRef = useRef<number>(getDurationForMode(mode, settings));

    const [timerSettingsOpen, setTimerSettingsOpen] = useState(false);
    const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
    const [backgroundSettingsOpen, setBackgroundSettingsOpen] = useState(false);

    const quotes = useMemo(
        () =>
            t('timer.quotes.list', { returnObjects: true }) as unknown as string[],
        [t],
    );
    const [quote, setQuote] = useState<string>('');

    const queryClient = useQueryClient();

    const todayRange = useMemo(() => {
        const now = new Date();
        return {
            from: now,
            to: now
        };
    }, []);

    const { data: statsData } = useStats(todayRange);

    const dailyPomodoros = statsData?.summary.completedSessions || 0;
    const dailyFocusTime = statsData?.summary.totalFocusTime || 0;

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

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

        if (!timerEndRef.current) {
            if (deadlineAt && deadlineAt > Date.now()) {
                timerEndRef.current = deadlineAt;
            } else {
                timerEndRef.current = Date.now() + timeLeftRef.current * 1000;
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
                setDeadlineAt(null);
                setTimeout(() => handleSessionComplete(), 0);
            }
        }, 250);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, mode, setTimeLeft, setTotalFocusTime, setDeadlineAt]);

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

    useEffect(() => {
        if (!isRunning && timeLeft === totalTimeForMode) {
            sessionDurationRef.current = totalTimeForMode;
        }
    }, [totalTimeForMode, isRunning, timeLeft]);


    const [isProcessing, setIsProcessing] = useState(false);

    const handleSessionComplete = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setIsRunning(false);

        const currentRemaining = timeLeftRef.current;
        const completedDuration = sessionDurationRef.current - currentRemaining;

        if (mode === 'work') {
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
                        durationSec: completedDuration,
                        mode: 'work',
                    }),
                });

                queryClient.invalidateQueries({ queryKey: ['stats'] });
            } catch (error) {
                console.error('Failed to record session completion:', error);
            }
        } else {
            try {
                await fetch('/api/tasks/session-complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        taskId: null,
                        durationSec: completedDuration,
                        mode,
                    }),
                });
            } catch (error) {
                console.error('Failed to record break session:', error);
            }
        }

        playNotificationSound();

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
        setIsProcessing(false);
    };

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sounds/alarm.mp3');
            audio.volume = Math.max(0, Math.min(1, soundSettings.volume / 100));
            audio.play().catch(() => { });
            setTimeout(() => {
                audio.pause();
            }, 5000);
        } catch {
            // no-op
        }
    };

    const toggleTimer = () => {
        if (isProcessing) return;
        if (!isRunning) {
            if (timeLeft > 0) {
                resumeTimer();
                timerEndRef.current = null;
                prevRemainingRef.current = timeLeft;
            }
        } else {
            pauseTimer();
            timerEndRef.current = null;
        }
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (isProcessing) return;
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
    }, [resetTimer, toggleTimer, isProcessing]);

    const switchMode = (newMode: TimerMode) => {
        if (isProcessing) return;
        setIsRunning(false);
        timerEndRef.current = null;
        setDeadlineAt(null);

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

    const formattedTime = useMemo(() => formatTime(timeLeft), [timeLeft]);

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

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const prefix =
            mode === 'work'
                ? t('timer.title_prefix.work')
                : mode === 'shortBreak'
                    ? t('timer.title_prefix.shortBreak')
                    : t('timer.title_prefix.longBreak');
        const paused = isRunning ? '' : ' ⏸';
        document.title = `${formattedTime} • ${prefix}${paused}`;
    }, [formattedTime, mode, isRunning]);

    // Handle fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
                setSidebarOpen(false);
            }).catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                });
            }
        }
    };

    // Listen for fullscreen change events (e.g. user presses Esc)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

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
            isProcessing,
        }: {
            isRunning: boolean;
            toggleTimer: () => void;
            resetTimer: () => void;
            handleSessionComplete: () => void;
            hasImageOrVideoBackground: boolean;
            isProcessing: boolean;
        }) => {
            return (
                <div className="flex justify-center gap-3">
                    <Button
                        onClick={toggleTimer}
                        disabled={isProcessing}
                        aria-label={
                            isRunning
                                ? t('timer.controls.aria.pause')
                                : t('timer.controls.aria.start')
                        }
                        aria-pressed={isRunning}
                        title={
                            isRunning
                                ? t('timer.controls.pause_hint')
                                : t('timer.controls.start_hint')
                        }
                        className="min-w-[100px]"
                    >
                        {isRunning ? (
                            <span className="inline-flex items-center gap-2">
                                <Pause size={18} /> {t('timer.controls.pause')}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <Play size={18} /> {t('timer.controls.start')}
                            </span>
                        )}
                    </Button>
                    <Button
                        onClick={resetTimer}
                        disabled={isProcessing}
                        aria-label={t('timer.controls.aria.reset')}
                        title={t('timer.controls.reset_hint')}
                        variant="outline"
                    >
                        <span className="inline-flex items-center gap-2">
                            <RotateCcw size={18} />
                        </span>
                    </Button>

                    <Button
                        onClick={handleSessionComplete}
                        disabled={isProcessing}
                        variant="outline"
                        title={t('timer.controls.skip_hint')}
                    >
                        <span className="inline-flex items-center gap-2">
                            <SkipForwardIcon size={18} />
                        </span>
                    </Button>
                </div>
            );
        },
    );

    const hasImageOrVideoBackground = background.type === 'image';

    return (
        <div className="w-full min-h-[calc(100vh-6rem)] relative flex flex-col justify-center">
            <div className="w-full max-w-xl mx-auto z-10">
                <div className={cn('bg-transparent border-0')}>
                    <div className="text-center relative">
                        <div className="mb-6 flex justify-center gap-3">
                            <Button
                                variant={mode === 'work' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => switchMode('work')}
                                className="rounded-full"
                            >
                                <Briefcase size={14} className="mr-1" />
                                {t('timer.modes.work')}
                            </Button>
                            <Button
                                variant={mode === 'shortBreak' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => switchMode('shortBreak')}
                                className="rounded-full"
                            >
                                <Coffee size={14} className="mr-1" />
                                {t('timer.modes.shortBreak')}
                            </Button>
                            <Button
                                variant={mode === 'longBreak' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => switchMode('longBreak')}
                                className="rounded-full"
                            >
                                <Coffee size={14} className="mr-1" />
                                {t('timer.modes.longBreak')}
                            </Button>
                        </div>

                        <div className="pb-8 pt-4">
                            <ClockDisplay />
                        </div>
                    </div>
                    <CardContent className="space-y-6">
                        <TimerControls
                            isRunning={isRunning}
                            toggleTimer={toggleTimer}
                            resetTimer={resetTimer}
                            handleSessionComplete={handleSessionComplete}
                            hasImageOrVideoBackground={hasImageOrVideoBackground}
                            isProcessing={isProcessing}
                        />

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                            {mode === 'work' && (
                                <div className="w-auto">
                                    <TaskSelector />
                                </div>
                            )}

                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 shadow-sm hover:bg-background/90 transition-colors dark:bg-background/60 dark:hover:bg-background/80 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Hôm nay</span>
                                        <span className="text-sm font-bold text-foreground leading-none">
                                            {dailyPomodoros} <span className="text-xs font-normal text-muted-foreground">poms</span>
                                        </span>
                                    </div>
                                </div>
                                {dailyFocusTime > 0 && (
                                    <>
                                        <div className="w-px h-4 bg-border/50" />
                                        <div className="flex flex-row items-center gap-2">
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Thời gian</span>
                                            <span className="text-sm font-bold text-foreground leading-none">
                                                {Math.floor(dailyFocusTime / 60)} <span className="text-xs font-normal text-muted-foreground">phút</span>
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </div>

                <TimerSettingsModal
                    isOpen={timerSettingsOpen}
                    onClose={() => setTimerSettingsOpen(false)}
                />

                <AudioSettingsModal
                    isOpen={audioSettingsOpen}
                    onClose={() => setAudioSettingsOpen(false)}
                />

                <BackgroundSettingsModal
                    isOpen={backgroundSettingsOpen}
                    onClose={() => setBackgroundSettingsOpen(false)}
                />
            </div>

            {/* Bottom Left Settings Controls */}
            <div className="absolute bottom-0 left-0 z-50 flex gap-2 items-center">
                <TooltipProvider>
                    <Tooltip side="top">
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 border border-white/10 text-foreground"
                                onClick={() => setBackgroundSettingsOpen(true)}
                            >
                                <Wallpaper className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Background Settings</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip side="top">
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 border border-white/10 text-foreground"
                                onClick={() => setAudioSettingsOpen(true)}
                            >
                                <Music className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sound Settings</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip side="top">
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 border border-white/10 text-foreground"
                                onClick={() => setTimerSettingsOpen(true)}
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Timer Settings</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip side="top">
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 border border-white/10 text-foreground"
                                onClick={toggleFullscreen}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-5 w-5" />
                                ) : (
                                    <Maximize2 className="h-5 w-5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
export default memo(EnhancedTimer);
