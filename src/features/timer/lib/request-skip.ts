type SkipHandler = () => void;

let handler: SkipHandler | null = null;

/**
 * `TimerControls` registers here while it is mounted: it owns the session recorder
 * and the "Skip this session?" confirmation, so the skip rules live in one place.
 * Returns the cleanup. A later registration replaces an earlier one, and a stale
 * cleanup never removes the newer handler.
 */
export function registerTimerSkip(next: SkipHandler): () => void {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}

/**
 * The one way to skip from the UI (the skip button, the command palette). A running timer asks
 * first; a paused one skips at once and records the focus so far. Returns false when no timer
 * is mounted to handle it.
 */
export function requestTimerSkip(): boolean {
  if (!handler) return false;
  handler();
  return true;
}
