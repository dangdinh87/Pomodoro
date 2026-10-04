'use client';

import { memo } from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { Coffee } from '@phosphor-icons/react/dist/ssr';
import { useStats } from '@/hooks/use-stats';
import { useAuth } from '@/hooks/use-auth';
import { useSystemStore } from '@/stores/system-store';
import { useTimerStore } from '@/stores/timer-store';
import { useTasksStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { studyTodayDate } from '@/lib/stats/study-day';
import { TaskSelector } from './task-selector';

export const DailyProgress = memo(function DailyProgress() {
    const { t } = useTranslation();
    const { hasSession } = useAuth();
    const mode = useTimerStore((state) => state.mode);
    const isFocusMode = useSystemStore((state) => state.isFocusMode);
    const activeTaskId = useTasksStore((state) => state.activeTaskId);

    // Today's study day (the day starts at 04:00); recomputed per render so it rolls over without a reload.
    const today = studyTodayDate();
    const todayRange = { from: today, to: today };

    const { tasks } = useTasks({ statusFilter: 'all', limit: 50 });
    const activeTask = tasks.find((task) => task.id === activeTaskId);

    const { data: statsData } = useStats(todayRange);
    const sessions = statsData?.summary.completedSessions || 0;
    const focusMinutes = Math.floor((statsData?.summary.totalFocusTime || 0) / 60);

    const isBreakMode = mode === 'shortBreak' || mode === 'longBreak';

    const formatMinutes = (total: number) => {
        const hours = Math.floor(total / 60);
        const minutes = total % 60;
        return hours > 0
            ? t('timerUi.timeHm').replace('{h}', String(hours)).replace('{m}', String(minutes))
            : t('timerUi.timeM').replace('{m}', String(minutes));
    };

    const summary =
        sessions > 0
            ? t(sessions === 1 ? 'timerUi.todaySummaryOne' : 'timerUi.todaySummary')
                  .replace('{count}', String(sessions))
                  .replace('{time}', formatMinutes(focusMinutes))
            : null;

    if (isFocusMode) return null;

    return (
        <div className="flex min-h-[44px] flex-col items-center gap-3">
            {mode === 'work' && <TaskSelector />}

            {isBreakMode && activeTask && (
                <div className="inline-flex h-10 max-w-[min(88vw,320px)] items-center gap-2 rounded-full border border-border bg-surface/60 px-4 backdrop-blur-md">
                    <Coffee size={14} className="shrink-0 text-ink-faint" aria-hidden="true" />
                    <span className="shrink-0 text-xs text-ink-muted">{t('timer.breakTask')}:</span>
                    <span className="truncate text-[0.8125rem] font-medium text-ink">{activeTask.title}</span>
                </div>
            )}

            {hasSession && summary && <p data-chrome className="text-xs text-ink-muted tabular-nums">{summary}</p>}
        </div>
    );
});
