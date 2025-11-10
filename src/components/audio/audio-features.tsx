"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  Waves,
  Upload,
  Headphones,
  Bell,
  Settings
} from 'lucide-react'

interface AmbientSound {
  id: string
  name: string
  vietnameseName: string
  icon: React.ReactNode
  url: string
  category: string
}

interface NotificationSound {
  id: string
  name: string
  url: string
}

const ambientSounds: AmbientSound[] = [
  // Nature sounds
  { id: 'campfire', name: 'Campfire', vietnameseName: 'Lửa trại', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/campfire.mp3', category: 'Nature' },
  { id: 'droplets', name: 'Droplets', vietnameseName: 'Giọt nước', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/droplets.mp3', category: 'Nature' },
  { id: 'howling-wind', name: 'Howling Wind', vietnameseName: 'Gió rít', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/howling-wind.mp3', category: 'Nature' },
  { id: 'river', name: 'River', vietnameseName: 'Dòng sông', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/river.mp3', category: 'Nature' },
  { id: 'walk-in-snow', name: 'Walk in Snow', vietnameseName: 'Đi trong tuyết', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/walk-in-snow.mp3', category: 'Nature' },
  { id: 'walk-on-gravel', name: 'Walk on Gravel', vietnameseName: 'Đi trên sỏi', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/walk-on-gravel.mp3', category: 'Nature' },
  { id: 'walk-on-leaves', name: 'Walk on Leaves', vietnameseName: 'Đi trên lá', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/walk-on-leaves.mp3', category: 'Nature' },
  { id: 'waves', name: 'Waves', vietnameseName: 'Sóng biển', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/waves.mp3', category: 'Nature' },
  { id: 'wind-in-trees', name: 'Wind in Trees', vietnameseName: 'Gió trong cây', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/wind-in-trees.mp3', category: 'Nature' },
  { id: 'wind', name: 'Wind', vietnameseName: 'Gió', icon: <Waves className="h-4 w-4" />, url: '/sounds/nature/wind.mp3', category: 'Nature' },
  
  // Rain sounds
  { id: 'heavy-rain', name: 'Heavy Rain', vietnameseName: 'Mưa lớn', icon: <Waves className="h-4 w-4" />, url: '/sounds/rain/heavy-rain.mp3', category: 'Rain' },
  { id: 'light-rain', name: 'Light Rain', vietnameseName: 'Mưa nhỏ', icon: <Waves className="h-4 w-4" />, url: '/sounds/rain/light-rain.mp3', category: 'Rain' },
  { id: 'rain-on-car-roof', name: 'Rain on Car Roof', vietnameseName: 'Mưa trên nóc xe', icon: <Waves className="h-4 w-4" />, url: '/sounds/rain/rain-on-car-roof.mp3', category: 'Rain' },
  { id: 'rain-on-leaves', name: 'Rain on Leaves', vietnameseName: 'Mưa trên lá', icon: <Waves className="h-4 w-4" />, url: '/sounds/rain/rain-on-leaves.mp3', category: 'Rain' },
  { id: 'rain-on-tent', name: 'Rain on Tent', vietnameseName: 'Mưa trên lều', icon: <Waves className="h-4 w-4" />, url: '/sounds/rain/rain-on-tent.mp3', category: 'Rain' },
  { id: 'rain-on-umbrella', name: 'Rain on Umbrella', vietnameseName: 'Mưa trên ô', icon: <Waves className="h-4 w-4" />, url: '/sounds/rain/rain-on-umbrella.mp3', category: 'Rain' },
  { id: 'rain-on-window', name: 'Rain on Window', vietnameseName: 'Mưa trên cửa sổ', icon: <Waves className="h-4 w-4" />, url: '/sounds/rain/rain-on-window.mp3', category: 'Rain' },
  { id: 'thunder', name: 'Thunder', vietnameseName: 'Sấm', icon: <Waves className="h-4 w-4" />, url: '/sounds/rain/thunder.mp3', category: 'Rain' },
  
  // Things sounds
  { id: 'boiling-water', name: 'Boiling Water', vietnameseName: 'Nước sôi', icon: <Music className="h-4 w-4" />, url: '/sounds/things/boiling-water.mp3', category: 'Things' },
  { id: 'bubbles', name: 'Bubbles', vietnameseName: 'Bọt khí', icon: <Music className="h-4 w-4" />, url: '/sounds/things/bubbles.mp3', category: 'Things' },
  { id: 'ceiling-fan', name: 'Ceiling Fan', vietnameseName: 'Quạt trần', icon: <Music className="h-4 w-4" />, url: '/sounds/things/ceiling-fan.mp3', category: 'Things' },
  { id: 'clock', name: 'Clock', vietnameseName: 'Đồng hồ', icon: <Music className="h-4 w-4" />, url: '/sounds/things/clock.mp3', category: 'Things' },
  { id: 'keyboard', name: 'Keyboard', vietnameseName: 'Bàn phím', icon: <Music className="h-4 w-4" />, url: '/sounds/things/keyboard.mp3', category: 'Things' },
  { id: 'paper', name: 'Paper', vietnameseName: 'Giấy', icon: <Music className="h-4 w-4" />, url: '/sounds/things/paper.mp3', category: 'Things' },
  { id: 'singing-bowl', name: 'Singing Bowl', vietnameseName: 'Chén hát', icon: <Music className="h-4 w-4" />, url: '/sounds/things/singing-bowl.mp3', category: 'Things' },
  { id: 'tuning-radio', name: 'Tuning Radio', vietnameseName: 'Lên đài', icon: <Music className="h-4 w-4" />, url: '/sounds/things/tuning-radio.mp3', category: 'Things' },
  { id: 'typewriter', name: 'Typewriter', vietnameseName: 'Máy viết chữ', icon: <Music className="h-4 w-4" />, url: '/sounds/things/typewriter.mp3', category: 'Things' },
  { id: 'vinyl-effect', name: 'Vinyl Effect', vietnameseName: 'Đĩa than', icon: <Music className="h-4 w-4" />, url: '/sounds/things/vinyl-effect.mp3', category: 'Things' },
  { id: 'washing-machine', name: 'Washing Machine', vietnameseName: 'Máy giặt', icon: <Music className="h-4 w-4" />, url: '/sounds/things/washing-machine.mp3', category: 'Things' },
  { id: 'wind-chimes', name: 'Wind Chimes', vietnameseName: 'Chuông gió', icon: <Music className="h-4 w-4" />, url: '/sounds/things/wind-chimes.mp3', category: 'Things' },
  
  // Transport sounds
  { id: 'airplane', name: 'Airplane', vietnameseName: 'Máy bay', icon: <Headphones className="h-4 w-4" />, url: '/sounds/transport/airplane.mp3', category: 'Transport' },
  { id: 'inside-a-train', name: 'Inside a Train', vietnameseName: 'Trong tàu hỏa', icon: <Headphones className="h-4 w-4" />, url: '/sounds/transport/inside-a-train.mp3', category: 'Transport' },
  { id: 'rowing-boat', name: 'Rowing Boat', vietnameseName: 'Thuyền chèo', icon: <Headphones className="h-4 w-4" />, url: '/sounds/transport/rowing-boat.mp3', category: 'Transport' },
  { id: 'sailboat', name: 'Sailboat', vietnameseName: 'Thuyền buồm', icon: <Headphones className="h-4 w-4" />, url: '/sounds/transport/sailboat.mp3', category: 'Transport' },
  { id: 'submarine', name: 'Submarine', vietnameseName: 'Tàu ngầm', icon: <Headphones className="h-4 w-4" />, url: '/sounds/transport/submarine.mp3', category: 'Transport' },
  { id: 'train', name: 'Train', vietnameseName: 'Tàu hỏa', icon: <Headphones className="h-4 w-4" />, url: '/sounds/transport/train.mp3', category: 'Transport' },
  
  // Urban sounds
  { id: 'busy-street', name: 'Busy Street', vietnameseName: 'Đường đông', icon: <Headphones className="h-4 w-4" />, url: '/sounds/urban/busy-street.mp3', category: 'Urban' },
  { id: 'crowd', name: 'Crowd', vietnameseName: 'Đám đông', icon: <Headphones className="h-4 w-4" />, url: '/sounds/urban/crowd.mp3', category: 'Urban' },
  { id: 'highway', name: 'Highway', vietnameseName: 'Đường cao tốc', icon: <Headphones className="h-4 w-4" />, url: '/sounds/urban/highway.mp3', category: 'Urban' },
  { id: 'road', name: 'Road', vietnameseName: 'Con đường', icon: <Headphones className="h-4 w-4" />, url: '/sounds/urban/road.mp3', category: 'Urban' },
  { id: 'traffic', name: 'Traffic', vietnameseName: 'Giao thông', icon: <Headphones className="h-4 w-4" />, url: '/sounds/urban/traffic.mp3', category: 'Urban' },
]

const notificationSounds: NotificationSound[] = [
  { id: 'alarm', name: 'Alarm', url: '/sounds/alarm.mp3' },
  { id: 'silence', name: 'Silence', url: '/sounds/silence.mp3' },
]

export function AudioFeatures() {
  const [selectedAmbientSound, setSelectedAmbientSound] = useState('')
  const [volume, setVolume] = useState(50)
  const [fadeInOut, setFadeInOut] = useState(true)
  const [selectedNotificationSound, setSelectedNotificationSound] = useState('alarm')
  const [notificationVolume, setNotificationVolume] = useState(70)
  const [customSounds, setCustomSounds] = useState<NotificationSound[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('audioSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setSelectedAmbientSound(settings.selectedAmbientSound || '')
      setVolume(settings.volume || 50)
      setFadeInOut(settings.fadeInOut !== false)
      setSelectedNotificationSound(settings.selectedNotificationSound || 'alarm')
      setNotificationVolume(settings.notificationVolume || 70)
    }
  }, [])

  useEffect(() => {
    // Save settings to localStorage
    const settings = {
      selectedAmbientSound,
      volume,
      fadeInOut,
      selectedNotificationSound,
      notificationVolume
    }
    localStorage.setItem('audioSettings', JSON.stringify(settings))
  }, [selectedAmbientSound, volume, fadeInOut, selectedNotificationSound, notificationVolume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const playAmbientSound = (soundId?: string) => {
    const targetSoundId = soundId || selectedAmbientSound
    if (!targetSoundId) return

    const sound = ambientSounds.find(s => s.id === targetSoundId)
    if (!sound) return

    // Stop any currently playing sound
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // Create new audio element
    const audio = new Audio()
    audio.src = sound.url
    audio.loop = true // Always loop
    audio.volume = fadeInOut ? 0 : volume / 100
    
    // Add event listeners
    audio.addEventListener('canplaythrough', () => {
      if (fadeInOut) {
        // Fade in effect
        const fadeInInterval = setInterval(() => {
          if (audio.volume < volume / 100) {
            audio.volume = Math.min(audio.volume + 0.01, volume / 100)
          } else {
            clearInterval(fadeInInterval)
          }
        }, 50)
      }
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
      })
      setIsPlaying(true)
      setCurrentlyPlaying(targetSoundId)
    })

    audio.addEventListener('error', (e) => {
      console.error('Error loading audio:', e)
      setIsPlaying(false)
      setCurrentlyPlaying(null)
    })

    audio.addEventListener('ended', () => {
      // Audio will always loop, so we don't need to handle ended event
    })

    // Store reference
    audioRef.current = audio
  }

  const stopAmbientSound = () => {
    if (!audioRef.current) return

    if (fadeInOut) {
      // Fade out effect
      const fadeOutInterval = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.01) {
          audioRef.current.volume = Math.max(audioRef.current.volume - 0.01, 0)
        } else {
          clearInterval(fadeOutInterval)
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
          }
          setIsPlaying(false)
          setCurrentlyPlaying(null)
        }
      }, 50)
    } else {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
      setCurrentlyPlaying(null)
    }
  }

  const playNotificationSound = () => {
    const sound = notificationSounds.find(s => s.id === selectedNotificationSound)
    if (!sound) return

    const audio = new Audio(sound.url)
    audio.volume = notificationVolume / 100
    audio.play()
    
    // Auto-stop after 5 seconds
    setTimeout(() => {
      audio.pause()
    }, 5000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('audio/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newSound: NotificationSound = {
            id: Date.now().toString(),
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: e.target?.result as string
          }
          setCustomSounds(prev => [...prev, newSound])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeCustomSound = (id: string) => {
    setCustomSounds(prev => prev.filter(sound => sound.id !== id))
  }

  const playCustomSound = (sound: NotificationSound) => {
    // Stop any currently playing sound
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // Create new audio element
    const audio = new Audio()
    audio.src = sound.url
    audio.loop = true // Always loop
    audio.volume = fadeInOut ? 0 : volume / 100
    
    // Add event listeners
    audio.addEventListener('canplaythrough', () => {
      if (fadeInOut) {
        // Fade in effect
        const fadeInInterval = setInterval(() => {
          if (audio.volume < volume / 100) {
            audio.volume = Math.min(audio.volume + 0.01, volume / 100)
          } else {
            clearInterval(fadeInInterval)
          }
        }, 50)
      }
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
      })
      setIsPlaying(true)
      setCurrentlyPlaying(sound.id)
    })

    audio.addEventListener('error', (e) => {
      console.error('Error loading audio:', e)
      setIsPlaying(false)
      setCurrentlyPlaying(null)
    })

    audio.addEventListener('ended', () => {
      // Audio will always loop, so we don't need to handle ended event
    })

    // Store reference
    audioRef.current = audio
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Audio & Ambient Features</h2>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Audio Settings */}
      <Card className="bg-background/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Audio Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="fade-in-out">Fade In/Out</Label>
                <p className="text-sm text-muted-foreground">
                  Smooth volume transitions when starting/stopping
                </p>
              </div>
              <Switch
                id="fade-in-out"
                checked={fadeInOut}
                onCheckedChange={setFadeInOut}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Master Volume</Label>
            <div className="flex items-center space-x-4">
              <VolumeX className="h-4 w-4" />
              <Slider
                id="volume"
                min={0}
                max={100}
                step={1}
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                className="flex-1"
              />
              <Volume2 className="h-4 w-4" />
              <span className="w-12 text-right text-sm">{volume}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ambient Sounds */}
      <Card className="bg-background/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Ambient Sounds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group sounds by category */}
          {['Nature', 'Rain', 'Things', 'Transport', 'Urban'].map(category => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {category === 'Nature' && <Waves className="h-5 w-5" />}
                {category === 'Rain' && <Waves className="h-5 w-5" />}
                {category === 'Things' && <Music className="h-5 w-5" />}
                {category === 'Transport' && <Headphones className="h-5 w-5" />}
                {category === 'Urban' && <Headphones className="h-5 w-5" />}
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {ambientSounds
                  .filter(sound => sound.category === category)
                  .map((sound) => (
                    <div
                      key={sound.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        currentlyPlaying === sound.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {sound.icon}
                          <div>
                            <div className="font-medium">{sound.name}</div>
                            <div className="text-sm text-muted-foreground">{sound.vietnameseName}</div>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (currentlyPlaying === sound.id) {
                            stopAmbientSound()
                          } else {
                            playAmbientSound(sound.id)
                          }
                        }}
                        className="w-full"
                      >
                        {currentlyPlaying === sound.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {currentlyPlaying === sound.id ? 'Stop' : 'Play'}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Currently Playing</Label>
              <p className="text-sm text-muted-foreground">
                {currentlyPlaying 
                  ? `${ambientSounds.find(s => s.id === currentlyPlaying)?.name} (${ambientSounds.find(s => s.id === currentlyPlaying)?.vietnameseName})`
                  : 'No sound playing'
                }
              </p>
            </div>
            <Button
              onClick={() => isPlaying ? stopAmbientSound() : playAmbientSound()}
              disabled={!selectedAmbientSound}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Stop' : 'Play'}
            </Button>
          </div>

          <div className="space-y-4">
            <Label>Custom Audio Files</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="custom-audio-upload"
              />
              <Button
                onClick={() => document.getElementById('custom-audio-upload')?.click()}
                variant="outline"
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Audio Files
              </Button>
            </div>

            {customSounds.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Audio Files</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {customSounds.map((sound) => (
                    <div
                      key={sound.id}
                      className={`p-3 border rounded-lg flex items-center justify-between ${
                        currentlyPlaying === sound.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      <span className="text-sm font-medium truncate">{sound.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (currentlyPlaying === sound.id) {
                              stopAmbientSound()
                            } else {
                              playCustomSound(sound)
                            }
                          }}
                        >
                          {currentlyPlaying === sound.id ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCustomSound(sound.id)}
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Sounds */}
      <Card className="bg-background/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Sounds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-sound">Session Complete Sound</Label>
              <Select value={selectedNotificationSound} onValueChange={setSelectedNotificationSound}>
                <SelectTrigger>
                  <SelectValue placeholder="Select notification sound" />
                </SelectTrigger>
                <SelectContent>
                  {notificationSounds.map((sound) => (
                    <SelectItem key={sound.id} value={sound.id}>
                      {sound.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-volume">Notification Volume</Label>
              <div className="flex items-center space-x-4">
                <VolumeX className="h-4 w-4" />
                <Slider
                  id="notification-volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[notificationVolume]}
                  onValueChange={(value) => setNotificationVolume(value[0])}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4" />
                <span className="w-12 text-right text-sm">{notificationVolume}%</span>
              </div>
            </div>

            <Button
              onClick={playNotificationSound}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Test Notification Sound (5s)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Import ThemeToggle at the bottom to avoid circular imports
import { ThemeToggle } from '@/components/layout/theme-toggle'