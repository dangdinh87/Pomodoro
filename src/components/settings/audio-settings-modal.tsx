'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Square,
  Dice3,
  Music,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAudioStore } from '@/stores/audio-store';
import { useSystemStore } from '@/stores/system-store';
import audioManager from '@/lib/audio/audio-manager';
import { soundCatalog } from '@/lib/audio/sound-catalog';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@/components/animate-ui/primitives/animate/tabs';
import { Input } from '@/components/ui/input';
import SpotifyPane from '@/components/audio/spotify/spotify-pane';
import YouTubePane from '@/components/audio/youtube/youtube-pane';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import { getYouTubeThumbnailUrl } from '@/data/youtube-suggestions';

export function AudioSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { updateSoundSettings } = useSystemStore(); // Keep if still needed for bell sound settings
  const {
    audioSettings,
    currentlyPlaying,
    activeAmbientSounds,
    updateVolume,
    toggleMute,
    toggleAmbient,
    togglePlayPause,
    stopAllAmbient,
    updateAudioSettings,
    updateCurrentlyPlayingForAmbients,
  } = useAudioStore();

  const ambientSounds = soundCatalog.ambient;

  // State for selected tab with persistence
  const [selectedTab, setSelectedTab] = useState(audioSettings.selectedTab || 'sources');

  // Loading state to prevent user interaction during audio initialization
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Restore ambient sounds display on mount and when activeAmbientSounds changes
  useEffect(() => {
    console.log('[AudioModal] useEffect triggered, activeAmbientSounds:', activeAmbientSounds);
    if (activeAmbientSounds.length > 0) {
      console.log('[AudioModal] Calling updateCurrentlyPlayingForAmbients');
      updateCurrentlyPlayingForAmbients();
    }
  }, [activeAmbientSounds.length, updateCurrentlyPlayingForAmbients]); // Run when ambient sounds change

  // Save selected tab when it changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    updateAudioSettings({ selectedTab: value });
  };

  // Helper to check if a sound is currently active in the mix
  const isSoundActive = (soundId: string) => {
    return activeAmbientSounds.includes(soundId);
  };

  // Handle play/pause with loading state
  const handlePlayPauseToggle = async () => {
    setIsLoadingAudio(true);
    try {
      if (activeAmbientSounds.length > 0) {
        await stopAllAmbient();
      } else if (currentlyPlaying) {
        togglePlayPause();
      }
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

  // This useEffect is no longer needed as audio state is managed by useAudioStore
  // useEffect(() => {
  //   setAmbientVolume(audioSettings.volume);
  //   setFadeInOut(audioSettings.fadeInOut);
  //   setSelectedAmbientSound(audioSettings.selectedAmbientSound);
  // }, [audioSettings]);

  // This useEffect is no longer needed as audio state is managed by useAudioStore
  // useEffect(() => {
  //   return () => {
  //     audioManager.stop();
  //   };
  // }, []);

  // This useEffect is no longer needed as audio state is managed by useAudioStore
  // useEffect(() => {
  //   Object.values(ambientAudiosRef.current).forEach((el) => {
  //     try {
  //       el.volume = ambientVolume / 100;
  //       if (isMuted) {
  //         el.pause();
  //       } else {
  //         if (el.paused) el.play().catch(() => { });
  //       }
  //     } catch { }
  //   });
  // }, [isMuted, ambientVolume]);

  // This function is no longer needed as playAmbient from useAudioStore handles it
  // const playSoundPreview = async (soundId: string) => {
  //   const sound = ambientSounds.find((s) => s.id === soundId);
  //   if (!sound) return;

  //   // If muted (paused), unmute (play) when interacting with a new sound
  //   if (isMuted) {
  //     setIsMuted(false);
  //   }

  //   const isActive = activeAmbientIds.includes(sound.id);
  //   if (isActive) {
  //     const el = ambientAudiosRef.current[sound.id];
  //     if (el) {
  //       try {
  //         el.pause();
  //       } catch { }
  //       delete ambientAudiosRef.current[sound.id];
  //     }
  //     setActiveAmbientIds((prev) => prev.filter((id) => id !== sound.id));
  //   } else {
  //     const el = new Audio(sound.url);
  //     el.loop = true;
  //     el.volume = ambientVolume / 100;
  //     try {
  //       await el.play();
  //     } catch { }
  //     ambientAudiosRef.current[sound.id] = el;
  //     setActiveAmbientIds((prev) => [...prev, sound.id]);
  //   }
  // };

  // This function is no longer needed as settings are updated directly via store actions
  const handleSave = () => {
    toast.success('Audio settings saved successfully!');
    onClose();
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

  const SpotifyIcon = ({ className }: { className?: string }) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.84-.6 13.5 1.56.42.18.6.78.241 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 14.82 1.14.54.3.72 1.02.42 1.56-.3.54-1.02.72-1.56.42z" />
    </svg>
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
                      {currentlyPlaying?.name || "No audio playing"}
                    </span>
                    <span className="text-xs truncate text-muted-foreground">
                      {currentlyPlaying?.isPlaying ? "● Playing" : (currentlyPlaying ? "Paused" : "Select a sound")}
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
                    title={activeAmbientSounds.length > 0 ? "Stop all ambient sounds" : (currentlyPlaying?.isPlaying ? "Pause" : "Play")}
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : activeAmbientSounds.length > 0 ? (
                      <Square className="h-4 w-4 fill-current" />
                    ) : currentlyPlaying?.isPlaying ? (
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
                      value={[audioSettings.isMuted ? 0 : audioSettings.volume]}
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
              <TabsList className="grid w-full grid-cols-3 gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
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
                <TabsTrigger
                  value="spotify"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:bg-muted/50 data-[state=active]:bg-background data-[state=active]:text-[#1DB954] data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:border data-[state=active]:border-border"
                >
                  <SpotifyIcon className="h-4 w-4" />
                  Spotify
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

                  <TabsContent value="spotify" className="h-full">
                    <SpotifyPane />
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
