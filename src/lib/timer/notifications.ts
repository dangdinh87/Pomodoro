import type { TimerMode } from '@/stores/timer-store';

const supported = () =>
  typeof window !== 'undefined' && 'Notification' in window;

/** Call from a user gesture (e.g. the Start click), never on page load. */
export function requestNotificationPermission(): void {
  if (!supported() || Notification.permission !== 'default') return;
  try {
    void Notification.requestPermission();
  } catch {
    // Older browsers throw on the promise form; ignore
  }
}

/** Shows a system notification, but only when the tab is not visible. */
export function notifyPhaseComplete(mode: TimerMode): void {
  if (!supported() || !document.hidden) return;
  if (Notification.permission !== 'granted') return;
  const body =
    mode === 'work'
      ? 'Focus session complete. Time for a break!'
      : 'Break is over. Ready to focus?';
  try {
    new Notification('Study Bro', { body, tag: 'timer-complete' });
  } catch {
    // Some mobile browsers only allow notifications via service workers
  }
}
