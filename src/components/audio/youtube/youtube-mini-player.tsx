'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  ArrowsInSimple,
  ArrowsOutSimple,
  CircleNotch,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerX,
  X,
  YoutubeLogo,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { IconTile } from '@/components/ui/icon-tile';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '@/contexts/i18n-context';
import { YOUTUBE_MIN_PX, YOUTUBE_SLOT_ID } from '@/lib/audio/youtube-controller';
import { playingTitle } from '@/lib/audio/playing-title';
import { cn } from '@/lib/utils';
import { useAudioStore } from '@/stores/audio-store';
import { useYouTubeStore } from '@/stores/youtube-player-store';
import { useYouTubePlayer } from '@/hooks/use-youtube-player';

// Docked bottom-left, above the dock (desktop) or the bottom tab bar (mobile). z-40: over the page and the
// dock (z-30), under panels and dialogs (z-50), which are opened on purpose and close again.
// Offsets = the dock's own bottom margin (max(0.5rem|1rem, safe area)) + its height + a gap of about 10px.
const DOCK_OFFSET =
  'left-2 bottom-[calc(max(0.5rem,env(safe-area-inset-bottom))+6rem)] md:left-4 md:bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.5rem)]';
// The card is as wide as the video needs: expanded 16:9 up to 416px, collapsed exactly YouTube's minimum
// (200px of video plus the 2.5px border on each side).
const WIDTH_EXPANDED = 'w-[min(23rem,calc(100vw-1rem))] md:w-[26rem]';
const WIDTH_COLLAPSED = 'w-[calc(200px+2*var(--outline-w))]';

/**
 * The YouTube player, on screen. YouTube requires an embedded player to be visible, at least 200x200 px and
 * not covered, so the video never plays hidden: it plays in this card, docked bottom-left while anything is
 * loaded in the player, and the card goes away (with the iframe) when playback is closed.
 *
 * Collapsed = a compact card: the chrome shrinks (no title, no volume) but the video stays at the 200x200
 * minimum and keeps playing. Collapsing never pauses; closing stops and removes it. While the timer runs and the
 * pointer rests, the card dims with the rest of the chrome (globals.css) but stays visible.
 *
 * Mounted once in AppProviders: it also owns the error toast, because a playback error can arrive after the
 * Sounds panel that started the video is closed.
 */
export function YouTubeMiniPlayer() {
  const { t } = useI18n();
  const { playerState, togglePlayback, stopPlayback, nextVideo, previousVideo } = useYouTubePlayer();
  const { status, currentSource } = playerState;
  const collapsed = useYouTubeStore((state) => state.collapsed);
  const setCollapsed = useYouTubeStore((state) => state.setCollapsed);
  const errorKey = useYouTubeStore((state) => state.errorKey);
  const clearError = useYouTubeStore((state) => state.clearError);

  const currentlyPlaying = useAudioStore((state) => state.currentlyPlaying);
  const { masterVolume, isMuted } = useAudioStore((state) => state.audioSettings);
  const updateVolume = useAudioStore((state) => state.updateVolume);
  const toggleMute = useAudioStore((state) => state.toggleMute);

  useEffect(() => {
    if (!errorKey) return;
    toast.error(t(errorKey));
    clearError();
  }, [errorKey, clearError, t]);

  if (!currentSource) return null;

  const isPlaying = status === 'playing';
  const isBuffering = status === 'buffering';
  const isPlaylist = Boolean(currentSource.listId && !currentSource.videoId);
  const title = (currentlyPlaying?.type === 'youtube' && playingTitle(currentlyPlaying, t)) || 'YouTube';
  const shownVolume = isMuted ? 0 : masterVolume;
  const playLabel = isPlaying ? t('common.pause') : t('common.play');

  return (
    <motion.section
      role="region"
      aria-label={t('audio.youtube.mini.label')}
      data-testid="youtube-mini-player"
      data-mini-player
      data-collapsed={collapsed}
      // Slides in (no opacity here: an inline opacity would beat the idle dimming in globals.css)
      initial={{ y: 16 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={cn(
        'sticker fixed z-40 overflow-hidden',
        DOCK_OFFSET,
        collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED,
      )}
    >
      <div className="flex h-11 items-center gap-2 border-b-[length:var(--outline-w)] border-outline px-2">
        <IconTile icon={YoutubeLogo} tone="tomato" size="sm" />
        {collapsed ? (
          <span className="flex-1" />
        ) : (
          <p className="min-w-0 flex-1 truncate font-heading text-sm font-bold text-ink" title={title}>
            {title}
          </p>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? t('audio.youtube.mini.expand') : t('audio.youtube.mini.collapse')}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ArrowsOutSimple size={16} weight="bold" aria-hidden="true" />
          ) : (
            <ArrowsInSimple size={16} weight="bold" aria-hidden="true" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 hover:text-danger-ink"
          onClick={stopPlayback}
          aria-label={t('audio.youtube.mini.close')}
        >
          <X size={16} weight="bold" aria-hidden="true" />
        </Button>
      </div>

      {/* The player's iframe is created in here by youtube-controller. Never smaller than YouTube's floor, in
          either state: the inline minimums hold even if a class is dropped or overridden. The slot has no border
          or padding of its own (they would eat into the 200px, box-sizing is border-box); the header and the
          control row carry the divider lines. */}
      <div
        id={YOUTUBE_SLOT_ID}
        data-testid="youtube-player-slot"
        style={{ minWidth: YOUTUBE_MIN_PX, minHeight: YOUTUBE_MIN_PX }}
        className={cn(
          'bg-black [&_iframe]:block [&_iframe]:size-full',
          collapsed ? 'h-[200px]' : 'aspect-video',
        )}
      />

      <div className="flex items-center gap-1.5 border-t-[length:var(--outline-w)] border-outline p-2">
        {isPlaylist && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={previousVideo}
            aria-label={t('audio.youtube.mini.previousVideo')}
          >
            <SkipBack size={16} weight="fill" aria-hidden="true" />
          </Button>
        )}
        <Button
          size="icon"
          className="size-10 shrink-0 rounded-full"
          onClick={() => togglePlayback(currentSource.videoId, currentSource.listId)}
          aria-label={playLabel}
        >
          {isBuffering ? (
            <CircleNotch size={18} className="animate-spin" aria-hidden="true" />
          ) : isPlaying ? (
            <Pause size={18} weight="fill" aria-hidden="true" />
          ) : (
            <Play size={18} weight="fill" aria-hidden="true" />
          )}
        </Button>
        {isPlaylist && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={nextVideo}
            aria-label={t('audio.youtube.mini.nextVideo')}
          >
            <SkipForward size={16} weight="fill" aria-hidden="true" />
          </Button>
        )}
        {!collapsed && (
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              onClick={toggleMute}
              aria-label={isMuted ? t('audio.unmute') : t('audio.mute')}
            >
              {isMuted ? (
                <SpeakerX size={18} weight="fill" aria-hidden="true" />
              ) : (
                <SpeakerHigh size={18} weight="fill" aria-hidden="true" />
              )}
            </Button>
            <Slider
              value={[shownVolume]}
              min={0}
              max={100}
              step={1}
              aria-label={t('audio.master.label')}
              aria-valuetext={isMuted ? t('audio.master.muted') : t('audio.master.valueText', { value: masterVolume })}
              onValueChange={(v) => {
                if (isMuted && v[0] > 0) toggleMute();
                updateVolume(v[0]);
              }}
              className="w-20 md:w-28"
            />
          </div>
        )}
      </div>
    </motion.section>
  );
}
