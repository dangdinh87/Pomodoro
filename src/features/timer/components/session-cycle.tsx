'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import { useTimerStore } from '@/stores/timer-store';

export const SessionCycle = memo(function SessionCycle() {
    const { t } = useTranslation();
    const mode = useTimerStore((state) => state.mode);
    const sessionCount = useTimerStore((state) => state.sessionCount);
    const interval = useTimerStore((state) => state.settings.longBreakInterval);
    const usePlan = useTimerStore((state) => state.usePlan);

    if (usePlan || interval < 1) return null;

    const isWork = mode === 'work';
    // Same height as the label row, so switching modes doesn't shift the clock.
    if (!isWork && sessionCount === 0) return <div className="h-5" aria-hidden="true" />;
    const done = isWork || sessionCount % interval !== 0 ? sessionCount % interval : interval;
    const current = isWork ? done + 1 : null;

    const label = isWork
        ? t('timerUi.sessionOf').replace('{current}', String(current)).replace('{total}', String(interval))
        : t('timerUi.sessionsDone').replace('{done}', String(done)).replace('{total}', String(interval));

    return (
        <div className="flex items-center justify-center gap-3 text-[0.8125rem] text-ink-muted">
            <span>{label}</span>
            <span className="flex items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: interval }, (_, i) => (
                    <span
                        key={i}
                        className={cn(
                            'h-2 w-2 rounded-full border transition-colors duration-200',
                            i < done
                                ? 'border-primary bg-primary'
                                : i === current! - 1
                                  ? 'border-primary'
                                  : 'border-border-strong',
                        )}
                    />
                ))}
            </span>
        </div>
    );
});
