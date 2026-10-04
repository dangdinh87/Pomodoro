import type { TimerMode } from '@/stores/timer-store';

type Translate = (key: string) => string;

export type NotificationState = NotificationPermission | 'unsupported';

const supported = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export function getNotificationState(): NotificationState {
  return supported() ? Notification.permission : 'unsupported';
}

/** Prompts (only while undecided) and returns the resulting state. Call from a click. */
export async function askNotificationPermission(): Promise<NotificationState> {
  if (!supported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/** Call from a user gesture (e.g. the Start click), never on page load. */
export function requestNotificationPermission(): void {
  if (!supported() || Notification.permission !== 'default') return;
  try {
    void Notification.requestPermission();
  } catch {
    // Older browsers throw on the promise form; ignore
  }
}

const TEXT_KEY: Record<TimerMode, string> = {
  work: 'timer.notifications.focusDone',
  shortBreak: 'timer.notifications.breakDone',
  longBreak: 'timer.notifications.longBreakDone',
};

/**
 * Shows a system notification in the UI language (`t`), but only when the tab
 * is not visible: with the tab in view the bell and confetti already say it.
 */
export function notifyPhaseComplete(mode: TimerMode, t: Translate): void {
  if (!supported() || !document.hidden) return;
  if (Notification.permission !== 'granted') return;
  const key = TEXT_KEY[mode];
  try {
    new Notification(t(`${key}.title`), { body: t(`${key}.body`), tag: 'timer-complete' });
  } catch {
    // Some mobile browsers only allow notifications via service workers
  }
}
