'use client';

import { Component, useEffect, useReducer, useState, type ComponentType, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { lazyOnDemand, preloadAllOnDemand } from '@/lib/lazy-on-demand';
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

/** A panel that could not load or crashed: say so, and let the user retry in place. */
function PanelError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-5 py-16 text-center sm:px-8">
      <h2 className="font-heading text-lg font-bold text-ink">{t('shell.panelError.title')}</h2>
      <p className="max-w-xs text-sm text-ink-secondary">{t('shell.panelError.description')}</p>
      <Button onClick={onRetry}>{t('errors.boundary.retry')}</Button>
    </div>
  );
}

/** Catches a panel that throws while rendering; "Try again" mounts it afresh. */
class PanelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error(error);
  }
  render() {
    return this.state.failed ? (
      <PanelError onRetry={() => this.setState({ failed: false })} />
    ) : (
      this.props.children
    );
  }
}

export type LazyPanel = ComponentType & { preload: () => Promise<void> };

/**
 * Code-split panel without Suspense. With next/dynamic (React.lazy) even a
 * preloaded chunk suspends once, and React holds that fallback for ~300 ms,
 * so the dialog jumped when the real content replaced the skeleton. Here a
 * preloaded panel renders on the first frame.
 */
export function lazyPanel(load: () => Promise<{ default: ComponentType }>): LazyPanel {
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
    const [failed, setFailed] = useState(false);
    const load = () => preload().then(rerender, () => setFailed(true));
    useEffect(() => {
      if (!Loaded) void load();
    }, []);
    const retry = () => {
      setFailed(false);
      void load();
    };
    if (Loaded) {
      return (
        <PanelBoundary>
          <Loaded />
        </PanelBoundary>
      );
    }
    return failed ? <PanelError onRetry={retry} /> : <PanelSkeleton />;
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

/**
 * Panels that bring their own sheet or dialog (sound, scene, timer settings, sign-in). Their code, and
 * their icons (the sound list alone has 36), loads when one first opens, on hover, or once the app is idle.
 */
export const LAZY_OVERLAYS = {
  sound: lazyOnDemand(() => import('@/components/audio/audio-sidebar').then((m) => m.AudioSidebar)),
  scene: lazyOnDemand(() => import('@/components/settings/background-settings-modal').then((m) => m.default)),
  timer: lazyOnDemand(() => import('@/components/settings/timer-settings-modal').then((m) => m.TimerSettingsModal)),
  login: lazyOnDemand(() => import('@/components/auth/login-form').then((m) => m.LoginForm)),
} satisfies Partial<Record<PanelId, { preload: () => Promise<void> }>>;

export function preloadPanel(id: PanelId) {
  const lazy =
    LAZY_PANELS[id as keyof typeof LAZY_PANELS] ?? LAZY_OVERLAYS[id as keyof typeof LAZY_OVERLAYS];
  void lazy?.preload().catch(() => {});
}

/**
 * Warms every panel chunk once the browser is idle after the timer has rendered, and the other
 * on-demand pieces with them (sound, scene and timer settings, sign-in, command palette, celebration).
 */
export function preloadPanelsWhenIdle() {
  // Data Saver: a panel loads when it is opened (or hovered), not speculatively
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return () => {};
  const run = () => {
    (Object.keys(LAZY_PANELS) as PanelId[]).forEach(preloadPanel);
    preloadAllOnDemand();
  };
  // Safari has no requestIdleCallback.
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = setTimeout(run, 2000);
  return () => clearTimeout(handle);
}
