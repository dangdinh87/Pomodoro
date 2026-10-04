'use client';

import { useTimerStore } from '@/stores/timer-store';
import { useChromeIdle } from '@/hooks/use-chrome-idle';
import { SessionCelebration } from '@/features/mascot/session-celebration';
import { useTimerEngine } from '../hooks/use-timer-engine';
import { useTimerHotkeys } from '../hooks/use-timer-hotkeys';
import { usePageTitle } from '../hooks/use-page-title';
import { useScreenWakeLock } from '../hooks/use-screen-wake-lock';
import { TimerModeSelector } from './timer-mode-selector';
import { TimerClockDisplay } from './timer-clock-display';
import { TimerControls } from './timer-controls';
import { TimerMascot } from './timer-mascot';
import { ResetTimerDialog } from './reset-timer-dialog';
import { DailyProgress } from './daily-progress';
import { TimerLiveAnnouncer } from './timer-live-announcer';

/**
 * The timer card (spec §7.3): Tomo, mode chips, clock, progress, session tomatoes, controls and the task picker
 * on one big sticker, plus the engine that drives it. The card itself never fades; only the chips and hints
 * (`data-chrome`) do while a session runs and the pointer rests.
 */
export function EnhancedTimer() {
  useTimerEngine();
  const isRunning = useTimerStore((state) => state.isRunning);
  useChromeIdle(isRunning);
  useTimerHotkeys();
  usePageTitle();
  useScreenWakeLock();

  return (
    <div className="z-10 w-full max-w-140">
      <section className="sticker-lg flex flex-col items-center p-5 sm:p-8">
        <TimerMascot />
        <div data-chrome>
          <TimerModeSelector />
        </div>
        <TimerClockDisplay />
        <div className="mt-7 flex w-full flex-col items-center gap-5">
          <TimerControls />
          <DailyProgress />
        </div>
      </section>
      <TimerLiveAnnouncer />
      <ResetTimerDialog />
      <SessionCelebration />
    </div>
  );
}
