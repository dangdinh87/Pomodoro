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
    Clock,
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
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import { useAudioStore } from '@/stores/audio-store';
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
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/animate-ui/components/animate/tabs';
import { useSidebar } from '@/components/ui/sidebar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

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

    const { soundSettings, isFocusMode, setFocusMode } = useSystemStore();
    const { background } = useBackground();
    const { state: sidebarState, setOpen: setSidebarOpen } = useSidebar();
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Audio store for checking if music is playing
    const currentlyPlaying = useAudioStore((state) => state.currentlyPlaying);
    const activeAmbientSounds = useAudioStore((state) => state.activeAmbientSounds);
    // Check if any audio is playing (YouTube, Spotify, or Ambient)
    const isAudioPlaying = (currentlyPlaying?.isPlaying ?? false) || activeAmbientSounds.length > 0;
    const hasActiveAudio = !!currentlyPlaying || activeAmbientSounds.length > 0;

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
    const [skipConfirmOpen, setSkipConfirmOpen] = useState(false);

    // Minimum completion percentage to count as a valid pomodoro
    const MINIMUM_COMPLETION_PERCENT = 50;

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

    // Calculate completion percentage
    const getCompletionPercent = () => {
        const currentRemaining = timeLeftRef.current;
        const completedDuration = sessionDurationRef.current - currentRemaining;
        return (completedDuration / sessionDurationRef.current) * 100;
    };

    // Handle skip button click - check if confirmation is needed
    const handleSkipClick = () => {
        if (isProcessing) return;

        const completionPercent = getCompletionPercent();

        // If less than minimum completion, show confirmation dialog
        if (mode === 'work' && completionPercent < MINIMUM_COMPLETION_PERCENT) {
            setSkipConfirmOpen(true);
            return;
        }

        // Otherwise, complete normally
        handleSessionComplete(false);
    };

    // Handle confirmed skip (user chose to skip without recording)
    const handleConfirmedSkip = () => {
        setSkipConfirmOpen(false);
        handleSessionComplete(true); // true = skip without recording
    };

    const handleSessionComplete = async (skipWithoutRecording: boolean = false) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setIsRunning(false);

        const currentRemaining = timeLeftRef.current;
        const completedDuration = sessionDurationRef.current - currentRemaining;
        const completionPercent = (completedDuration / sessionDurationRef.current) * 100;

        // Determine if this is a valid session (>= 50% completion OR not a manual skip)
        const isValidSession = !skipWithoutRecording && completionPercent >= MINIMUM_COMPLETION_PERCENT;

        if (mode === 'work') {
            if (isValidSession) {
                // Record the session
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
                    queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    queryClient.invalidateQueries({ queryKey: ['history'] });
                } catch (error) {
                    console.error('Failed to record session completion:', error);
                }
                playNotificationSound();
            } else {
                // Skipped without recording
                toast.info(t('timer.skipped_not_recorded') || 'Session skipped - not recorded');
            }
        } else {
            // Break sessions are always recorded (but don't affect task progress)
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
            if (!skipWithoutRecording) {
                playNotificationSound();
            }
        }

        // Always transition to next mode
        if (mode === 'work') {
            const newSessionCount = sessionCount + 1;
            if (isValidSession) {
                incrementSessionCount();
            }

            if (newSessionCount % settings.longBreakInterval === 0) {
                setMode('longBreak');
                setTimeLeft(settings.longBreakDuration * 60);
                if (settings.autoStartBreak && !skipWithoutRecording) setIsRunning(true);
            } else {
                setMode('shortBreak');
                setTimeLeft(settings.shortBreakDuration * 60);
                if (settings.autoStartBreak && !skipWithoutRecording) setIsRunning(true);
            }
        } else {
            setMode('work');
            setTimeLeft(settings.workDuration * 60);
            if (settings.autoStartWork && !skipWithoutRecording) setIsRunning(true);
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
                setFocusMode(true);
                setSidebarOpen(false);
            }).catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                    setFocusMode(false);
                });
            }
        }
    };

    // Listen for fullscreen change events (e.g. user presses Esc)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isNowFullscreen);
            setFocusMode(isNowFullscreen);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [setFocusMode]);

    const ClockDisplay = memo(() => {
        const lowWarnEnabled = settings.lowTimeWarningEnabled ?? true;
        const clockSize = settings.clockSize || 'medium';

        switch (settings.clockType) {
            case 'analog':
                return (
                    <AnalogClock
                        formattedTime={formattedTime}
                        totalTimeForMode={totalTimeForMode}
                        timeLeft={timeLeft}
                        clockSize={clockSize}
                    />
                );
            case 'progress':
                return (
                    <ProgressBarClock
                        formattedTime={formattedTime}
                        progressPercent={progressPercent}
                        clockSize={clockSize}
                    />
                );
            case 'flip':
                return (
                    <FlipClock
                        formattedTime={formattedTime}
                        timeLeft={timeLeft}
                        clockSize={clockSize}
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
                        clockSize={clockSize}
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
            isProcessing: boolean;
        }) => {
            return (
                <div className="flex items-center justify-center gap-6">
                    <Button
                        onClick={resetTimer}
                        disabled={isProcessing}
                        aria-label={t('timer.controls.aria.reset')}
                        title={t('timer.controls.reset_hint')}
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground shadow-sm transition-all"
                    >
                        <RotateCcw size={20} />
                    </Button>

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
                        className={cn(
                            "h-16 px-8 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95",
                            "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        )}
                    >
                        {isRunning ? (
                            <span className="inline-flex items-center gap-2">
                                <Pause size={24} fill="currentColor" /> {t('timer.controls.pause')}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <Play size={24} fill="currentColor" /> {t('timer.controls.start').toUpperCase()}
                            </span>
                        )}
                    </Button>

                    <Button
                        onClick={handleSkipClick}
                        disabled={isProcessing}
                        variant="secondary"
                        size="icon"
                        title={t('timer.controls.skip_hint')}
                        className="h-12 w-12 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground shadow-sm transition-all"
                    >
                        <SkipForwardIcon size={20} />
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
                        <div className="mb-8 flex justify-center">
                            <Tabs
                                value={mode}
                                onValueChange={(val) => switchMode(val as TimerMode)}
                                className="w-fit"
                            >
                                <TabsList className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-black/5 dark:border-white/5 p-1 rounded-full shadow-sm">
                                    <TabsTrigger
                                        value="work"
                                        className="rounded-full px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black data-[state=active]:shadow-md"
                                    >
                                        {t('timer.modes.work')}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="shortBreak"
                                        className="rounded-full px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black data-[state=active]:shadow-md"
                                    >
                                        {t('timer.modes.shortBreak')}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="longBreak"
                                        className="rounded-full px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black data-[state=active]:shadow-md"
                                    >
                                        {t('timer.modes.longBreak')}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
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
                            handleSessionComplete={() => handleSessionComplete(false)}
                            isProcessing={isProcessing}
                        />

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 min-h-[44px]">
                            {!isFocusMode && (
                                <div className={cn(
                                    "transition-opacity duration-300",
                                    mode === 'work' ? "opacity-100" : "opacity-0 pointer-events-none"
                                )}>
                                    <TaskSelector />
                                </div>
                            )}

                            {!isFocusMode && mode === 'work' && dailyPomodoros > 0 && (
                                <div className="animate-in slide-in-from-top-2 fade-in duration-500">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 shadow-sm hover:bg-background/90 transition-colors dark:bg-background/60 dark:hover:bg-background/80 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-row items-center gap-2">
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t('timerComponents.enhancedTimer.today')}</span>
                                                <span className="text-sm font-bold text-foreground leading-none">
                                                    {dailyPomodoros} <span className="text-xs font-normal text-muted-foreground">{t('timerComponents.enhancedTimer.poms')}</span>
                                                </span>
                                            </div>
                                        </div>
                                        {dailyFocusTime > 0 && (
                                            <>
                                                <div className="w-px h-4 bg-border/50" />
                                                <div className="flex flex-row items-center gap-2">
                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t('timerComponents.enhancedTimer.time')}</span>
                                                    <span className="text-sm font-bold text-foreground leading-none">
                                                        {Math.floor(dailyFocusTime / 60)} <span className="text-xs font-normal text-muted-foreground">{t('timerComponents.enhancedTimer.minutes')}</span>
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isFocusMode && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="text-sm font-medium text-primary">{t('timerComponents.enhancedTimer.focusMode')}</span>
                                </div>
                            )}
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
            <div className="absolute bottom-0 left-0 z-10 flex gap-2 items-center ps-4">
                <TooltipProvider>
                    {!isFocusMode && (
                        <>
                            {/* Music button first - with animated icon when playing */}
                            <Tooltip side="top">
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-10 w-10 rounded-full backdrop-blur-sm border transition-all relative overflow-visible",
                                            hasActiveAudio
                                                ? currentlyPlaying?.type === 'youtube'
                                                    ? "bg-red-500/90 border-red-500/50 text-white hover:bg-red-500 shadow-lg shadow-red-500/25 pulse-red"
                                                    : "bg-gradient-to-br from-primary/80 to-primary border-primary/50 text-primary-foreground hover:from-primary hover:to-primary/90 shadow-lg shadow-primary/25"
                                                : "bg-background/20 hover:bg-background/40 border-white/10 text-foreground"
                                        )}
                                        onClick={() => setAudioSettingsOpen(true)}
                                    >
                                        {hasActiveAudio ? (
                                            <div className="flex items-center justify-center">
                                                {currentlyPlaying?.type === 'youtube' ? (
                                                    <svg className="h-5 w-5 text-white fill-current" viewBox="0 0 24 24">
                                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                    </svg>
                                                ) : (
                                                    <AudioLines size={20} animate={isAudioPlaying} className="text-background" />
                                                )}
                                            </div>
                                        ) : (
                                            <Music className="h-5 w-5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>

                                    {hasActiveAudio && currentlyPlaying ? (
                                        <div className="flex items-center gap-2">
                                            {currentlyPlaying.type === 'youtube' ? (
                                                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#ff0000">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                            ) : currentlyPlaying.type === 'spotify' ? (
                                                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#1DB954">
                                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.84-.6 13.5 1.56.42.18.6.78.241 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 14.82 1.14.54.3.72 1.02.42 1.56-.3.54-1.02.72-1.56.42z" />
                                                </svg>
                                            ) : (
                                                <AudioLines size={16} className="shrink-0" animate={isAudioPlaying} />
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="max-w-[180px] truncate">{currentlyPlaying.name}</span>
                                                {activeAmbientSounds.length > 0 && currentlyPlaying.type !== 'ambient' && (
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        + {activeAmbientSounds.length} ambient sound{activeAmbientSounds.length > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : activeAmbientSounds.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <AudioLines size={16} className="shrink-0" animate={true} />
                                            <span className="max-w-[180px] truncate">
                                                {activeAmbientSounds.length === 1
                                                    ? "Ambient Sound Playing"
                                                    : `Mixed Ambient (${activeAmbientSounds.length} sounds)`}
                                            </span>
                                        </div>
                                    ) : (
                                        <p>{t('timerComponents.enhancedTimer.soundSettings')}</p>
                                    )}
                                </TooltipContent>
                            </Tooltip>

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
                                    <p>{t('timerComponents.enhancedTimer.backgroundSettings')}</p>
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
                                        <Clock className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('timerComponents.enhancedTimer.timerSettings')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </>
                    )}

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
                            <p>{isFullscreen ? t('timerComponents.enhancedTimer.exitFocus') : t('timerComponents.enhancedTimer.enterFocus')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Skip Confirmation Dialog */}
            <AlertDialog open={skipConfirmOpen} onOpenChange={setSkipConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('timer.skip_confirm.title') || 'Skip without recording?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('timer.skip_confirm.description') ||
                                `You've completed less than ${MINIMUM_COMPLETION_PERCENT}% of this session. This will not count as a completed pomodoro.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t('common.cancel') || 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmedSkip}>
                            {t('timer.skip_confirm.confirm') || 'Skip anyway'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
export default memo(EnhancedTimer);
