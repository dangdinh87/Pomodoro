'use client';

import { memo, useState, useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTimerEngine } from '../hooks/use-timer-engine';
import { useTimerHotkeys } from '../hooks/use-timer-hotkeys';
import { usePageTitle } from '../hooks/use-page-title';
import { useMascotEvents } from '../hooks/use-mascot-events';

// Imported sub-components
import { TimerModeSelector } from './timer-mode-selector';
import { TimerClockDisplay } from './timer-clock-display';
import { TimerControls } from './timer-controls';
import { DailyProgress } from './daily-progress';
import { TimerSettingsDock } from './timer-settings-dock';
import { TimerGuideDialog } from '@/components/timer/timer-guide-dialog';

const GUIDE_VERSION = 'v1'; // Increment on major updates
const GUIDE_STORAGE_KEY = `timer-guide-shown-${GUIDE_VERSION}`;

export function EnhancedTimer() {
    // 1. Initialize Engine (Side-effects only, no state returned)
    useTimerEngine();

    // 2. Initialize Helpers
    useTimerHotkeys();
    usePageTitle();
    useMascotEvents();

    // 3. Timer Guide state
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        const hasSeenGuide = localStorage.getItem(GUIDE_STORAGE_KEY);
        if (!hasSeenGuide) {
            // Small delay to let the page render first
            const timer = setTimeout(() => setShowGuide(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleCloseGuide = (dontShowAgain: boolean) => {
        if (dontShowAgain) {
            localStorage.setItem(GUIDE_STORAGE_KEY, 'true');
        }
        setShowGuide(false);
    };

    // 4. Render dumb layout
    // Note: No subscription to 'timeLeft' or 'isRunning' here.
    return (
        <>
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

            {/* Timer Guide Dialog - shows on first visit */}
            <TimerGuideDialog open={showGuide} onClose={handleCloseGuide} />
        </>
    );
}

export default memo(EnhancedTimer);
