'use client';

import { useEffect } from 'react';
import { EnhancedTimer } from '@/features/timer/components/enhanced-timer';
import { useTimerStore } from '@/stores/timer-store';
import { AppDock } from './app-dock';
import { AppStatusBar } from './app-status-bar';
import { CommandPalette } from './command-palette';
import { PanelHost } from './panel-host';
import { preloadPanelsWhenIdle } from './panel-loaders';
import { syncPanelFromUrl, usePanelStore } from './panel-store';
import { usePanelHotkeys } from './use-panel-hotkeys';

/** The whole app on one screen: the timer stage, with everything else opened as a panel over it. */
export default function AppHome({ googleEnabled }: { googleEnabled: boolean }) {
  const mode = useTimerStore((state) => state.mode);
  usePanelHotkeys();

  // Lets the scene layer (outside the stage) tint itself by mode.
  useEffect(() => {
    document.documentElement.dataset.timerMode = mode;
  }, [mode]);

  // While a panel covers the stage, the animated scene pauses (see SceneCanvas):
  // it is hidden or dimmed anyway, and the freed GPU keeps panel animations smooth.
  const panelOpen = usePanelStore((state) => state.active !== null);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-panel-open', panelOpen);
  }, [panelOpen]);

  useEffect(() => preloadPanelsWhenIdle(), []);

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
        data-mode={mode}
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
