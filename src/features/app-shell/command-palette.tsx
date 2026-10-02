'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { create } from 'zustand';
import { ArrowCounterClockwise, BookOpen, Globe, Pause, Play, SignOut, Timer } from '@phosphor-icons/react/dist/ssr';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { isFeatureEnabled } from '@/config/feature-flags';
import { LANGS, useI18n } from '@/contexts/i18n-context';
import { switchTimerMode, timerHasProgress } from '@/features/timer/lib/timer-mode';
import { useAuth } from '@/hooks/use-auth';
import { useTimerStore, type TimerMode } from '@/stores/timer-store';
import { PANELS } from './panel-registry';
import { openPanel, PANEL_IDS } from './panel-store';

export const usePaletteStore = create<{ open: boolean }>(() => ({ open: false }));
const setPaletteOpen = (open: boolean) => usePaletteStore.setState({ open });

const MODES: TimerMode[] = ['work', 'shortBreak', 'longBreak'];

export function CommandPalette() {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const open = usePaletteStore((s) => s.open);
  const { isAuthenticated, signOut } = useAuth();
  const isRunning = useTimerStore((s) => s.isRunning);
  const mode = useTimerStore((s) => s.mode);

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

  const run = (action: () => void) => {
    setPaletteOpen(false);
    action();
  };

  const panels = PANEL_IDS.filter(
    (id) => (id !== 'stats' || isFeatureEnabled('history')) && (id !== 'login' || !isAuthenticated),
  );
  // Switching mode mid-session would discard progress; the mode chips ask first, the palette just doesn't offer it.
  const switchableModes = open && !timerHasProgress() ? MODES.filter((m) => m !== mode) : [];

  return (
    <Dialog open={open} onOpenChange={setPaletteOpen}>
      <DialogContent className="top-[20%] max-w-lg translate-y-0 overflow-hidden p-0" overlayClassName="bg-black/40">
        <DialogTitle className="sr-only">{t('shell.palette.open')}</DialogTitle>
        <Command loop>
          <CommandInput placeholder={t('shell.palette.placeholder')} />
          <CommandList>
            <CommandEmpty>{t('shell.palette.empty')}</CommandEmpty>

            <CommandGroup heading={t('shell.palette.groups.timer')}>
              <CommandItem onSelect={() => run(() => useTimerStore.getState()[isRunning ? 'pauseTimer' : 'resumeTimer']())}>
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? t('shell.palette.pause') : t('shell.palette.start')}
                <Kbd className="ml-auto">Space</Kbd>
              </CommandItem>
              <CommandItem onSelect={() => run(() => useTimerStore.getState().resetTimer())}>
                <ArrowCounterClockwise size={16} />
                {t('shell.palette.reset')}
                <Kbd className="ml-auto">R</Kbd>
              </CommandItem>
              {switchableModes.map((m) => (
                <CommandItem key={m} onSelect={() => run(() => switchTimerMode(m))}>
                  <Timer size={16} />
                  {t('shell.palette.switchTo', { mode: t(`timerUi.mode.${m}`) })}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading={t('shell.palette.groups.panels')}>
              {panels.map((id) => {
                const { icon: Icon, labelKey, hotkey } = PANELS[id];
                return (
                  <CommandItem key={id} onSelect={() => run(() => openPanel(id))}>
                    <Icon size={16} />
                    {t(labelKey)}
                    {hotkey && <Kbd className="ml-auto">{hotkey.toUpperCase()}</Kbd>}
                  </CommandItem>
                );
              })}
              <CommandItem onSelect={() => run(() => router.push('/guide'))}>
                <BookOpen size={16} />
                {t('shell.palette.guide')}
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading={t('shell.palette.groups.language')}>
              {LANGS.filter((l) => l.code !== lang).map((l) => (
                <CommandItem key={l.code} value={`language ${l.label}`} onSelect={() => run(() => setLang(l.code))}>
                  <Globe size={16} />
                  {l.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {isAuthenticated && (
              <CommandGroup heading={t('shell.palette.groups.account')}>
                <CommandItem onSelect={() => run(() => void signOut())}>
                  <SignOut size={16} />
                  {t('nav.logout')}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export const openCommandPalette = () => setPaletteOpen(true);
