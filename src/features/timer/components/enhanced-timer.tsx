'use client';

import { useState } from 'react';
import { ArrowLeft, Clock } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { YouTubeMiniPlayer } from '@/components/audio/youtube/youtube-mini-player';
import { useTimerStore } from '@/stores/timer-store';
import { useChromeIdle } from '@/hooks/use-chrome-idle';
import { useCelebrationStore } from '@/features/mascot/celebration-store';
import { useTranslation } from '@/contexts/i18n-context';
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
import { RealTimeClock } from './real-time-clock';

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
  const { t } = useTranslation();
  // Display-only toggle: swaps the big clock between the Pomodoro countdown and the real wall-clock time.
  // It never touches the timer engine, so the countdown keeps running underneath either way.
  const [view, setView] = useState<'pomodoro' | 'clock'>('pomodoro');

  return (
    <div className="z-10 w-full max-w-140">
      <section className="stage-card sticker-lg flex flex-col items-center p-(--stage-pad)">
        <TimerMascot />
        {view === 'pomodoro' ? (
          <>
            {/* z-10: belt and braces so no clock face (tall glyph boxes, 3D canvas) can ever sit over the mode chips */}
            <div data-chrome className="relative z-10 flex flex-col items-center gap-(--stage-gap)">
              <TimerModeSelector />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setView('clock')}
                className="gap-1.5 text-ink-secondary"
              >
                <Clock size={16} weight="bold" aria-hidden="true" />
                {t('timerUi.realClock.view')}
              </Button>
            </div>
            <TimerClockDisplay />
            <div className="mt-(--stage-controls-mt) flex w-full flex-col items-center gap-(--stage-gap-lg)">
              <TimerControls />
              <DailyProgress />
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col items-center gap-(--stage-gap-lg) py-(--stage-gap-lg)">
            <RealTimeClock />
            <Button type="button" variant="secondary" size="sm" onClick={() => setView('pomodoro')} className="gap-1.5">
              <ArrowLeft size={16} weight="bold" aria-hidden="true" />
              {t('timerUi.realClock.back')}
            </Button>
          </div>
        )}
      </section>
      {/* The YouTube card: in the flow right under the timer card on a phone, docked bottom-left from md up */}
      <YouTubeMiniPlayer />
      <TimerLiveAnnouncer />
      <ResetTimerDialog />
      <Celebration />
    </div>
  );
}
