import { useEffect } from 'react';
import { isFeatureEnabled } from '@/config/feature-flags';
import { PANELS } from './panel-registry';
import { openPanel, PANEL_IDS } from './panel-store';
import { shouldIgnoreShortcut } from './keyboard-guard';

const BY_HOTKEY = new Map(
  PANEL_IDS.filter((id) => PANELS[id].hotkey && (id !== 'stats' || isFeatureEnabled('history'))).map((id) => [
    PANELS[id].hotkey!,
    id,
  ]),
);

/** T/S/B/C/H/G open their panel from the timer. */
export function usePanelHotkeys() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const id = BY_HOTKEY.get(event.key.toLowerCase());
      if (!id || shouldIgnoreShortcut(event)) return;
      event.preventDefault();
      openPanel(id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
