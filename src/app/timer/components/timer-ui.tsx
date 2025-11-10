'use client';

import TimerSettingsModal from '@/components/settings/timer-settings-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useBackground } from '@/contexts/background-context';
import { cn } from '@/lib/utils';
import { useTimerStore, type TimerMode } from '@/stores/timer-store';
import { Briefcase, Coffee, Settings } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import ClockDisplay from './clock-display';
import TimerControls from './timer-controls';
import { useTimerLogic } from './timer-logic';

function useModeButtonClass(hasMediaBg: boolean) {
  return useCallback(
    (buttonMode: TimerMode, currentMode: TimerMode) =>
      cn(
        'rounded-full',
        hasMediaBg
          ? currentMode === buttonMode
            ? 'bg-primary/90 text-primary-foreground border-primary/50'
            : 'bg-black/20 backdrop-blur-md border-white/30 hover:bg-black/30'
          : currentMode === buttonMode
          ? 'bg-primary/90 text-primary-foreground border-primary/50'
          : 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20',
      ),
    [hasMediaBg],
  );
}

function TimerUI() {
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false);
  const { background } = useBackground();
  const { mode, settings } = useTimerStore();
  const {
    // state
    timeLeft,
    isRunning,
    // computed
    totalTimeForMode,
    progressPercent,
    // actions
    toggleTimer,
    resetTimer,
    switchMode,
    handleSessionComplete,
  } = useTimerLogic();

  const hasImageOrVideoBackground = background.type === 'image';
  const modeButtonClass = useModeButtonClass(hasImageOrVideoBackground);

  const containerClass = useMemo(
    () =>
      cn(
        'bg-transparent backdrop-blur-sm border-white/10 shadow-none',
        hasImageOrVideoBackground && 'bg-black/5',
      ),
    [hasImageOrVideoBackground],
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className={containerClass}>
        <CardHeader className="text-center relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTimerSettingsOpen(true)}
            title="Cài đặt chung"
            className={cn(
              'absolute top-0 right-0 rounded-lg shadow-lg',
              hasImageOrVideoBackground
                ? 'bg-black/30 backdrop-blur-md border-white/30 hover:bg-black/40'
                : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20',
            )}
            aria-label="Open unified settings"
          >
            <Settings size={16} />
          </Button>

          <div className="mb-6 flex justify-center gap-3">
            <Button
              variant={mode === 'work' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchMode('work')}
              className={modeButtonClass('work', mode)}
            >
              <Briefcase size={14} className="mr-1" />
              Work
            </Button>
            <Button
              variant={mode === 'shortBreak' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchMode('shortBreak')}
              className={modeButtonClass('shortBreak', mode)}
            >
              <Coffee size={14} className="mr-1" />
              Short Break
            </Button>
            <Button
              variant={mode === 'longBreak' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchMode('longBreak')}
              className={modeButtonClass('longBreak', mode)}
            >
              <Coffee size={14} className="mr-1" />
              Long Break
            </Button>
          </div>

          <ClockDisplay
            clockType={settings.clockType}
            timeLeft={timeLeft}
            isRunning={isRunning}
            totalTimeForMode={totalTimeForMode}
            progressPercent={progressPercent}
            lowTimeWarningEnabled={settings.lowTimeWarningEnabled ?? true}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <TimerControls
            isRunning={isRunning}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            handleSessionComplete={handleSessionComplete}
            hasImageOrVideoBackground={hasImageOrVideoBackground}
          />
        </CardContent>
      </Card>

      <TimerSettingsModal
        isOpen={isTimerSettingsOpen}
        onClose={() => setIsTimerSettingsOpen(false)}
      />
    </div>
  );
}

export default memo(TimerUI);
