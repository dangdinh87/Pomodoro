'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { isFeatureEnabled } from '@/config/feature-flags';
import { useI18n } from '@/contexts/i18n-context';
import { shouldIgnoreShortcut } from './keyboard-guard';
import { PANELS } from './panel-registry';
import { PANEL_IDS } from './panel-store';
import { modShortcut } from './platform';

export const useShortcutHelpStore = create<{ open: boolean }>(() => ({ open: false }));
const setOpen = (open: boolean) => useShortcutHelpStore.setState({ open });
export const openShortcutHelp = () => setOpen(true);

/** `?` shows the list. Same guard as every single-key shortcut: not while typing or with a dialog open. */
function useShortcutHelpHotkey() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '?' || shouldIgnoreShortcut(event)) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export function ShortcutHelp() {
  const { t } = useI18n();
  const open = useShortcutHelpStore((s) => s.open);
  useShortcutHelpHotkey();

  const panelShortcuts = PANEL_IDS.filter(
    (id) => PANELS[id].hotkey && (id !== 'stats' || isFeatureEnabled('history')),
  ).map((id) => ({
    keys: PANELS[id].hotkey!.toUpperCase(),
    label: t('shell.shortcuts.openPanel', { panel: t(PANELS[id].labelKey) }),
  }));

  const rows = [
    { keys: t('timerUi.spaceKey'), label: t('shell.shortcuts.toggleTimer') },
    { keys: 'R', label: t('shell.shortcuts.reset') },
    ...panelShortcuts,
    { keys: modShortcut('K'), label: t('shell.palette.open') },
    { keys: '?', label: t('shell.shortcuts.help') },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('shell.shortcuts.title')}</DialogTitle>
          <DialogDescription>{t('shell.shortcuts.description')}</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-1">
          {rows.map(({ keys, label }) => (
            <li key={label} className="flex items-center justify-between gap-4 rounded-md px-2.5 py-1.5 even:bg-surface-raised">
              <span className="text-sm font-semibold text-ink-secondary">{label}</span>
              <Kbd>{keys}</Kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
