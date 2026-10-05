'use client';

import { useEffect, useReducer, type ComponentType } from 'react';

type Preload = () => Promise<void>;

/** Every on-demand component created so far, so the app can warm them all once it is idle. */
const registry = new Set<{ preload: Preload }>();

export type OnDemand<P extends object> = ComponentType<P & { needed: boolean }> & { preload: Preload };

/**
 * A component whose code is fetched the first time it is `needed` (a dialog or sheet opening, a
 * celebration starting), not with the page. Until then it renders nothing; once loaded it stays
 * mounted like a static import would, so close animations and state behave the same.
 * No Suspense (same reason as `lazyPanel`): a preloaded chunk renders on the first frame.
 */
export function lazyOnDemand<P extends object>(load: () => Promise<ComponentType<P>>): OnDemand<P> {
  let Loaded: ComponentType<P> | null = null;
  let pending: Promise<void> | null = null;
  const preload: Preload = () =>
    (pending ??= load().then(
      (component) => {
        Loaded = component;
      },
      (error) => {
        // Let the next open try again (offline, deploy swapped the chunks)
        pending = null;
        throw error;
      },
    ));

  function LazyOnDemand({ needed, ...props }: P & { needed: boolean }) {
    const [, rerender] = useReducer((n: number) => n + 1, 0);
    useEffect(() => {
      if (needed && !Loaded) preload().then(rerender, (error) => console.error(error));
    }, [needed]);
    return Loaded ? <Loaded {...(props as unknown as P)} /> : null;
  }
  LazyOnDemand.preload = preload;
  registry.add(LazyOnDemand);
  return LazyOnDemand;
}

/** Fetches every on-demand chunk (best effort). The app calls it once the browser is idle. */
export function preloadAllOnDemand(): void {
  registry.forEach((lazy) => void lazy.preload().catch(() => {}));
}
