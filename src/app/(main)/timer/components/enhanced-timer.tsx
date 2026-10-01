'use client';

import { memo, useState, useEffect } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import { useChromeIdle } from '@/hooks/use-chrome-idle';
import { useTimerEngine } from '../hooks/use-timer-engine';
import { useTimerHotkeys } from '../hooks/use-timer-hotkeys';
import { usePageTitle } from '../hooks/use-page-title';

// Imported sub-components
import { TimerModeSelector } from './timer-mode-selector';
import { TimerClockDisplay } from './timer-clock-display';
import { TimerControls } from './timer-controls';
import { DailyProgress } from './daily-progress';
import { TimerSettingsDock } from './timer-settings-dock';
import { TimerGuideDialog } from '@/components/timer/timer-guide-dialog';

const GUIDE_VERSION = 'v1'; // Increment on major updates
const GUIDE_STORAGE_KEY = `timer-guide-shown-${GUIDE_VERSION}`;
/** Set to true to temporarily hide the Pomodoro guide modal on timer page */
const HIDE_GUIDE_TEMPORARILY = true;

export function EnhancedTimer() {
    // 1. Initialize Engine (Side-effects only, no state returned)
    useTimerEngine();

    // 2. Initialize Helpers
    const mode = useTimerStore((state) => state.mode);
    const isRunning = useTimerStore((state) => state.isRunning);
    useChromeIdle(isRunning);
    useTimerHotkeys();
    usePageTitle();

    // 3. Timer Guide state
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        if (HIDE_GUIDE_TEMPORARILY) return;
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

    return (
        <>
            <div
                data-theme="dark"
                data-timer
                data-mode={mode === 'work' ? 'work' : 'break'}
                className="relative flex min-h-[calc(100dvh-56px-64px-env(safe-area-inset-bottom))] w-full flex-col items-center justify-center px-[clamp(16px,4vw,32px)] pb-20 pt-6 md:min-h-[calc(100dvh-56px)]"
            >
                <div className="z-10 flex w-full max-w-xl flex-col items-center">
                    <div data-chrome>
                        <TimerModeSelector />
                    </div>
                    <TimerClockDisplay />
                    <div className="mt-8 flex flex-col items-center gap-8">
                        <TimerControls />
                        <DailyProgress />
                    </div>
                </div>

                <TimerSettingsDock />
            </div>

            <TimerGuideDialog open={showGuide} onClose={handleCloseGuide} />
        </>
    );
}

export default memo(EnhancedTimer);
