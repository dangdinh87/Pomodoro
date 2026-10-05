/**
 * Whether this tab is running the timer engine right now. The engine lives on the app page only
 * ((main)); on the content pages (guide, privacy, terms) nobody drives the timer, and the deadline
 * watcher rings in its place. A counter, not a flag: StrictMode mounts effects twice.
 */
let mounted = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

/** Call from the engine's mount effect; returns the unmount cleanup (idempotent). */
export function markEngineMounted(): () => void {
  mounted += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    mounted -= 1;
    emit();
  };
}

export function isEngineMounted(): boolean {
  return mounted > 0;
}

/** Notifies on every mount and unmount of an engine. Returns the unsubscribe. */
export function subscribeEnginePresence(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
