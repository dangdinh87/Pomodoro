'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowsIn, ArrowsOut } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import { isFeatureEnabled } from '@/config/feature-flags';
import { useTranslation } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { useAudioStore } from '@/stores/audio-store';
import { useSystemStore } from '@/stores/system-store';
import { DOCK_PANELS, PANELS } from './panel-registry';
import { preloadPanel } from './panel-loaders';
import { togglePanel, usePanelStore, type PanelId } from './panel-store';

const DOCK_BUTTON =
  'size-10 rounded-full border border-border bg-surface/60 text-ink-secondary backdrop-blur-md hover:bg-surface-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-brand aria-pressed:border-transparent aria-pressed:bg-surface-hover aria-pressed:text-ink';

const YOUTUBE_PATH =
  'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z';

/** While sound plays, the sound button shows what is playing instead of the note icon. */
function SoundIcon() {
  const reduceMotion = useReducedMotion();
  const currentlyPlaying = useAudioStore((s) => s.currentlyPlaying);
  const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds);
  const audible = activeAmbientSounds.some((s) => s.volume > 0);
  const isPlaying = (currentlyPlaying?.isPlaying ?? false) || audible;
  const Icon = PANELS.sound.icon;

  if (!currentlyPlaying && !audible) return <Icon size={20} aria-hidden="true" />;
  if (currentlyPlaying?.type === 'youtube') {
    return (
      <motion.svg
        className="size-5 fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
        animate={isPlaying && !reduceMotion ? { scale: [1, 1.15, 1] } : undefined}
        transition={isPlaying && !reduceMotion ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <path d={YOUTUBE_PATH} />
      </motion.svg>
    );
  }
  return <AudioLines size={20} animate={isPlaying && !reduceMotion} aria-hidden="true" />;
}

function useSoundActive() {
  const currentlyPlaying = useAudioStore((s) => s.currentlyPlaying);
  const audible = useAudioStore((s) => s.activeAmbientSounds.some((a) => a.volume > 0));
  return Boolean(currentlyPlaying) || audible;
}

function DockButton({ id }: { id: PanelId }) {
  const { t } = useTranslation();
  const isOpen = usePanelStore((s) => s.active === id);
  const soundActive = useSoundActive();
  const { icon: Icon, labelKey, hotkey } = PANELS[id];
  const highlighted = id === 'sound' && soundActive;

  return (
    <Tooltip side="top">
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t(labelKey)}
          aria-pressed={isOpen}
          className={cn(DOCK_BUTTON, highlighted && 'border-transparent bg-primary text-white hover:bg-primary/90')}
          onClick={() => togglePanel(id)}
          onPointerEnter={() => preloadPanel(id)}
          onFocus={() => preloadPanel(id)}
        >
          {id === 'sound' ? <SoundIcon /> : <Icon size={20} aria-hidden="true" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="flex items-center gap-2">
          {t(labelKey)}
          {hotkey && <Kbd>{hotkey.toUpperCase()}</Kbd>}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export function AppDock() {
  const { t } = useTranslation();
  const isFocusMode = useSystemStore((s) => s.isFocusMode);
  const setFocusMode = useSystemStore((s) => s.setFocusMode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const panels = DOCK_PANELS.filter((id) => id !== 'stats' || isFeatureEnabled('history'));

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        setFocusMode(false);
      } else {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setFocusMode(true);
      }
    } catch (error) {
      console.error('Fullscreen toggle failed', error);
    }
  };

  return (
    <nav
      data-chrome
      aria-label={t('shell.dock')}
      className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
    >
      <TooltipProvider>
        {!isFocusMode && panels.map((id) => <DockButton key={id} id={id} />)}
        <Tooltip side="top">
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={isFullscreen ? t('timerComponents.enhancedTimer.exitFocus') : t('timerComponents.enhancedTimer.enterFocus')}
              className={cn(DOCK_BUTTON, !isFocusMode && 'ml-2')}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <ArrowsIn size={20} aria-hidden="true" /> : <ArrowsOut size={20} aria-hidden="true" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFullscreen ? t('timerUi.dock.exitFocus') : t('timerUi.dock.focus')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </nav>
  );
}
