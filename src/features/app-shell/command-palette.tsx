'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { create } from 'zustand';
import {
  ArrowCounterClockwise,
  ArrowsOut,
  BookOpen,
  Globe,
  ImageSquare,
  Keyboard,
  Pause,
  Play,
  PlusCircle,
  SignOut,
  SkipForward,
  SpeakerHigh,
  SpeakerSlash,
  Timer,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { IconTile, type IconTileTone } from '@/components/ui/icon-tile';
import { Kbd } from '@/components/ui/kbd';
import { isFeatureEnabled } from '@/config/feature-flags';
import { LANGS, useI18n } from '@/contexts/i18n-context';
import { localePath } from '@/lib/i18n/locale-path';
import { requestTimerReset } from '@/features/timer/lib/request-reset';
import { switchTimerMode, timerHasProgress } from '@/features/timer/lib/timer-mode';
import { useAuth } from '@/hooks/use-auth';
import { useAudioStore } from '@/stores/audio-store';
import { useTimerStore, type TimerMode } from '@/stores/timer-store';
import { canFullscreen, toggleFullscreen } from './fullscreen';
import { openTaskQuickAdd, pressSkipButton } from './palette-actions';
import { PANELS } from './panel-registry';
import { openPanel, PANEL_IDS } from './panel-store';
import { openShortcutHelp, ShortcutHelp } from './shortcut-help';

export const usePaletteStore = create<{ open: boolean }>(() => ({ open: false }));
const setPaletteOpen = (open: boolean) => usePaletteStore.setState({ open });

const MODES: TimerMode[] = ['work', 'shortBreak', 'longBreak'];
const MODE_TONE: Record<TimerMode, IconTileTone> = { work: 'tomato', shortBreak: 'mint', longBreak: 'sky' };

type RowProps = {
  icon: Icon;
  tone: IconTileTone;
  onSelect: () => void;
  /** Search text when the label alone is not enough (language rows). */
  value?: string;
  shortcut?: string;
  children: ReactNode;
};

/** One command: candy tile, label, optional key cap. The row's own `[&_svg]` colour must not recolour the tile's icon. */
function Row({ icon, tone, onSelect, value, shortcut, children }: RowProps) {
  return (
    <CommandItem onSelect={onSelect} value={value}>
      <IconTile icon={icon} tone={tone} size="sm" className="[&_svg]:text-inherit!" />
      {children}
      {shortcut && <Kbd className="ml-auto">{shortcut}</Kbd>}
    </CommandItem>
  );
}

export function CommandPalette() {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const open = usePaletteStore((s) => s.open);
  const { isAuthenticated, signOut } = useAuth();
  const isRunning = useTimerStore((s) => s.isRunning);
  const mode = useTimerStore((s) => s.mode);
  const isMuted = useAudioStore((s) => s.audioSettings.isMuted);

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
    <>
      <Dialog open={open} onOpenChange={setPaletteOpen}>
        <DialogContent className="top-[14%] max-w-xl translate-y-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">{t('shell.palette.open')}</DialogTitle>
          <Command loop>
            <CommandInput placeholder={t('shell.palette.placeholder')} />
            <CommandList>
              <CommandEmpty>{t('shell.palette.empty')}</CommandEmpty>

              <CommandGroup heading={t('shell.palette.groups.timer')}>
                <Row
                  icon={isRunning ? Pause : Play}
                  tone="tomato"
                  shortcut={t('timerUi.spaceKey')}
                  onSelect={() => run(() => useTimerStore.getState()[isRunning ? 'pauseTimer' : 'resumeTimer']())}
                >
                  {isRunning ? t('shell.palette.pause') : t('shell.palette.start')}
                </Row>
                <Row icon={ArrowCounterClockwise} tone="surface" shortcut="R" onSelect={() => run(requestTimerReset)}>
                  {t('shell.palette.reset')}
                </Row>
                <Row
                  icon={SkipForward}
                  tone="surface"
                  onSelect={() => run(() => pressSkipButton(t('timer.controls.skip_hint')))}
                >
                  {t('shell.palette.skip')}
                </Row>
                {switchableModes.map((m) => (
                  <Row key={m} icon={Timer} tone={MODE_TONE[m]} onSelect={() => run(() => switchTimerMode(m))}>
                    {t('shell.palette.switchTo', { mode: t(`timerUi.mode.${m}`) })}
                  </Row>
                ))}
              </CommandGroup>

              <CommandGroup heading={t('shell.palette.groups.actions')}>
                <Row icon={PlusCircle} tone="butter" onSelect={() => run(() => openTaskQuickAdd(t('tasksUi.quickAddLabel')))}>
                  {t('shell.palette.addTask')}
                </Row>
                <Row icon={ImageSquare} tone="lilac" onSelect={() => run(() => openPanel('scene'))}>
                  {t('shell.palette.changeScene')}
                </Row>
                <Row
                  icon={isMuted ? SpeakerHigh : SpeakerSlash}
                  tone="sky"
                  onSelect={() => run(() => useAudioStore.getState().toggleMute())}
                >
                  {isMuted ? t('shell.palette.unmute') : t('shell.palette.mute')}
                </Row>
                {canFullscreen() && (
                  <Row icon={ArrowsOut} tone="surface" onSelect={() => run(() => void toggleFullscreen())}>
                    {t('shell.palette.fullscreen')}
                  </Row>
                )}
              </CommandGroup>

              <CommandGroup heading={t('shell.palette.groups.panels')}>
                {panels.map((id) => {
                  const { icon, tone, labelKey, hotkey } = PANELS[id];
                  return (
                    <Row key={id} icon={icon} tone={tone} shortcut={hotkey?.toUpperCase()} onSelect={() => run(() => openPanel(id))}>
                      {t(labelKey)}
                    </Row>
                  );
                })}
                <Row icon={BookOpen} tone="butter" onSelect={() => run(() => router.push(localePath(lang, '/guide')))}>
                  {t('shell.palette.guide')}
                </Row>
                <Row icon={Keyboard} tone="surface" shortcut="?" onSelect={() => run(openShortcutHelp)}>
                  {t('shell.palette.shortcuts')}
                </Row>
              </CommandGroup>

              <CommandGroup heading={t('shell.palette.groups.language')}>
                {LANGS.filter((l) => l.code !== lang).map((l) => (
                  <Row key={l.code} icon={Globe} tone="sky" value={`language ${l.label}`} onSelect={() => run(() => setLang(l.code))}>
                    {l.label}
                  </Row>
                ))}
              </CommandGroup>

              {isAuthenticated && (
                <CommandGroup heading={t('shell.palette.groups.account')}>
                  <Row icon={SignOut} tone="peach" onSelect={() => run(() => void signOut())}>
                    {t('nav.logout')}
                  </Row>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
      <ShortcutHelp />
    </>
  );
}

export const openCommandPalette = () => setPaletteOpen(true);
