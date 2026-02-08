'use client';

import { memo, useMemo } from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { CheckCircle2, Target, Coffee } from 'lucide-react';
import { useStats } from '@/hooks/use-stats';
import { useSystemStore } from '@/stores/system-store';
import { useTimerStore } from '@/stores/timer-store';
import { useTasksStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { TaskSelector } from './task-selector';

export const DailyProgress = memo(function DailyProgress() {
    const { t } = useTranslation();
    const mode = useTimerStore((state) => state.mode);
    const isFocusMode = useSystemStore((state) => state.isFocusMode);
    const activeTaskId = useTasksStore((state) => state.activeTaskId);

    const todayRange = useMemo(() => {
        const now = new Date();
        return {
            from: now,
            to: now
        };
    }, []);

    // Fetch all incomplete tasks (no date filter) to find active task reliably
    const { tasks } = useTasks({ statusFilter: 'all', limit: 50 });
    const activeTask = tasks.find((task) => task.id === activeTaskId);

    const { data: statsData } = useStats(todayRange);
    const dailyPomodoros = statsData?.summary.completedSessions || 0;
    const dailyFocusTime = statsData?.summary.totalFocusTime || 0;

    const isBreakMode = mode === 'shortBreak' || mode === 'longBreak';

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 min-h-[44px]">
            {/* Work mode: Show interactive TaskSelector */}
            {!isFocusMode && mode === 'work' && (
                <div className="transition-opacity duration-300">
                    <TaskSelector />
                </div>
            )}

            {/* Break mode: Show read-only task indicator */}
            {!isFocusMode && isBreakMode && activeTask && (
                <div className="animate-in fade-in duration-300">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-background/80 dark:bg-background/60 backdrop-blur-md border border-border/50 shadow-sm opacity-70">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-muted text-muted-foreground">
                                <Coffee className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-muted-foreground">{t('timer.breakTask') || 'Next up'}:</span>
                            <span className="text-xs font-medium text-foreground truncate max-w-[150px]">{activeTask.title}</span>
                        </div>
                    </div>
                </div>
            )}

            {!isFocusMode && mode === 'work' && dailyPomodoros > 0 && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-500">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 shadow-sm hover:bg-background/90 transition-colors dark:bg-background/60 dark:hover:bg-background/80 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-foreground/10 text-foreground">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/20 backdrop-blur-md border border-foreground/30 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-foreground"></div>
                    <span className="text-sm font-medium text-foreground">{t('timerComponents.enhancedTimer.focusMode')}</span>
                </div>
            )}
        </div>
    );
});
