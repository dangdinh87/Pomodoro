'use client';

import { memo } from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { Coffee } from '@phosphor-icons/react/dist/ssr';
import { useStats } from '@/hooks/use-stats';
import { useAuth } from '@/hooks/use-auth';
import { useSystemStore } from '@/stores/system-store';
import { useTimerStore } from '@/stores/timer-store';
import { studyTodayDate } from '@/lib/stats/study-day';
import { useActiveTask } from '../hooks/use-active-task';
import { TaskSelector } from './task-selector';

export const DailyProgress = memo(function DailyProgress() {
    const { t } = useTranslation();
    const { hasSession } = useAuth();
    const mode = useTimerStore((state) => state.mode);
    const isFocusMode = useSystemStore((state) => state.isFocusMode);

    // Today's study day (the day starts at 04:00); recomputed per render so it rolls over without a reload.
    const today = studyTodayDate();
    const todayRange = { from: today, to: today };

    const activeTask = useActiveTask();

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
        <div className="flex min-h-[48px] w-full flex-col items-center gap-3">
            {mode === 'work' && <TaskSelector className="w-full" />}

            {isBreakMode && activeTask && (
                <div className="inline-flex h-11 max-w-full items-center gap-2 rounded-full border-2 border-outline bg-surface-raised px-4">
                    <Coffee size={16} weight="bold" className="shrink-0 text-ink-secondary" aria-hidden="true" />
                    <span className="shrink-0 text-[0.8125rem] font-semibold text-ink-secondary">{t('timer.breakTask')}:</span>
                    <span className="truncate font-heading text-[0.9375rem] font-bold text-ink">{activeTask.title}</span>
                </div>
            )}

            {hasSession && summary && <p data-chrome className="text-[0.8125rem] font-semibold text-ink-secondary tabular-nums">{summary}</p>}
        </div>
    );
});
