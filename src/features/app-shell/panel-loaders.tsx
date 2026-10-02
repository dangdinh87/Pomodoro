'use client';

import { useEffect, useReducer, type ComponentType } from 'react';
import type { PanelId } from './panel-store';

/** Holds the panel's shape while its chunk loads, so the sheet/dialog animates in right away. */
function PanelSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4 px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <div className="h-7 w-40 rounded bg-surface-raised" />
      <div className="h-4 w-64 max-w-full rounded bg-surface-raised" />
      <div className="h-28 rounded-lg bg-surface-raised" />
      <div className="h-28 rounded-lg bg-surface-raised" />
    </div>
  );
}

type LazyPanel = ComponentType & { preload: () => Promise<void> };

/**
 * Code-split panel without Suspense. With next/dynamic (React.lazy) even a
 * preloaded chunk suspends once, and React holds that fallback for ~300 ms,
 * so the dialog jumped when the real content replaced the skeleton. Here a
 * preloaded panel renders on the first frame.
 */
function lazyPanel(load: () => Promise<{ default: ComponentType }>): LazyPanel {
  let Loaded: ComponentType | null = null;
  let pending: Promise<void> | null = null;
  const preload = () =>
    (pending ??= load().then(
      (mod) => {
        Loaded = mod.default;
      },
      (error) => {
        pending = null;
        throw error;
      },
    ));

  function Panel() {
    const [, rerender] = useReducer((n: number) => n + 1, 0);
    useEffect(() => {
      if (!Loaded) preload().then(rerender, () => {});
    }, []);
    return Loaded ? <Loaded /> : <PanelSkeleton />;
  }
  Panel.preload = preload;
  return Panel;
}

export const LAZY_PANELS = {
  tasks: lazyPanel(() => import('@/features/panels/tasks-panel')),
  stats: lazyPanel(() => import('@/features/panels/stats-panel')),
  arcade: lazyPanel(() => import('@/features/panels/arcade-panel')),
  settings: lazyPanel(() => import('@/features/panels/settings-panel')),
  feedback: lazyPanel(() => import('@/features/panels/feedback-panel')),
} satisfies Partial<Record<PanelId, LazyPanel>>;

export function preloadPanel(id: PanelId) {
  void LAZY_PANELS[id as keyof typeof LAZY_PANELS]?.preload().catch(() => {});
}

/** Warms every panel chunk once the browser is idle after the timer has rendered. */
export function preloadPanelsWhenIdle() {
  const run = () => (Object.keys(LAZY_PANELS) as PanelId[]).forEach(preloadPanel);
  // Safari has no requestIdleCallback.
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = setTimeout(run, 2000);
  return () => clearTimeout(handle);
}
