'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Volume2,
  VolumeX,
  Leaf,
  CloudRain,
  Package,
  Train,
  Building2,
  Play,
  Pause,
  Music,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAudioStore } from '@/stores/audio-store';
import { soundCatalog } from '@/lib/audio/sound-catalog';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@/components/animate-ui/primitives/animate/tabs';
import YouTubePane from '@/components/audio/youtube/youtube-pane';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import { getYouTubeThumbnailUrl } from '@/data/youtube-suggestions';
import { useShallow } from 'zustand/react/shallow';

export function AudioSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Use useShallow for object selectors to ensure proper re-renders
  const {
    audioSettings,
    currentlyPlaying,
    activeAmbientSounds,
    updateVolume,
    toggleMute,
    toggleAmbient,
    togglePlayPause,
    updateAudioSettings,
    updateCurrentlyPlayingForAmbients,
  } = useAudioStore(
    useShallow((state) => ({
      audioSettings: state.audioSettings,
      currentlyPlaying: state.currentlyPlaying,
      activeAmbientSounds: state.activeAmbientSounds,
      updateVolume: state.updateVolume,
      toggleMute: state.toggleMute,
      toggleAmbient: state.toggleAmbient,
      togglePlayPause: state.togglePlayPause,
      updateAudioSettings: state.updateAudioSettings,
      updateCurrentlyPlayingForAmbients: state.updateCurrentlyPlayingForAmbients,
    }))
  );

  const ambientSounds = soundCatalog.ambient;

  // Local tab state (no longer persisted in AudioSettings)
  const [selectedTab, setSelectedTab] = useState('sources');

  // Loading state to prevent user interaction during audio initialization
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Restore ambient sounds display on mount if needed (using store directly to avoid stale closures)
  useEffect(() => {
    const state = useAudioStore.getState();
    const { activeAmbientSounds, currentlyPlaying, updateCurrentlyPlayingForAmbients } = state;

    if (activeAmbientSounds.length > 0) {
      const needsUpdate = !currentlyPlaying ||
        (activeAmbientSounds.length === 1 && currentlyPlaying.id !== activeAmbientSounds[0]?.id) ||
        (activeAmbientSounds.length > 1 && currentlyPlaying.id !== 'mixed-ambient');

      if (needsUpdate) {
        updateCurrentlyPlayingForAmbients();
      }
    }
  }, []); // Empty deps - only run on mount

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  // Helper to check if a sound is currently active in the mix
  const isSoundActive = (soundId: string) => {
    return activeAmbientSounds.some(s => s.id === soundId);
  };

  // Handle play/pause with loading state
  const handlePlayPauseToggle = async () => {
    setIsLoadingAudio(true);
    try {
      await togglePlayPause();
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast.error('Failed to toggle audio playback');
    } finally {
      // Add small delay to ensure audio state is updated
      setTimeout(() => {
        setIsLoadingAudio(false);
      }, 300);
    }
  };

  const iconForUrl = (url: string) => {
    if (url.includes('/nature/'))
      return <Leaf className="h-3 w-3 text-muted-foreground" />;
    if (url.includes('/rain/'))
      return <CloudRain className="h-3 w-3 text-muted-foreground" />;
    if (url.includes('/transport/'))
      return <Train className="h-3 w-3 text-muted-foreground" />;
    if (url.includes('/urban/'))
      return <Building2 className="h-3 w-3 text-muted-foreground" />;
    return <Package className="h-3 w-3 text-muted-foreground" />;
  };

  const AmbientGroup = ({
    title,
    sounds,
  }: {
    title: string;
    sounds: typeof soundCatalog.ambient;
  }) => (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{title}</Label>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
        {sounds.map((s) => {
          const isActive = isSoundActive(s.id);
          return (
            <div
              key={s.id}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${isActive
                ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md'
                : 'border-border/50 hover:border-border hover:bg-muted/50'
                }`}
            >
              <div className="p-2 flex items-center gap-3">
                {/* Icon */}
                <div
                  className={`p-2 rounded-lg transition-all duration-300 shrink-0 ${isActive
                    ? 'bg-primary/20 text-primary scale-110'
                    : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {iconForUrl(s.url)}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${isActive ? 'text-foreground' : ''
                    }`}>
                    {s.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {s.vn || s.label}
                  </div>
                </div>

                {/* Play/Pause Button */}
                <Button
                  size="icon"
                  variant={isActive ? 'default' : 'ghost'}
                  className={`h-8 w-8 rounded-full transition-all shrink-0 ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'opacity-0 group-hover:opacity-100'
                    }`}
                  onClick={() => toggleAmbient(s.id)}
                  title={isActive ? `Remove ${s.label} from mix` : `Add ${s.label} to mix`}
                  disabled={isLoadingAudio}
                >
                  {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const YouTubeIcon = ({ className }: { className?: string }) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Chọn nhạc để chill
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Mini Player / Volume Control - Compact Card */}
          <div className="px-6 py-4 border-b flex justify-center shrink-0">
            {/* Compact card - 50% width */}
            <div className={cn(
              "bg-card rounded-xl border p-4 max-w-md w-full shadow-sm transition-colors",
              currentlyPlaying?.type === 'youtube' ? "border-[#ff0000]" : "border-border"
            )}>
              <div className="grid grid-cols-2 gap-4 items-center">
                {/* Left: Now Playing with Dynamic Icon/Thumbnail (50%) */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
                    {currentlyPlaying ? (
                      currentlyPlaying.type === 'youtube' ? (
                        (() => {
                          const videoId = currentlyPlaying.id.startsWith('video-')
                            ? currentlyPlaying.id.replace('video-', '')
                            : null;
                          const thumb = videoId ? getYouTubeThumbnailUrl(videoId) : null;

                          return thumb ? (
                            <div className="relative w-full h-full group">
                              <img
                                src={thumb}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <YouTubeIcon className="h-5 w-5 text-[#ff0000] drop-shadow-md fill-current" />
                              </div>
                            </div>
                          ) : (
                            <YouTubeIcon className="h-6 w-6 text-[#ff0000]" />
                          );
                        })()
                      ) : (
                        <AudioLines
                          size={28}
                          className="text-primary"
                          animate={currentlyPlaying.isPlaying}
                        />
                      )
                    ) : (
                      <Music className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">
                      {currentlyPlaying?.name || (activeAmbientSounds.length > 0
                        ? (activeAmbientSounds.length === 1
                          ? soundCatalog.ambient.find(s => s.id === activeAmbientSounds[0]?.id)?.label || "Ambient Sound"
                          : `Mixed Ambient (${activeAmbientSounds.length} sounds)`)
                        : "No audio playing")}
                    </span>
                    <span className="text-xs truncate text-muted-foreground">
                      {currentlyPlaying?.isPlaying || activeAmbientSounds.length > 0
                        ? (
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            {activeAmbientSounds.length > 0 && currentlyPlaying && currentlyPlaying.type !== 'ambient'
                              ? `Playing (+ ${activeAmbientSounds.length} ambient)`
                              : "Playing"}
                          </span>
                        )
                        : (currentlyPlaying ? "Paused" : "Select a sound")}
                    </span>
                  </div>
                </div>

                {/* Right: Controls (50%) */}
                <div className="flex items-center justify-end gap-3">
                  {/* Play/Pause Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    onClick={handlePlayPauseToggle}
                    disabled={(!currentlyPlaying && activeAmbientSounds.length === 0) || isLoadingAudio}
                    title={currentlyPlaying?.isPlaying ? "Pause" : "Play"}
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (currentlyPlaying?.isPlaying || activeAmbientSounds.length > 0) ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                      onClick={toggleMute}
                      title={audioSettings.isMuted ? "Unmute" : "Mute"}
                      disabled={isLoadingAudio}
                    >
                      {audioSettings.isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Slider
                      value={[audioSettings.isMuted ? 0 : audioSettings.masterVolume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(v) => {
                        if (audioSettings.isMuted && v[0] > 0) {
                          toggleMute(); // Unmute if dragging slider
                        }
                        updateVolume(v[0]);
                      }}
                      disabled={isLoadingAudio}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-2 shrink-0">
              <TabsList className="grid w-full grid-cols-2 gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
                <TabsTrigger
                  value="sources"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:bg-muted/50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:border data-[state=active]:border-border"
                >
                  Hệ thống
                </TabsTrigger>
                <TabsTrigger
                  value="player"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:bg-muted/50 data-[state=active]:bg-background data-[state=active]:text-[#ff0000] data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:border data-[state=active]:border-border"
                >
                  <YouTubeIcon className="h-4 w-4" />
                  YouTube
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable content area with custom scrollbar and fade indicator */}
            <div className="flex-1 overflow-hidden relative">
              {/* Scroll fade indicator at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

              <div className="h-full overflow-y-auto px-6 py-2 custom-scrollbar">
                <TabsContents>
                  <TabsContent value="sources" className="space-y-4 pb-4">
                    {/* Ambient Sounds Grid - All Categories */}
                    <div className="space-y-6">
                      {(() => {
                        const groups = [
                          {
                            key: 'nature',
                            title: 'Thiên nhiên (Nature)',
                            sounds: ambientSounds.filter((s) => s.url.includes('/nature/')),
                          },
                          {
                            key: 'rain',
                            title: 'Mưa (Rain)',
                            sounds: ambientSounds.filter((s) => s.url.includes('/rain/')),
                          },
                          {
                            key: 'things',
                            title: 'Đồ vật (Things)',
                            sounds: ambientSounds.filter((s) => s.url.includes('/things/')),
                          },
                          {
                            key: 'transport',
                            title: 'Phương tiện (Transport)',
                            sounds: ambientSounds.filter((s) => s.url.includes('/transport/')),
                          },
                          {
                            key: 'urban',
                            title: 'Đô thị (Urban)',
                            sounds: ambientSounds.filter((s) => s.url.includes('/urban/')),
                          },
                        ];
                        return groups.map((g) =>
                          g.sounds.length ? (
                            <AmbientGroup
                              key={g.key}
                              title={g.title}
                              sounds={g.sounds}
                            />
                          ) : null
                        );
                      })()}
                    </div>
                  </TabsContent>

                  <TabsContent value="player" className="h-full">
                    <YouTubePane />
                  </TabsContent>
                </TabsContents>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AudioSettingsModal;
