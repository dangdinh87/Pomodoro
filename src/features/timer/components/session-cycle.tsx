'use client';

import { memo } from 'react';
import { SessionTomatoes } from '@/components/ui/session-tomatoes';
import { useTranslation } from '@/contexts/i18n-context';
import { useTimerStore } from '@/stores/timer-store';

/** Tomatoes for the sessions of the cycle, with "Session 2 of 4" (or "2 of 4 sessions done" on a break). */
export const SessionCycle = memo(function SessionCycle() {
    const { t } = useTranslation();
    const mode = useTimerStore((state) => state.mode);
    const sessionCount = useTimerStore((state) => state.sessionCount);
    const interval = useTimerStore((state) => state.settings.longBreakInterval);
    const usePlan = useTimerStore((state) => state.usePlan);

    if (usePlan || interval < 1) return null;

    const isWork = mode === 'work';
    // Same height as the full row, so switching modes doesn't shift the clock.
    if (!isWork && sessionCount === 0) return <div className="h-[26px]" aria-hidden="true" />;
    const done = isWork || sessionCount % interval !== 0 ? sessionCount % interval : interval;
    const current = isWork ? done + 1 : null;

    const label = isWork
        ? t('timerUi.sessionOf').replace('{current}', String(current)).replace('{total}', String(interval))
        : t('timerUi.sessionsDone').replace('{done}', String(done)).replace('{total}', String(interval));

    return (
        <div className="flex min-h-[26px] flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {/* The visible label already says where the cycle is; the tomatoes would repeat it (differently on a break) */}
            <span aria-hidden="true">
                <SessionTomatoes completed={done} total={interval} />
            </span>
            <span className="font-heading text-[0.9375rem] font-bold text-ink-secondary">{label}</span>
        </div>
    );
});
