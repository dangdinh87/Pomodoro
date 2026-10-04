'use client';

import { useTimerStore } from '@/stores/timer-store';
import { useChromeIdle } from '@/hooks/use-chrome-idle';
import { useTimerEngine } from '../hooks/use-timer-engine';
import { useTimerHotkeys } from '../hooks/use-timer-hotkeys';
import { usePageTitle } from '../hooks/use-page-title';
import { TimerModeSelector } from './timer-mode-selector';
import { TimerClockDisplay } from './timer-clock-display';
import { TimerControls } from './timer-controls';
import { ResetTimerDialog } from './reset-timer-dialog';
import { DailyProgress } from './daily-progress';
import { TimerLiveAnnouncer } from './timer-live-announcer';

/** Mode chips, clock, controls and today's progress, plus the engine that drives them. */
export function EnhancedTimer() {
  useTimerEngine();
  const isRunning = useTimerStore((state) => state.isRunning);
  useChromeIdle(isRunning);
  useTimerHotkeys();
  usePageTitle();

  return (
    <div className="z-10 flex w-full max-w-xl flex-col items-center">
      <div data-chrome>
        <TimerModeSelector />
      </div>
      <TimerClockDisplay />
      <div className="mt-8 flex flex-col items-center gap-8">
        <TimerControls />
        <DailyProgress />
      </div>
      <TimerLiveAnnouncer />
      <ResetTimerDialog />
    </div>
  );
}
