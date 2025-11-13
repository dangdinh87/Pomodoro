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
  YoutubeIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSystemStore } from '@/stores/system-store';
import audioManager from '@/lib/audio/audio-manager';
import { soundCatalog } from '@/lib/audio/sound-catalog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import SpotifyPane from '@/components/audio/spotify-pane';

export function AudioSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { audioSettings, updateAudioSettings, updateSoundSettings } =
    useSystemStore();

  const [isMuted, setIsMuted] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(audioSettings.volume);
  const [fadeInOut, setFadeInOut] = useState(audioSettings.fadeInOut);
  const [selectedAmbientSound, setSelectedAmbientSound] = useState<string>(
    audioSettings.selectedAmbientSound,
  );
  const [youtubeUrl, setYoutubeUrl] = useState<string>(
    audioSettings.youtubeUrl || '',
  );

  // Global YouTube player (persists after modal closes)
  const getOrCreateGlobalYTContainer = () => {
    let el = document.getElementById(
      'youtube-global-container',
    ) as HTMLDivElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'youtube-global-container';
      el.style.position = 'fixed';
      el.style.width = '0px';
      el.style.height = '0px';
      el.style.left = '-9999px';
      el.style.top = '0';
      el.style.display = 'none';
      document.body.appendChild(el);
    }
    return el;
  };
  const setGlobalYT = (p: any) => {
    (window as any).__globalYTPlayer = p;
  };
  const getGlobalYT = () => (window as any).__globalYTPlayer || null;
  const setGlobalYTSource = (src: { videoId?: string; listId?: string } | null) => {
    (window as any).__globalYTSource = src;
  };
  const getGlobalYTSource = (): { videoId?: string; listId?: string } | null => {
    return (window as any).__globalYTSource || null;
  };

  const ambientSounds = soundCatalog.ambient;

  // ambient mixing
  const [activeAmbientIds, setActiveAmbientIds] = useState<string[]>([]);
  const ambientAudiosRef = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    setAmbientVolume(audioSettings.volume);
    setFadeInOut(audioSettings.fadeInOut);
    setSelectedAmbientSound(audioSettings.selectedAmbientSound);
    setYoutubeUrl(audioSettings.youtubeUrl || '');
  }, [audioSettings]);

  useEffect(() => {
    return () => {
      audioManager.stop({ fadeOutMs: 150 });
    };
  }, []);

  // Keep YouTube player volume/mute in sync with global settings
  useEffect(() => {
    try {
      const yt = getGlobalYT();
      if (!yt) return;
      if (isMuted) yt.mute();
      else yt.unMute();
      yt.setVolume(ambientVolume);
    } catch {}
  }, [isMuted, ambientVolume]);

  // Ensure only one ambient at a time; if YouTube is playing, pause it
  const pauseYouTube = () => {
    try {
      getGlobalYT()?.pauseVideo();
    } catch {}
    try {
      getGlobalYT()?.stopVideo();
    } catch {}
  };

  const playSoundPreview = async (soundId: string) => {
    const sound = ambientSounds.find((s) => s.id === soundId);
    if (!sound) return;
    const isActive = activeAmbientIds.includes(sound.id);
    if (isActive) {
      const el = ambientAudiosRef.current[sound.id];
      if (el) {
        try {
          el.pause();
        } catch {}
        delete ambientAudiosRef.current[sound.id];
      }
      setActiveAmbientIds((prev) => prev.filter((id) => id !== sound.id));
    } else {
      // Allow mixing: just pause YouTube and start this track in addition to others
      pauseYouTube();
      const el = new Audio(sound.url);
      el.loop = true;
      el.volume = isMuted ? 0 : ambientVolume / 100;
      try {
        await el.play();
      } catch {}
      ambientAudiosRef.current[sound.id] = el;
      setActiveAmbientIds((prev) => [...prev, sound.id]);
    }
  };

  const stopAllAmbient = async () => {
    // Stop any manager-driven playback (backward compatibility)
    try {
      await audioManager.stop({ fadeOutMs: 150 });
    } catch {}

    // Pause and clear all ambient mix tracks
    try {
      Object.entries(ambientAudiosRef.current).forEach(([id, el]) => {
        try {
          el.pause();
        } catch {}
        delete ambientAudiosRef.current[id];
      });
    } catch {}
    setActiveAmbientIds([]);
  };

  const saveSettings = () => {
    updateSoundSettings({
      soundType: 'bell',
      volume: ambientVolume,
      isMuted,
    });
    updateAudioSettings({
      selectedAmbientSound,
      volume: ambientVolume,
      fadeInOut,
      youtubeUrl,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'pomodoro-sound-settings',
        JSON.stringify({ soundType: 'bell', volume: ambientVolume, isMuted }),
      );
      localStorage.setItem(
        'pomodoro-audio-settings',
        JSON.stringify({
          selectedAmbientSound,
          volume: ambientVolume,
          fadeInOut,
          youtubeUrl,
        }),
      );
    }
    toast.success('Audio settings saved successfully!');
    onClose();
  };

  const parseYouTubeUrl = (
    url: string,
  ): { videoId?: string; listId?: string; isChannel?: boolean } => {
    if (!url) return {};
    try {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') {
        const id = u.pathname.split('/').filter(Boolean)[0];
        return id ? { videoId: id } : {};
      }
      if (u.hostname.includes('youtube.com')) {
        if (u.pathname.startsWith('/watch')) {
          const vid = u.searchParams.get('v') || undefined;
          const list = u.searchParams.get('list') || undefined;
          return { videoId: vid, listId: list };
        }
        if (u.pathname.startsWith('/shorts/')) {
          const id = u.pathname.split('/').filter(Boolean)[1];
          return id ? { videoId: id } : {};
        }
        if (u.pathname.startsWith('/live/')) {
          const id = u.pathname.split('/').filter(Boolean)[1];
          return id ? { videoId: id } : {};
        }
        if (u.pathname.startsWith('/playlist')) {
          const list = u.searchParams.get('list') || undefined;
          return { listId: list };
        }
        if (
          u.pathname.startsWith('/c/') ||
          u.pathname.startsWith('/channel/')
        ) {
          return { isChannel: true };
        }
      }
      return {};
    } catch {
      return {};
    }
  };

  const {
    videoId: youtubeId,
    listId: youtubeListId,
    isChannel,
  } = parseYouTubeUrl(youtubeUrl);
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&controls=1`
    : null;
  const youtubeThumbUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : null;

  // Track YT playback state for unified toggle
  const [ytStatus, setYtStatus] = useState<
    'stopped' | 'playing' | 'paused' | 'buffering'
  >('stopped');
  const [currentYTSource, setCurrentYTSource] = useState<{ videoId?: string; listId?: string } | null>(null);
  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        const yt = getGlobalYT();
        const state = yt?.getPlayerState?.();
        if (state === 1) setYtStatus('playing');
        else if (state === 2) setYtStatus('paused');
        else if (state === 3) setYtStatus('buffering');
        else setYtStatus('stopped');
        // Update current source info from global cache
        const src = getGlobalYTSource();
        setCurrentYTSource(src);
      } catch {}
    }, 800);
    return () => window.clearInterval(id);
  }, []);

  const ensureYouTubeAPI = (): Promise<any> => {
    return new Promise((resolve) => {
      const w = window as any;
      if (w.YT && w.YT.Player) {
        resolve(w.YT);
        return;
      }
      const prev = document.getElementById(
        'youtube-iframe-api',
      ) as HTMLScriptElement | null;
      if (!prev) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = () => {
        resolve((window as any).YT);
      };
    });
  };

  const createOrUpdateYTPlayer = async (
    videoIdOrListId: string,
    autoPlay: boolean,
    opts?: { isPlaylist?: boolean },
  ) => {
    const YT = await ensureYouTubeAPI();
    const existing = getGlobalYT();
    if (existing) {
      try {
        if (autoPlay) {
          // enforce exclusivity
          await stopAllAmbient();
          try {
            existing.unMute?.();
          } catch {}
        }
        if (opts?.isPlaylist) {
          if (typeof existing.loadPlaylist === 'function') {
            existing.loadPlaylist({ list: videoIdOrListId });
          } else if (typeof existing.cuePlaylist === 'function') {
            existing.cuePlaylist({ list: videoIdOrListId });
          }
          if (autoPlay) existing.playVideo?.();
          setGlobalYTSource({ listId: videoIdOrListId });
        } else {
          existing.loadVideoById(videoIdOrListId);
          if (autoPlay) existing.playVideo?.();
          setGlobalYTSource({ videoId: videoIdOrListId });
        }
      } catch {}
      return;
    }
    const mount = getOrCreateGlobalYTContainer();
    const player = new YT.Player(mount, {
      videoId: opts?.isPlaylist ? undefined : videoIdOrListId,
      playerVars: opts?.isPlaylist
        ? { rel: 0, list: videoIdOrListId, modestbranding: 1, controls: 1 }
        : { rel: 0, modestbranding: 1, controls: 1 },
      events: {
        onReady: () => {
          if (autoPlay) {
            (async () => {
              try {
                await stopAllAmbient();
              } catch {}
              try {
                player.unMute?.();
              } catch {}
              try {
                player.playVideo?.();
              } catch {}
              toast.success(
                'Đang phát nền • Nhạc sẽ tiếp tục khi đóng cửa sổ 🎧',
              );
            })();
          }
        },
        onStateChange: (e: any) => {
          const s = e?.data;
          if (s === 1) setYtStatus('playing');
          else if (s === 2) setYtStatus('paused');
          else if (s === 3) setYtStatus('buffering');
          else setYtStatus('stopped');
        },
      },
    });
    setGlobalYT(player);
     // Record current source
     if (opts?.isPlaylist) {
       setGlobalYTSource({ listId: videoIdOrListId });
     } else {
       setGlobalYTSource({ videoId: videoIdOrListId });
     }
  };

  // Do not auto-create/cue the YouTube player on URL change; only on explicit Play

  // Keep global YT player alive after modal closes
  useEffect(() => {
    return () => {};
  }, []);

  const iconForUrl = (url: string) => {
    if (url.includes('/nature/'))
      return <Leaf className="h-4 w-4 text-muted-foreground" />;
    if (url.includes('/rain/'))
      return <CloudRain className="h-4 w-4 text-muted-foreground" />;
    if (url.includes('/transport/'))
      return <Train className="h-4 w-4 text-muted-foreground" />;
    if (url.includes('/urban/'))
      return <Building2 className="h-4 w-4 text-muted-foreground" />;
    return <Package className="h-4 w-4 text-muted-foreground" />;
  };

  const AmbientGroup = ({
    title,
    sounds,
  }: {
    title: string;
    sounds: typeof soundCatalog.ambient;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {sounds.map((s) => {
          const isActive = activeAmbientIds.includes(s.id);
          return (
            <div
              key={s.id}
              className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                isActive
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex-1 min-w-0 flex items-start gap-2">
                <div className="shrink-0 mt-0.5">{iconForUrl(s.url)}</div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{s.label}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {s.vn || s.label}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <Button
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedAmbientSound(s.id);
                    playSoundPreview(s.id);
                  }}
                  aria-label={isActive ? `Tắt ${s.label}` : `Phát ${s.label}`}
                >
                  {isActive ? 'Tắt' : 'Phát'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Suggestions with thumbnails (videos + playlists)
  const suggestions = [
    {
      label: 'Lofi Girl - beats to relax/study',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    },
    {
      label: 'Focus Beats',
      url: 'https://www.youtube.com/watch?v=P4r9LeM7DiQ',
    },
    {
      label: 'Coding Lofi',
      url: 'https://www.youtube.com/watch?v=FkfEMReEl5g',
    },
    { label: 'Deep Lofi', url: 'https://www.youtube.com/watch?v=2Cibm9iXjH4' },
    {
      label: 'Lofi Playlist 1',
      url: 'https://www.youtube.com/playlist?list=PL3Rd_Q1n-uEmzrjVbyMQmgSoKk6qbWmCg',
    },
    { label: 'Relax Lofi', url: 'https://www.youtube.com/watch?v=ptHnmgaFvwE' },
    {
      label: 'Chill Study',
      url: 'https://www.youtube.com/watch?v=q0ff3e-A7DY',
    },
    {
      label: 'Lofi Playlist 2',
      url: 'https://www.youtube.com/playlist?list=PLi8ZVZZLpNVZitABWmrUKWq0lYNC_O3hw',
    },
    {
      label: 'Ambient Focus',
      url: 'https://www.youtube.com/watch?v=sF80I-TQiW0',
    },
    {
      label: 'Calm Coding',
      url: 'https://www.youtube.com/watch?v=qGa-qZQGifI',
    },
    {
      label: 'Night Vibes',
      url: 'https://www.youtube.com/watch?v=pfs3AsE_sHI',
    },
    { label: 'Sleep Lofi', url: 'https://www.youtube.com/watch?v=7aPzNJ4lf5A' },
    {
      label: 'Morning Focus',
      url: 'https://www.youtube.com/watch?v=lA9FONoiuFA',
    },
    {
      label: 'Chill Piano',
      url: 'https://www.youtube.com/watch?v=mJW57E7GpSo',
    },
    {
      label: 'Soft Rain Lofi',
      url: 'https://www.youtube.com/watch?v=CFGLoQIhmow',
    },
    {
      label: 'Study Playlist',
      url: 'https://www.youtube.com/playlist?list=PLv1quoEqqgjAihdJtJZVKWtZWo_vD2y6U',
    },
    {
      label: 'Ambient Playlist',
      url: 'https://www.youtube.com/playlist?list=PLNIOIzEHtNJZU_29QVd-LVCTvL83YmGRv',
    },
    {
      label: 'Lo-Fi Chill',
      url: 'https://www.youtube.com/watch?v=mmKguZohAck',
    },
    { label: 'Rainy Mood', url: 'https://www.youtube.com/watch?v=7NOSDKb0HlU' },
    { label: 'Lofi Girl Channel', url: 'https://www.youtube.com/c/LofiGirl' },
  ];

  const pickRandomSuggestion = () => {
    const r = suggestions[Math.floor(Math.random() * suggestions.length)];
    setYoutubeUrl(r.url);
  };

  // Explicit preview toggle: only show preview when user requests
  const [showPreview, setShowPreview] = useState(false);

  // Unified toggle handler
  const togglePlayback = async () => {
    if (isChannel) return;
    if (!youtubeId && !youtubeListId) return;
    const yt = getGlobalYT();
    try {
      if (!yt) {
        updateAudioSettings({ youtubeUrl });
        if (youtubeListId && !youtubeId) {
          await createOrUpdateYTPlayer(youtubeListId, true, {
            isPlaylist: true,
          });
        } else if (youtubeId) {
          await createOrUpdateYTPlayer(youtubeId, true);
        }
        return;
      }
      const state = yt.getPlayerState?.();
      if (state === 1) {
        yt.pauseVideo();
      } else if (state === 2) {
        yt.playVideo();
      } else {
        updateAudioSettings({ youtubeUrl });
        if (youtubeListId && !youtubeId) {
          await createOrUpdateYTPlayer(youtubeListId, true, {
            isPlaylist: true,
          });
        } else if (youtubeId) {
          await createOrUpdateYTPlayer(youtubeId, true);
        }
      }
    } catch {}
  };

  const toggleLabel = isChannel
    ? 'Link kênh'
    : ytStatus === 'playing'
    ? 'Tạm dừng'
    : ytStatus === 'paused'
    ? 'Phát lại'
    : 'Phát nền';
  const toggleIcon = isChannel ? (
    <Play className="h-4 w-4" />
  ) : ytStatus === 'playing' ? (
    <Pause className="h-4 w-4" />
  ) : ytStatus === 'paused' ? (
    <Play className="h-4 w-4" />
  ) : (
    <Play className="h-4 w-4" />
  );

  const isValidYouTube =
    !!youtubeUrl && (!!youtubeId || !!youtubeListId) && !isChannel;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold">
            Audio Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="sources" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="sources" className="w-1/3">
              Hệ thống
            </TabsTrigger>
            <TabsTrigger value="player" className="w-1/3">
              <YoutubeIcon className="me-2" /> YouTube
            </TabsTrigger>
            <TabsTrigger value="spotify" className="w-1/3">
              Spotify
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="space-y-6 mt-4">
            {/* Volume */}
            <div className="space-y-2">
              <Label htmlFor="ambient-volume">
                Âm lượng nền: {ambientVolume}%
              </Label>
              <Slider
                id="ambient-volume"
                min={0}
                max={100}
                step={5}
                value={[ambientVolume]}
                onValueChange={(v) => {
                  const vol = v[0];
                  setAmbientVolume(vol);
                  // update all ambient tracks volume
                  Object.values(ambientAudiosRef.current).forEach((el) => {
                    try {
                      el.volume = isMuted ? 0 : vol / 100;
                    } catch {}
                  });
                }}
                className="w-full"
                disabled={isMuted}
              />
            </div>

            {/* Global mute */}
            <div className="flex items-center space-x-2">
              <Switch
                id="mute"
                checked={isMuted}
                onCheckedChange={setIsMuted}
              />
              <Label htmlFor="mute">Tắt tất cả âm thanh</Label>
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </div>

            {/* Ambient groups */}
            {(() => {
              const groups = [
                {
                  key: 'nature',
                  title: 'Thiên nhiên',
                  sounds: ambientSounds.filter((s) =>
                    s.url.includes('/nature/'),
                  ),
                },
                {
                  key: 'rain',
                  title: 'Âm mưa',
                  sounds: ambientSounds.filter((s) => s.url.includes('/rain/')),
                },
                {
                  key: 'things',
                  title: 'Vật dụng/Không gian',
                  sounds: ambientSounds.filter((s) =>
                    s.url.includes('/things/'),
                  ),
                },
                {
                  key: 'transport',
                  title: 'Giao thông/Phương tiện',
                  sounds: ambientSounds.filter((s) =>
                    s.url.includes('/transport/'),
                  ),
                },
                {
                  key: 'urban',
                  title: 'Đô thị',
                  sounds: ambientSounds.filter((s) =>
                    s.url.includes('/urban/'),
                  ),
                },
              ];
              return (
                <div className="space-y-6 pt-2">
                  {groups.map((g) =>
                    g.sounds.length ? (
                      <AmbientGroup
                        key={g.key}
                        title={g.title}
                        sounds={g.sounds as any}
                      />
                    ) : null,
                  )}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="player" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Left: Input + suggestions */}
              <div className="space-y-4">
                {/* Currently playing badge (background) */}
                {(ytStatus === 'playing' || ytStatus === 'paused') && currentYTSource && (
                  <div className="text-xs text-muted-foreground">
                    Đang phát nền:{' '}
                    {currentYTSource.videoId ? (
                      <span className="font-medium">Video {currentYTSource.videoId}</span>
                    ) : currentYTSource.listId ? (
                      <span className="font-medium">Playlist {currentYTSource.listId}</span>
                    ) : null}
                  </div>
                )}
                {/* YouTube Input */}
                <div className="space-y-2">
                  <Label htmlFor="youtube-url">Link YouTube</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="youtube-url"
                      placeholder="Nhập link YouTube của bạn…"
                      value={youtubeUrl}
                      onChange={(e) => {
                        setYoutubeUrl(e.target.value);
                        setShowPreview(true);
                      }}
                    />
                    <Button
                      onClick={togglePlayback}
                      disabled={(!youtubeId && !youtubeListId) || isChannel}
                    >
                      {toggleIcon}
                      <span className="ml-2">{toggleLabel}</span>
                    </Button>
                  </div>
                  {!isValidYouTube && youtubeUrl && !isChannel && (
                    <div className="text-xs text-destructive">
                      Không tìm thấy video hợp lệ.
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Gợi ý phù hợp để học tập/làm việc</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={pickRandomSuggestion}
                    >
                      <Dice3 className="h-4 w-4 mr-1" />
                      Random
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestions.map((item) => {
                      return (
                        <button
                          key={item.url}
                          type="button"
                          onClick={() => {
                            setYoutubeUrl(item.url);
                            setShowPreview(true);
                          }}
                          className="group relative p-3 rounded-lg border text-left transition-colors hover:border-primary hover:bg-primary/5"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium line-clamp-2">
                              {item.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              YouTube
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Nhạc sẽ tiếp tục phát trong nền 🎧 khi bạn bấm Phát nền.
                  </div>
                </div>
              </div>

              {/* Right: Preview card (thumbnail + controls) */}
              <div className="space-y-2">
                <Label>Xem trước</Label>
                {!showPreview ? (
                  <div className="rounded-lg border bg-muted/10 p-4 text-sm text-muted-foreground flex items-center justify-between">
                    <div>
                      {youtubeUrl
                        ? 'Nhấn “Xem trước” để hiển thị preview cho link hiện tại.'
                        : 'Chưa có link YouTube.'}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                      disabled={(!youtubeId && !youtubeListId) || isChannel}
                    >
                      Xem trước
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden bg-muted/20 w-full">
                    <div className="aspect-video bg-muted">
                      {youtubeThumbUrl ? (
                        <img
                          src={youtubeThumbUrl}
                          alt="YouTube thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          {youtubeListId
                            ? 'Playlist đã chọn'
                            : isChannel
                            ? 'Link kênh (không thể preview)'
                            : 'Dán link YouTube để xem trước'}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                      <div className="truncate text-muted-foreground">
                        {youtubeId
                          ? `Video: ${youtubeId}`
                          : youtubeListId
                          ? `Playlist: ${youtubeListId}`
                          : isChannel
                          ? 'Link kênh (không thể phát trực tiếp)'
                          : 'Chưa có video'}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={togglePlayback}
                          disabled={(!youtubeId && !youtubeListId) || isChannel}
                        >
                          {toggleIcon}
                          <span className="ml-1">{toggleLabel}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            try {
                              getGlobalYT()?.stopVideo();
                            } catch {}
                          }}
                          disabled={(!youtubeId && !youtubeListId) || isChannel}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Dừng
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spotify" className="mt-4">
            <SpotifyPane />
          </TabsContent>

        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={saveSettings}>Lưu cài đặt</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AudioSettingsModal;
