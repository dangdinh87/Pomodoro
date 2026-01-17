'use client';

import { memo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/animate-ui/components/animate/tabs';
import { useTranslation } from '@/contexts/i18n-context';
import { useTimerStore, TimerMode } from '@/stores/timer-store';

export const TimerModeSelector = memo(function TimerModeSelector() {
    const { t } = useTranslation();
    const mode = useTimerStore((state) => state.mode);
    const setMode = useTimerStore((state) => state.setMode);
    const setTimeLeft = useTimerStore((state) => state.setTimeLeft);
    const settings = useTimerStore((state) => state.settings);
    const setIsRunning = useTimerStore((state) => state.setIsRunning);
    const setDeadlineAt = useTimerStore((state) => state.setDeadlineAt);

    const switchMode = (newMode: TimerMode) => {
        setIsRunning(false);
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

    return (
        <div className="mb-8 flex justify-center">
            <Tabs
                value={mode}
                onValueChange={(val) => switchMode(val as TimerMode)}
                className="w-fit"
            >
                <TabsList className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-black/5 dark:border-white/5 p-1 rounded-full shadow-sm">
                    <TabsTrigger
                        value="work"
                        className="rounded-full px-6 py-2 text-sm font-medium  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black data-[state=active]:shadow-md"
                    >
                        {t('timer.modes.work')}
                    </TabsTrigger>
                    <TabsTrigger
                        value="shortBreak"
                        className="rounded-full px-6 py-2 text-sm font-medium  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black data-[state=active]:shadow-md"
                    >
                        {t('timer.modes.shortBreak')}
                    </TabsTrigger>
                    <TabsTrigger
                        value="longBreak"
                        className="rounded-full px-6 py-2 text-sm font-medium  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black data-[state=active]:shadow-md"
                    >
                        {t('timer.modes.longBreak')}
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
});
