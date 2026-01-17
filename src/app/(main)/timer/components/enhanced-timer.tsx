'use client';

import { memo } from 'react';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTimerEngine } from '../hooks/use-timer-engine';
import { useTimerHotkeys } from '../hooks/use-timer-hotkeys';
import { usePageTitle } from '../hooks/use-page-title';

// Imported sub-components
import { TimerModeSelector } from './timer-mode-selector';
import { TimerClockDisplay } from './timer-clock-display';
import { TimerControls } from './timer-controls';
import { DailyProgress } from './daily-progress';
import { TimerSettingsDock } from './timer-settings-dock';

export function EnhancedTimer() {
    // 1. Initialize Engine (Side-effects only, no state returned)
    useTimerEngine();

    // 2. Initialize Helpers
    useTimerHotkeys();
    usePageTitle();

    // 3. Render dumb layout
    // Note: No subscription to 'timeLeft' or 'isRunning' here.
    return (
        <div className="w-full min-h-[calc(100vh-6rem)] relative flex flex-col justify-center">
            <div className="w-full max-w-xl mx-auto z-10">
                <div className={cn('bg-transparent border-0')}>
                    <div className="text-center relative">
                        <TimerModeSelector />

                        <div className="pb-8 pt-4">
                            <TimerClockDisplay />
                        </div>
                    </div>

                    <CardContent className="space-y-6">
                        <TimerControls />
                        <DailyProgress />
                    </CardContent>
                </div>
            </div>

            {/* Bottom Left Settings Controls */}
            <TimerSettingsDock />
        </div>
    );
}

export default memo(EnhancedTimer);
