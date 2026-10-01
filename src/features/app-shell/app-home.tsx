'use client';

import { useEffect } from 'react';
import { EnhancedTimer } from '@/features/timer/components/enhanced-timer';
import { useTimerStore } from '@/stores/timer-store';
import { AppDock } from './app-dock';
import { AppStatusBar } from './app-status-bar';
import { CommandPalette } from './command-palette';
import { PanelHost } from './panel-host';
import { syncPanelFromUrl } from './panel-store';
import { usePanelHotkeys } from './use-panel-hotkeys';

/** The whole app on one screen: the timer stage, with everything else opened as a panel over it. */
export default function AppHome({ googleEnabled }: { googleEnabled: boolean }) {
  const mode = useTimerStore((state) => state.mode);
  usePanelHotkeys();

  useEffect(() => {
    syncPanelFromUrl();
    window.addEventListener('popstate', syncPanelFromUrl);
    return () => window.removeEventListener('popstate', syncPanelFromUrl);
  }, []);

  return (
    <>
      <section
        data-theme="dark"
        data-timer
        data-mode={mode === 'work' ? 'work' : 'break'}
        className="relative flex min-h-dvh w-full flex-col items-center justify-center px-[clamp(16px,4vw,32px)] pb-24 pt-16"
      >
        <AppStatusBar />
        <EnhancedTimer />
        <AppDock />
      </section>
      <PanelHost googleEnabled={googleEnabled} />
      <CommandPalette />
    </>
  );
}
