'use client';

import { useEffect } from 'react';
import { lazyOnDemand } from '@/lib/lazy-on-demand';
import { openCommandPalette, setPaletteOpen, usePaletteStore } from './palette-store';
import { ShortcutHelp } from './shortcut-help';

export { openCommandPalette, usePaletteStore };

// cmdk, the dialog and the ~20 command icons load the first time the palette opens (or once the app is idle)
const CommandPaletteDialog = lazyOnDemand(() => import('./command-palette-dialog').then((m) => m.default));

/** ⌘K / Ctrl+K toggles the palette from anywhere in the app. */
export function CommandPalette() {
  const open = usePaletteStore((s) => s.open);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen(!usePaletteStore.getState().open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <CommandPaletteDialog needed={open} />
      <ShortcutHelp />
    </>
  );
}
