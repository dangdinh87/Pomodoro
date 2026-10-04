import { useCallback, useEffect, useState } from 'react';
import {
  askNotificationPermission,
  getNotificationState,
  type NotificationState,
} from './notifications';

/** Live browser-notification permission, plus `ask` (call it from a click). */
export function useNotificationState() {
  const [state, setState] = useState<NotificationState>(getNotificationState);

  // The user can change the permission from the browser UI while this is open
  useEffect(() => {
    let status: PermissionStatus | undefined;
    let cancelled = false;
    const sync = () => setState(getNotificationState());
    sync();
    try {
      void navigator.permissions
        ?.query({ name: 'notifications' })
        .then((s) => {
          if (cancelled) return;
          status = s;
          s.addEventListener('change', sync);
        })
        .catch(() => {});
    } catch {
      // Permissions API not available
    }
    return () => {
      cancelled = true;
      status?.removeEventListener('change', sync);
    };
  }, []);

  const ask = useCallback(async () => setState(await askNotificationPermission()), []);
  return { state, ask };
}
