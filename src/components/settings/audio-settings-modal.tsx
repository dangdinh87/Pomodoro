"use client"

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Volume2, VolumeX, Leaf, CloudRain, Package, Train, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSystemStore } from '@/stores/system-store'
import audioManager from '@/lib/audio/audio-manager'
import { soundCatalog } from '@/lib/audio/sound-catalog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'

export function AudioSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { audioSettings, updateAudioSettings, updateSoundSettings } = useSystemStore()

  const [isMuted, setIsMuted] = useState(false)
  const [ambientVolume, setAmbientVolume] = useState(audioSettings.volume)
  const [fadeInOut, setFadeInOut] = useState(audioSettings.fadeInOut)
  const [selectedAmbientSound, setSelectedAmbientSound] = useState<string>(audioSettings.selectedAmbientSound)
  const [youtubeUrl, setYoutubeUrl] = useState<string>(audioSettings.youtubeUrl || '')

  // Global YouTube player (persists after modal closes)
  const getOrCreateGlobalYTContainer = () => {
    let el = document.getElementById('youtube-global-container') as HTMLDivElement | null
    if (!el) {
      el = document.createElement('div')
      el.id = 'youtube-global-container'
      el.style.position = 'fixed'
      el.style.width = '0px'
      el.style.height = '0px'
      el.style.left = '-9999px'
      el.style.top = '0'
      document.body.appendChild(el)
    }
    return el
  }
  const setGlobalYT = (p: any) => { (window as any).__globalYTPlayer = p }
  const getGlobalYT = () => (window as any).__globalYTPlayer || null

  const ambientSounds = soundCatalog.ambient

  // ambient mixing
  const [activeAmbientIds, setActiveAmbientIds] = useState<string[]>([])
  const ambientAudiosRef = useRef<Record<string, HTMLAudioElement>>({})

  useEffect(() => {
    setAmbientVolume(audioSettings.volume)
    setFadeInOut(audioSettings.fadeInOut)
    setSelectedAmbientSound(audioSettings.selectedAmbientSound)
    setYoutubeUrl(audioSettings.youtubeUrl || '')
  }, [audioSettings])

  useEffect(() => {
    return () => {
      audioManager.stop({ fadeOutMs: 150 })
    }
  }, [])

  // Keep YouTube player volume/mute in sync with global settings
  useEffect(() => {
    try {
      const yt = getGlobalYT()
      if (!yt) return
      if (isMuted) yt.mute()
      else yt.unMute()
      yt.setVolume(ambientVolume)
    } catch {}
  }, [isMuted, ambientVolume])

  // Ensure only one ambient at a time; if YouTube is playing, pause it
  const pauseYouTube = () => {
    try { getGlobalYT()?.pauseVideo() } catch {}
    try { getGlobalYT()?.stopVideo() } catch {}
  }

  const playSoundPreview = async (soundId: string) => {
    const sound = ambientSounds.find((s) => s.id === soundId)
    if (!sound) return
    const isActive = activeAmbientIds.includes(sound.id)
    if (isActive) {
      const el = ambientAudiosRef.current[sound.id]
      if (el) {
        try { el.pause() } catch {}
        delete ambientAudiosRef.current[sound.id]
      }
      setActiveAmbientIds((prev) => prev.filter((id) => id !== sound.id))
    } else {
      // Allow mixing: just pause YouTube and start this track in addition to others
      pauseYouTube()
      const el = new Audio(sound.url)
      el.loop = true
      el.volume = isMuted ? 0 : ambientVolume / 100
      try { await el.play() } catch {}
      ambientAudiosRef.current[sound.id] = el
      setActiveAmbientIds((prev) => [...prev, sound.id])
    }
  }

  const stopAllAmbient = async () => {
    // Stop any manager-driven playback (backward compatibility)
    try { await audioManager.stop({ fadeOutMs: 150 }) } catch {}

    // Pause and clear all ambient mix tracks
    try {
      Object.entries(ambientAudiosRef.current).forEach(([id, el]) => {
        try { el.pause() } catch {}
        delete ambientAudiosRef.current[id]
      })
    } catch {}
    setActiveAmbientIds([])
  }

  const saveSettings = () => {
    updateSoundSettings({
      soundType: 'bell',
      volume: ambientVolume,
      isMuted,
    })
    updateAudioSettings({ selectedAmbientSound, volume: ambientVolume, fadeInOut, youtubeUrl })
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro-sound-settings', JSON.stringify({ soundType: 'bell', volume: ambientVolume, isMuted }))
      localStorage.setItem('pomodoro-audio-settings', JSON.stringify({ selectedAmbientSound, volume: ambientVolume, fadeInOut, youtubeUrl }))
    }
    toast.success('Audio settings saved successfully!')
    onClose()
  }

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null
    try {
      const u = new URL(url)
      if (u.hostname === 'youtu.be') {
        const id = u.pathname.split('/').filter(Boolean)[0]
        return id || null
      }
      if (u.hostname.includes('youtube.com')) {
        if (u.pathname.startsWith('/watch')) {
          const id = u.searchParams.get('v')
          return id || null
        }
        if (u.pathname.startsWith('/shorts/')) {
          const id = u.pathname.split('/').filter(Boolean)[1]
          return id || null
        }
        if (u.pathname.startsWith('/live/')) {
          const id = u.pathname.split('/').filter(Boolean)[1]
          return id || null
        }
      }
      return null
    } catch {
      return null
    }
  }

  const youtubeId = extractYouTubeId(youtubeUrl)
  const youtubeEmbedUrl = youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&controls=1` : null

  const ensureYouTubeAPI = (): Promise<any> => {
    return new Promise((resolve) => {
      const w = window as any
      if (w.YT && w.YT.Player) {
        resolve(w.YT)
        return
      }
      const prev = document.getElementById('youtube-iframe-api') as HTMLScriptElement | null
      if (!prev) {
        const tag = document.createElement('script')
        tag.id = 'youtube-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
      ;(window as any).onYouTubeIframeAPIReady = () => {
        resolve((window as any).YT)
      }
    })
  }

  const createOrUpdateYTPlayer = async (videoId: string, autoPlay: boolean) => {
    const YT = await ensureYouTubeAPI()
    const existing = getGlobalYT()
    if (existing) {
      try {
        if (autoPlay) { // enforce exclusivity
          await stopAllAmbient()
          try { existing.unMute?.() } catch {}
        }
        existing.loadVideoById(videoId)
        if (autoPlay) existing.playVideo()
      } catch {}
      return
    }
    const mount = getOrCreateGlobalYTContainer()
    const player = new YT.Player(mount, {
      videoId,
      playerVars: { rel: 0, modestbranding: 1, controls: 1 },
      events: {
        onReady: () => {
          if (autoPlay) {
            ;(async () => {
              try { await stopAllAmbient() } catch {}
              try { player.unMute?.() } catch {}
              try { player.playVideo() } catch {}
            })()
          }
        },
      },
    })
    setGlobalYT(player)
  }

  useEffect(() => {
    // keep player in sync when url changes
    if (youtubeId) {
      createOrUpdateYTPlayer(youtubeId, false)
    }
    return () => {
      // no-op here to avoid destroying while switching tabs
    }
  }, [youtubeId])

  // Keep global YT player alive after modal closes
  useEffect(() => {
    return () => {}
  }, [])

  const iconForUrl = (url: string) => {
    if (url.includes('/nature/')) return <Leaf className="h-4 w-4 text-muted-foreground" />
    if (url.includes('/rain/')) return <CloudRain className="h-4 w-4 text-muted-foreground" />
    if (url.includes('/transport/')) return <Train className="h-4 w-4 text-muted-foreground" />
    if (url.includes('/urban/')) return <Building2 className="h-4 w-4 text-muted-foreground" />
    return <Package className="h-4 w-4 text-muted-foreground" />
  }

  const AmbientGroup = ({ title, sounds }: { title: string; sounds: typeof soundCatalog.ambient }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {sounds.map((s) => {
          const isActive = activeAmbientIds.includes(s.id)
          return (
            <div key={s.id} className={`p-3 border rounded-lg flex items-center justify-between transition-all ${isActive ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}>
              <div className="flex-1 min-w-0 flex items-start gap-2">
                <div className="shrink-0 mt-0.5">{iconForUrl(s.url)}</div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{s.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.vn || s.label}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <Button size="sm" variant={isActive ? 'default' : 'outline'} onClick={() => { setSelectedAmbientSound(s.id); playSoundPreview(s.id) }} aria-label={isActive ? `Tắt ${s.label}` : `Phát ${s.label}`}>
                  {isActive ? 'Tắt' : 'Phát'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audio Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Volume on top */}
          <div className="space-y-2">
            <Label htmlFor="ambient-volume">Âm lượng nền: {ambientVolume}%</Label>
            <Slider
              id="ambient-volume"
              min={0}
              max={100}
              step={5}
              value={[ambientVolume]}
              onValueChange={(v) => {
                const vol = v[0]
                setAmbientVolume(vol)
                // update all ambient tracks volume
                Object.values(ambientAudiosRef.current).forEach((el) => { try { el.volume = isMuted ? 0 : vol / 100 } catch {} })
              }}
              className="w-full"
              disabled={isMuted}
            />
          </div>

          {/* Global mute */}
          <div className="flex items-center space-x-2">
            <Switch id="mute" checked={isMuted} onCheckedChange={setIsMuted} />
            <Label htmlFor="mute">Tắt tất cả âm thanh</Label>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </div>

          <Tabs defaultValue="library">
            <TabsList>
              <TabsTrigger value="library">Thư viện âm thanh</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-6">
              {/* Ambient groups */}
              {(() => {
                const groups = [
                  { key: 'nature', title: 'Thiên nhiên', sounds: ambientSounds.filter(s => s.url.includes('/nature/')) },
                  { key: 'rain', title: 'Âm mưa', sounds: ambientSounds.filter(s => s.url.includes('/rain/')) },
                  { key: 'things', title: 'Vật dụng/Không gian', sounds: ambientSounds.filter(s => s.url.includes('/things/')) },
                  { key: 'transport', title: 'Giao thông/Phương tiện', sounds: ambientSounds.filter(s => s.url.includes('/transport/')) },
                  { key: 'urban', title: 'Đô thị', sounds: ambientSounds.filter(s => s.url.includes('/urban/')) },
                ]
                return (
                  <div className="space-y-6 pt-2">
                    {groups.map(g => g.sounds.length ? (
                      <AmbientGroup key={g.key} title={g.title} sounds={g.sounds as any} />
                    ) : null)}
                  </div>
                )
              })()}
            </TabsContent>

            <TabsContent value="youtube" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Left column: input + suggestions + note */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-url">Link YouTube</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="youtube-url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                      />
                      <Button
                        onClick={async () => {
                          if (!youtubeId) return
                          updateAudioSettings({ youtubeUrl })
                          try { await createOrUpdateYTPlayer(youtubeId, true) } catch {}
                        }}
                        disabled={!youtubeId}
                      >
                        Phát nền
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gợi ý link phù hợp để học tập/làm việc</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                    { label: 'Lofi Girl - beats to relax/study', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
                    { label: 'Chillhop Radio - lofi beats', url: 'https://www.youtube.com/watch?v=5yx6BWlEVcY' },
                    { label: 'Good Life Radio - chill/house', url: 'https://www.youtube.com/watch?v=36YnV9STBqc' },
                    { label: 'Rain Sounds 10 Hours', url: 'https://www.youtube.com/watch?v=1ZYbU82GVz4' },
                    { label: 'Deep Focus Study Music', url: 'https://www.youtube.com/watch?v=hHW1oY26kxQ' },
                      ].map((item) => (
                        <Button key={item.url} variant="outline" size="sm" onClick={() => setYoutubeUrl(item.url)}>
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Link sẽ được lưu trong cài đặt âm thanh. Trình phát YouTube có thể xem trước ở cột bên và có thể phát nền để tiếp tục khi đóng cửa sổ này.
                  </div>
                </div>

                {/* Right column: preview */}
                <div className="space-y-2">
                  {youtubeId && (
                    <div className="rounded-lg border overflow-hidden bg-muted/20 w-full">
                      <div className="aspect-video">
                        <iframe
                          className="w-full h-full"
                          src={`${youtubeEmbedUrl}&autoplay=0`}
                          title="YouTube preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                        <div className="truncate text-muted-foreground">Video: {youtubeId}</div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!youtubeId) return
                              updateAudioSettings({ youtubeUrl })
                              try { await createOrUpdateYTPlayer(youtubeId, true) } catch {}
                            }}
                          >
                            Phát nền
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { try { getGlobalYT()?.pauseVideo() } catch {} }}>
                            Tạm dừng
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { try { getGlobalYT()?.stopVideo() } catch {} }}>
                            Dừng
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Đóng</Button>
            <Button onClick={saveSettings}>Lưu cài đặt</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AudioSettingsModal


