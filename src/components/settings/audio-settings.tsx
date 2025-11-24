"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
    Volume2,
    VolumeX,
    Leaf,
    CloudRain,
    Package,
    Train,
    Building2,
    YoutubeIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSystemStore } from '@/stores/system-store'
import audioManager from '@/lib/audio/audio-manager'
import { soundCatalog } from '@/lib/audio/sound-catalog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SpotifyPane from '@/components/audio/spotify/spotify-pane'
import YouTubePane from '@/components/audio/youtube/youtube-pane'
import { Separator } from '@/components/ui/separator'

export function AudioSettings() {
    const { audioSettings, updateAudioSettings, updateSoundSettings } =
        useSystemStore()

    const [isMuted, setIsMuted] = useState(false)
    const [ambientVolume, setAmbientVolume] = useState(audioSettings.volume)
    const [fadeInOut, setFadeInOut] = useState(audioSettings.fadeInOut)
    const [selectedAmbientSound, setSelectedAmbientSound] = useState<string>(
        audioSettings.selectedAmbientSound,
    )

    const ambientSounds = soundCatalog.ambient

    // ambient mixing
    const [activeAmbientIds, setActiveAmbientIds] = useState<string[]>([])
    const ambientAudiosRef = useRef<Record<string, HTMLAudioElement>>({})

    useEffect(() => {
        setAmbientVolume(audioSettings.volume)
        setFadeInOut(audioSettings.fadeInOut)
        setSelectedAmbientSound(audioSettings.selectedAmbientSound)
    }, [audioSettings])

    useEffect(() => {
        return () => {
            audioManager.stop()
        }
    }, [])

    const playSoundPreview = async (soundId: string) => {
        const sound = ambientSounds.find((s) => s.id === soundId)
        if (!sound) return
        const isActive = activeAmbientIds.includes(sound.id)
        if (isActive) {
            const el = ambientAudiosRef.current[sound.id]
            if (el) {
                try {
                    el.pause()
                } catch { }
                delete ambientAudiosRef.current[sound.id]
            }
            setActiveAmbientIds((prev) => prev.filter((id) => id !== sound.id))
        } else {
            const el = new Audio(sound.url)
            el.loop = true
            el.volume = isMuted ? 0 : ambientVolume / 100
            try {
                await el.play()
            } catch { }
            ambientAudiosRef.current[sound.id] = el
            setActiveAmbientIds((prev) => [...prev, sound.id])
        }
    }

    const saveSettings = () => {
        updateSoundSettings({
            soundType: 'bell',
            volume: ambientVolume,
            isMuted,
        })
        updateAudioSettings({
            selectedAmbientSound,
            volume: ambientVolume,
            fadeInOut,
        })
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                'pomodoro-sound-settings',
                JSON.stringify({ soundType: 'bell', volume: ambientVolume, isMuted }),
            )
            localStorage.setItem(
                'pomodoro-audio-settings',
                JSON.stringify({
                    selectedAmbientSound,
                    volume: ambientVolume,
                    fadeInOut,
                }),
            )
        }
        toast.success('Audio settings saved successfully!')
    }

    const iconForUrl = (url: string) => {
        if (url.includes('/nature/'))
            return <Leaf className="h-4 w-4 text-muted-foreground" />
        if (url.includes('/rain/'))
            return <CloudRain className="h-4 w-4 text-muted-foreground" />
        if (url.includes('/transport/'))
            return <Train className="h-4 w-4 text-muted-foreground" />
        if (url.includes('/urban/'))
            return <Building2 className="h-4 w-4 text-muted-foreground" />
        return <Package className="h-4 w-4 text-muted-foreground" />
    }

    const AmbientGroup = ({
        title,
        sounds,
    }: {
        title: string
        sounds: typeof soundCatalog.ambient
    }) => (
        <div className="space-y-3">
            <Label className="text-sm font-medium">{title}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {sounds.map((s) => {
                    const isActive = activeAmbientIds.includes(s.id)
                    return (
                        <div
                            key={s.id}
                            className={`p-3 border rounded-lg flex items-center justify-between transition-all ${isActive
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
                                        setSelectedAmbientSound(s.id)
                                        playSoundPreview(s.id)
                                    }}
                                    aria-label={isActive ? `Tắt ${s.label}` : `Phát ${s.label}`}
                                >
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
        <div className="space-y-6">
            <Tabs defaultValue="sources" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/20 p-1">
                    <TabsTrigger
                        value="sources"
                        className="rounded-lg text-sm font-medium"
                    >
                        Hệ thống
                    </TabsTrigger>
                    <TabsTrigger
                        value="player"
                        className="rounded-lg text-sm font-semibold"
                    >
                        <YoutubeIcon className="me-2 h-4 w-4" />
                        YouTube
                    </TabsTrigger>
                    <TabsTrigger
                        value="spotify"
                        className="rounded-lg text-sm font-semibold"
                    >
                        Spotify
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sources" className="space-y-6 mt-6">
                    {/* Volume */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Volume Control</h2>
                        <Separator />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ambient-volume">
                                    Ambient Volume: {ambientVolume}%
                                </Label>
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
                                        Object.values(ambientAudiosRef.current).forEach((el) => {
                                            try {
                                                el.volume = isMuted ? 0 : vol / 100
                                            } catch { }
                                        })
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
                                <Label htmlFor="mute">Mute all sounds</Label>
                                {isMuted ? (
                                    <VolumeX className="h-4 w-4" />
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ambient groups */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Ambient Sounds</h2>
                        <Separator />
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
                                    sounds: ambientSounds.filter((s) =>
                                        s.url.includes('/rain/'),
                                    ),
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
                            ]
                            return (
                                <div className="space-y-6">
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
                            )
                        })()}
                    </div>
                </TabsContent>

                <TabsContent value="player" className="mt-6">
                    <YouTubePane />
                </TabsContent>

                <TabsContent value="spotify" className="mt-6">
                    <SpotifyPane />
                </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={saveSettings}>Save Audio Settings</Button>
            </div>
        </div>
    )
}
