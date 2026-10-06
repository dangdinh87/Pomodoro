'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowsIn, ArrowsOut } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { IconTile } from '@/components/ui/icon-tile';
import { Kbd } from '@/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import { isFeatureEnabled } from '@/config/feature-flags';
import { useTranslation } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { useAudioStore } from '@/stores/audio-store';
import { useSystemStore } from '@/stores/system-store';
import { canFullscreen, toggleFullscreen } from './fullscreen';
import { DOCK_PANELS, PANELS } from './panel-registry';
import { preloadPanel } from './panel-loaders';
import { togglePanel, usePanelStore, type PanelId } from './panel-store';

// Mobile (< 768px): a sticker tray along the bottom edge, labels under the icons, clear of the home
// indicator. Desktop: a loose row of 52px tiles floating over the stage. The dock is pinned to the bottom of
// the viewport while the stage is on screen (see the sticky frame below), so a short viewport (1366x768 with
// browser chrome) can never push it below the fold, and it scrolls away with the stage instead of covering
// the content under it.
const NAV_TRAY =
  'pointer-events-auto absolute inset-x-1.5 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-30 grid grid-flow-col auto-cols-fr items-start rounded-lg border-sticker bg-surface p-1 shadow-sticker md:inset-x-auto md:bottom-[max(1rem,env(safe-area-inset-bottom))] md:left-1/2 md:flex md:-translate-x-1/2 md:items-center md:gap-3 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none';
// Focus mode keeps one tile (leave fullscreen), at every width.
const NAV_FOCUS =
  'pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 items-center';

const DOCK_BUTTON =
  'focus-ring group relative flex min-w-0 flex-col items-center gap-1 rounded-[14px] py-1 text-ink-secondary aria-pressed:bg-surface-raised aria-pressed:text-ink md:gap-0 md:p-0 md:aria-pressed:bg-transparent';
const DOCK_TILE =
  'transition-[transform,box-shadow] duration-100 md:size-[52px] md:rounded-[14px] md:border-[length:var(--outline-w)] md:[&>svg]:size-[26px]';
// Resting, hover and pressed share one rule set: pressed (panel open or finger down) sinks the tile
// into its own shadow, exactly the shadow's depth.
const TILE_REST =
  'shadow-[2px_2px_0_var(--outline)] group-hover:-translate-x-px group-hover:-translate-y-px group-hover:shadow-[3px_3px_0_var(--outline)] group-active:translate-x-0.5 group-active:translate-y-0.5 group-active:shadow-none md:shadow-[3px_3px_0_var(--outline)] md:group-hover:shadow-[4px_4px_0_var(--outline)] md:group-active:translate-x-[3px] md:group-active:translate-y-[3px]';
const TILE_PRESSED = 'translate-x-0.5 translate-y-0.5 shadow-none md:translate-x-[3px] md:translate-y-[3px]';
// Tab-bar label: wraps only between words (never inside one), at most two lines. `keep-all` stops Japanese
// labels from splitting mid-word; every label (en/vi/ja) fits a ~48px column at 360px, see app-dock.test.tsx.
const LABEL =
  'line-clamp-2 min-h-[2.3em] w-full text-center text-xs font-bold leading-[1.15] [overflow-wrap:normal] [word-break:keep-all] md:sr-only';

const YOUTUBE_PATH =
  'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z';

function useSoundActive() {
  const currentlyPlaying = useAudioStore((s) => s.currentlyPlaying);
  const audible = useAudioStore((s) => s.activeAmbientSounds.some((a) => a.volume > 0));
  return Boolean(currentlyPlaying) || audible;
}

/** While sound plays, the sound tile shows what is playing instead of the note icon. */
function SoundGlyph({ size = 20 }: { size?: number | string }) {
  const reduceMotion = useReducedMotion();
  const currentlyPlaying = useAudioStore((s) => s.currentlyPlaying);
  const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds);
  const audible = activeAmbientSounds.some((s) => s.volume > 0);
  const isPlaying = (currentlyPlaying?.isPlaying ?? false) || audible;
  const Glyph = PANELS.sound.icon;

  if (!currentlyPlaying && !audible) return <Glyph size={size} weight="fill" aria-hidden="true" />;
  if (currentlyPlaying?.type === 'youtube') {
    return (
      <motion.svg
        width={size}
        height={size}
        className="fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
        animate={isPlaying && !reduceMotion ? { scale: [1, 1.15, 1] } : undefined}
        transition={isPlaying && !reduceMotion ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <path d={YOUTUBE_PATH} />
      </motion.svg>
    );
  }
  return <AudioLines size={Number(size)} animate={isPlaying && !reduceMotion} aria-hidden="true" />;
}

// IconTile renders `<Icon size weight />`; the sound tile supplies its own glyph that follows the audio state.
const SOUND_ICON = SoundGlyph as unknown as Icon;

function DockButton({ id }: { id: PanelId }) {
  const { t } = useTranslation();
  const isOpen = usePanelStore((s) => s.active === id);
  const soundActive = useSoundActive();
  const { icon, tone, labelKey, hotkey } = PANELS[id];
  const label = t(labelKey);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-pressed={isOpen}
          data-panel={id}
          className={DOCK_BUTTON}
          onClick={() => togglePanel(id)}
          onPointerEnter={() => preloadPanel(id)}
          onFocus={() => preloadPanel(id)}
        >
          <IconTile
            icon={id === 'sound' ? SOUND_ICON : icon}
            tone={tone}
            size="md"
            className={cn(DOCK_TILE, isOpen ? TILE_PRESSED : TILE_REST)}
          />
          {id === 'sound' && soundActive && (
            <span
              aria-hidden="true"
              data-playing
              className="absolute right-0 top-0 size-3 rounded-full border-2 border-outline bg-candy-tomato md:-right-1 md:-top-1 md:size-3.5"
            />
          )}
          <span className={LABEL}>{label}</span>
          {isOpen && (
            <span
              aria-hidden="true"
              className="absolute -bottom-2 left-1/2 hidden size-1.5 -translate-x-1/2 rounded-full bg-ink md:block"
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={12} className="max-md:hidden">
        <span className="flex items-center gap-2">
          {label}
          {hotkey && <Kbd>{hotkey.toUpperCase()}</Kbd>}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

const subscribeNever = () => () => {};

export function AppDock() {
  const { t } = useTranslation();
  const isFocusMode = useSystemStore((s) => s.isFocusMode);
  const setFocusMode = useSystemStore((s) => s.setFocusMode);
  // Focus mode is fullscreen: the browser is the source of truth, because Esc (or the
  // OS) can leave fullscreen without a click on this button.
  const isFullscreen = isFocusMode;
  const panels = DOCK_PANELS.filter((id) => id !== 'stats' || isFeatureEnabled('history'));
  const fullscreenSupported = useSyncExternalStore(subscribeNever, canFullscreen, () => false);

  useEffect(() => {
    const sync = () => setFocusMode(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [setFocusMode]);

  const focusLabel = isFullscreen ? t('timerUi.dock.exitFocus') : t('timerUi.dock.focus');

  return (
    // The frame covers the stage section; its sticky child is one viewport tall and stays at the top of the
    // screen until the section's end, then rides up with it. The nav sits at the bottom of that child.
    <div className="pointer-events-none absolute inset-0 z-30" data-testid="dock-frame">
      {/* -mt: the language bar (when shown) pushes the section down; this frame starts at the section, so lift
          the viewport-tall box by the bar's height to keep the dock on the bottom edge at scroll 0. */}
      <div className="pointer-events-none sticky top-0 mt-[calc(-1*var(--lang-banner-h,0px))] h-dvh">
        <nav data-chrome aria-label={t('shell.dock')} className={isFocusMode ? NAV_FOCUS : NAV_TRAY}>
          <TooltipProvider delayDuration={250}>
            {!isFocusMode && panels.map((id) => <DockButton key={id} id={id} />)}
            {fullscreenSupported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    data-panel="fullscreen"
                    aria-label={isFullscreen ? t('timerComponents.enhancedTimer.exitFocus') : t('timerComponents.enhancedTimer.enterFocus')}
                    className={cn(DOCK_BUTTON, !isFocusMode && 'md:ml-2')}
                    onClick={toggleFullscreen}
                  >
                    <IconTile
                      icon={isFullscreen ? ArrowsIn : ArrowsOut}
                      tone="surface"
                      size="md"
                      className={cn(DOCK_TILE, TILE_REST)}
                    />
                    <span aria-hidden="true" className={LABEL}>
                      {t('shell.fullscreenShort')}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={12} className="max-md:hidden">
                  {focusLabel}
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </nav>
      </div>
    </div>
  );
}
