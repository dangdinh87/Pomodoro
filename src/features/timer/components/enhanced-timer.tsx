'use client';

import { YouTubeMiniPlayer } from '@/components/audio/youtube/youtube-mini-player';
import { useTimerStore } from '@/stores/timer-store';
import { useChromeIdle } from '@/hooks/use-chrome-idle';
import { useCelebrationStore } from '@/features/mascot/celebration-store';
import { lazyOnDemand } from '@/lib/lazy-on-demand';
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

// The "session done" dialog (and its confetti) loads with the first celebration, or once the app is idle
const SessionCelebration = lazyOnDemand(() =>
  import('@/features/mascot/session-celebration').then((m) => m.SessionCelebration),
);

function Celebration() {
  const pending = useCelebrationStore((state) => state.pending !== null);
  return <SessionCelebration needed={pending} />;
}

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
      <section className="stage-card sticker-lg flex flex-col items-center p-(--stage-pad)">
        <TimerMascot />
        {/* z-10: belt and braces so no clock face (tall glyph boxes, 3D canvas) can ever sit over the mode chips */}
        <div data-chrome className="relative z-10">
          <TimerModeSelector />
        </div>
        <TimerClockDisplay />
        <div className="mt-(--stage-controls-mt) flex w-full flex-col items-center gap-(--stage-gap-lg)">
          <TimerControls />
          <DailyProgress />
        </div>
      </section>
      {/* The YouTube card: in the flow right under the timer card on a phone, docked bottom-left from md up */}
      <YouTubeMiniPlayer />
      <TimerLiveAnnouncer />
      <ResetTimerDialog />
      <Celebration />
    </div>
  );
}
