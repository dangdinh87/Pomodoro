'use client';

import { memo, useMemo } from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { CheckCircle2 } from 'lucide-react';
import { useStats } from '@/hooks/use-stats';
import { useSystemStore } from '@/stores/system-store';
import { useTimerStore } from '@/stores/timer-store';
import { TaskSelector } from './task-selector';
import { cn } from '@/lib/utils';

export const DailyProgress = memo(function DailyProgress() {
    const { t } = useTranslation();
    const mode = useTimerStore((state) => state.mode);
    const isFocusMode = useSystemStore((state) => state.isFocusMode);

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

    return (
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
    );
});
