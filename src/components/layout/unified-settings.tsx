'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBackground } from '@/contexts/background-context';
import { useSystemStore } from '@/stores/system-store';
import { useTimerStore } from '@/stores/timer-store';
import {
  Activity,
  Clock,
  Headphones,
  Palette,
  Play,
  Pause,
  Settings,
  Timer,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import audioManager from '@/lib/audio/audio-manager';
import { soundCatalog } from '@/lib/audio/sound-catalog';

interface UnifiedSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimerSettingsData {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of work sessions before long break
  autoStartBreak: boolean;
  autoStartWork: boolean;
  clockType: 'digital' | 'analog' | 'progress' | 'flip';
  showClock: boolean;
  lowTimeWarningEnabled: boolean; // low-time glow/shake under 10s
}

interface SoundSettingsData {
  soundType: 'bell' | 'chime' | 'gong' | 'digital' | 'none';
  volume: number;
  isMuted: boolean;
}

// Clock Preview Component
function ClockPreview({
  clockType,
}: {
  clockType: 'digital' | 'analog' | 'progress' | 'flip';
}) {
  const previewTime = 1500; // 25:00 in seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };
  const progressPercent = 0; // Preview at start

  switch (clockType) {
    case 'digital':
      return (
        <div className="text-center">
          <div className="text-5xl md:text-6xl   font-bold text-[hsl(var(--timer-foreground))]">
            {formatTime(previewTime)}
          </div>
        </div>
      );
    case 'analog':
      return (
        <div className="text-center">
          <div
            className="relative w-48 h-48 mx-auto"
            style={{ color: 'hsl(var(--timer-foreground))' }}
          >
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 200 200"
              aria-label="Analog preview"
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="opacity-20"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * 0}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl font-bold text-[hsl(var(--timer-foreground))]">
                {formatTime(previewTime)}
              </div>
            </div>
          </div>
        </div>
      );
    case 'progress':
      return (
        <div className="text-center">
          <div className="mb-4">
            <div className="text-3xl font-bold text-[hsl(var(--timer-foreground))]">
              {formatTime(previewTime)}
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-6">
            <div
              className="h-6 rounded-full transition-all duration-1000"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'hsl(var(--timer-foreground))',
              }}
            />
          </div>
        </div>
      );
    case 'flip':
      const mins = Math.floor(previewTime / 60);
      const secs = previewTime % 60;
      return (
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2">
            <div
              className="bg-background border-2 p-3 rounded-lg"
              style={{ borderColor: 'hsl(var(--timer-foreground))' }}
            >
              <div className="text-4xl   font-bold text-[hsl(var(--timer-foreground))]">
                {mins.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="text-4xl   font-bold text-[hsl(var(--timer-foreground))]">
              :
            </div>
            <div
              className="bg-background border-2 p-3 rounded-lg"
              style={{ borderColor: 'hsl(var(--timer-foreground))' }}
            >
              <div className="text-4xl   font-bold text-[hsl(var(--timer-foreground))]">
                {secs.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

// Timer Settings Content Component (without Dialog wrapper)
function TimerSettingsContent({
  settings,
  onSettingsChange,
}: {
  settings: TimerSettingsData;
  onSettingsChange: (settings: TimerSettingsData) => void;
}) {
  const [localSettings, setLocalSettings] =
    useState<TimerSettingsData>(settings);
  const { updateSettings } = useTimerStore();

  const saveSettings = () => {
    onSettingsChange(localSettings);
    updateSettings(localSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'pomodoro-timer-settings',
        JSON.stringify(localSettings),
      );
    }
    toast.success('Timer settings saved successfully!');
  };

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const resetToDefaults = () => {
    const defaultSettings: TimerSettingsData = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreak: true,
      autoStartWork: true,
      clockType: 'digital',
      showClock: false,
      lowTimeWarningEnabled: true,
    };
    setLocalSettings(defaultSettings);
    toast.success('Timer settings reset to defaults!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="work-duration">Work Duration (min)</Label>
          <Input
            id="work-duration"
            type="number"
            min={1}
            max={60}
            value={localSettings.workDuration}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                workDuration: parseInt(e.target.value) || 25,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="short-break-duration">Short Break (min)</Label>
          <Input
            id="short-break-duration"
            type="number"
            min={1}
            max={30}
            value={localSettings.shortBreakDuration}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                shortBreakDuration: parseInt(e.target.value) || 5,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="long-break-duration">Long Break (min)</Label>
          <Input
            id="long-break-duration"
            type="number"
            min={1}
            max={60}
            value={localSettings.longBreakDuration}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                longBreakDuration: parseInt(e.target.value) || 15,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="long-break-interval">Long Break Interval</Label>
          <Input
            id="long-break-interval"
            type="number"
            min={2}
            max={10}
            value={localSettings.longBreakInterval}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                longBreakInterval: parseInt(e.target.value) || 4,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-start-break"
            checked={localSettings.autoStartBreak}
            onCheckedChange={(checked) =>
              setLocalSettings({ ...localSettings, autoStartBreak: checked })
            }
          />
          <Label htmlFor="auto-start-break">Auto-start breaks</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="auto-start-work"
            checked={localSettings.autoStartWork}
            onCheckedChange={(checked) =>
              setLocalSettings({ ...localSettings, autoStartWork: checked })
            }
          />
          <Label htmlFor="auto-start-work">Auto-start work sessions</Label>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-clock"
          checked={localSettings.showClock}
          onCheckedChange={(checked) =>
            setLocalSettings({ ...localSettings, showClock: checked })
          }
        />
        <Label htmlFor="show-clock">Show Clock</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="low-time-warning"
          checked={localSettings.lowTimeWarningEnabled}
          onCheckedChange={(checked) =>
            setLocalSettings({
              ...localSettings,
              lowTimeWarningEnabled: checked,
            })
          }
        />
        <Label htmlFor="low-time-warning">Low-time warning (under 10s)</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clock-type" className="text-sm font-medium">
          Kiểu đồng hồ
        </Label>
        <Select
          value={localSettings.clockType}
          onValueChange={(
            value: 'digital' | 'analog' | 'progress' | 'flip',
          ) => setLocalSettings({ ...localSettings, clockType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn kiểu đồng hồ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="digital">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Digital
              </div>
            </SelectItem>
            <SelectItem value="analog">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Analog
              </div>
            </SelectItem>
            <SelectItem value="progress">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Progress
              </div>
            </SelectItem>
            <SelectItem value="flip">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Flip
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clock Preview Section - Always show preview */}
      <div className="mt-6 pt-6 border-t">
        <Label className="text-base font-medium mb-4 block">
          Xem trước đồng hồ
        </Label>
        <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border transition-all duration-200">
          <ClockPreview clockType={localSettings.clockType} />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}

// Sound Settings Content Component (without Dialog wrapper)
function SoundSettingsContent({
  settings,
  onSettingsChange,
}: {
  settings: SoundSettingsData;
  onSettingsChange: (settings: SoundSettingsData) => void;
}) {
  const [localSettings, setLocalSettings] =
    useState<SoundSettingsData>(settings);

  // System store bindings
  const { audioSettings, updateAudioSettings, updateSoundSettings } =
    useSystemStore();

  // Ambient audio local state
  const [selectedAmbientSound, setSelectedAmbientSound] = useState<string>(
    audioSettings.selectedAmbientSound,
  );
  const [ambientVolume, setAmbientVolume] = useState<number>(
    audioSettings.volume,
  );
  const [fadeInOut, setFadeInOut] = useState<boolean>(audioSettings.fadeInOut);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  // Playback is managed by a singleton AudioManager; no direct audioRef needed

  // Notification audio (advanced) local state
  const [selectedNotificationSoundLocal, setSelectedNotificationSoundLocal] =
    useState<string>(audioSettings.selectedNotificationSound);
  const [notificationVolume, setNotificationVolume] = useState<number>(
    audioSettings.notificationVolume,
  );

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Sync local audio state with store on initial mount/store change
  useEffect(() => {
    setSelectedAmbientSound(audioSettings.selectedAmbientSound);
    setAmbientVolume(audioSettings.volume);
    setFadeInOut(audioSettings.fadeInOut);
    setSelectedNotificationSoundLocal(audioSettings.selectedNotificationSound);
    setNotificationVolume(audioSettings.notificationVolume);
  }, [audioSettings]);

  // Cleanup: stop any preview when component unmounts
  useEffect(() => {
    return () => {
      audioManager.stop({ fadeOutMs: 150 });
    };
  }, []);

  // All sounds from central catalog grouped
  const alarmSounds = soundCatalog.alarms;
  const tickSounds = soundCatalog.ticks;
  const ambientSounds = soundCatalog.ambient;

  // Preload metadata (duration) for all sound previews
  const [soundDurations, setSoundDurations] = useState<Record<string, number>>(
    {},
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rec: Record<string, number> = {};
      const allSounds = [...alarmSounds, ...tickSounds, ...ambientSounds];
      for (const s of allSounds) {
        const meta = await audioManager.preload(s.url);
        if (cancelled) return;
        rec[s.id] = meta?.duration ?? 0;
      }
      if (!cancelled) setSoundDurations(rec);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  // Play sound preview - only one at a time
  const playSoundPreview = async (
    soundId: string,
    group: 'alarms' | 'ticks' | 'ambient',
  ) => {
    const allSounds = [...alarmSounds, ...tickSounds, ...ambientSounds];
    const sound = allSounds.find((s) => s.id === soundId);
    if (!sound) return;

    // Stop current preview
    await audioManager.stop({ fadeOutMs: 150 });

    // Play new preview
    const isLoop = group === 'ambient' || sound.loopRecommended;
    const volume =
      group === 'ambient' ? ambientVolume / 100 : notificationVolume / 100;
    const ok = await audioManager.play(sound.url, {
      loop: isLoop,
      volume,
      fadeInMs: group === 'ambient' && fadeInOut ? 300 : 0,
    });

    if (ok) {
      setIsPlaying(true);
      setCurrentlyPlaying(sound.id);
      if (group === 'ambient') {
        setSelectedAmbientSound(sound.id);
      } else if (group === 'alarms') {
        setSelectedNotificationSoundLocal(sound.id);
      }
    } else {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    }
  };

  const stopSoundPreview = async () => {
    await audioManager.stop({ fadeOutMs: 150 });
    setIsPlaying(false);
    setCurrentlyPlaying(null);
  };

  // Persist both sound and audio settings
  const saveSettings = () => {
    onSettingsChange(localSettings);
    updateSoundSettings(localSettings);
    updateAudioSettings({
      selectedAmbientSound,
      volume: ambientVolume,
      fadeInOut,
      selectedNotificationSound: selectedNotificationSoundLocal,
      notificationVolume,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'pomodoro-sound-settings',
        JSON.stringify(localSettings),
      );
      localStorage.setItem(
        'pomodoro-audio-settings',
        JSON.stringify({
          selectedAmbientSound,
          volume: ambientVolume,
          fadeInOut,
          selectedNotificationSound: selectedNotificationSoundLocal,
          notificationVolume,
        }),
      );
    }
    toast.success('Audio settings saved successfully!');
  };

  const resetToDefaults = () => {
    const defaultSettings: SoundSettingsData = {
      soundType: 'bell',
      volume: 50,
      isMuted: false,
    };
    setLocalSettings(defaultSettings);
    setSelectedAmbientSound('');
    setAmbientVolume(50);
    setFadeInOut(true);
    setSelectedNotificationSoundLocal('alarm');
    setNotificationVolume(70);
    stopSoundPreview();
    toast.success('Audio settings reset to defaults!');
  };

  // Render sound group component
  const SoundGroup = ({
    title,
    sounds,
    group,
    selectedId,
    onSelect,
  }: {
    title: string;
    sounds: typeof soundCatalog.alarms;
    group: 'alarms' | 'ticks' | 'ambient';
    selectedId: string;
    onSelect: (id: string) => void;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sounds.map((s) => {
          const isActive = currentlyPlaying === s.id && isPlaying;
          const isSelected = selectedId === s.id;
          return (
            <div
              key={s.id}
              className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{s.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {s.vn || s.label}
                  {soundDurations[s.id]
                    ? ` • ${Math.round(soundDurations[s.id])}s`
                    : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <Button
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => {
                    if (isActive) {
                      stopSoundPreview();
                    } else {
                      onSelect(s.id);
                      playSoundPreview(s.id, group);
                    }
                  }}
                  disabled={localSettings.isMuted}
                  aria-label={isActive ? `Dừng ${s.label}` : `Phát ${s.label}`}
                >
                  {isActive ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Global mute */}
      <div className="flex items-center space-x-2">
        <Switch
          id="mute"
          checked={localSettings.isMuted}
          onCheckedChange={(checked) =>
            setLocalSettings({ ...localSettings, isMuted: checked })
          }
        />
        <Label htmlFor="mute">Tắt tất cả âm thanh</Label>
        {localSettings.isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </div>

      {/* Alarm sounds */}
      <SoundGroup
        title="Âm báo (Alarms)"
        sounds={alarmSounds}
        group="alarms"
        selectedId={selectedNotificationSoundLocal}
        onSelect={setSelectedNotificationSoundLocal}
      />

      {/* Tick sounds */}
      <SoundGroup
        title="Âm tick (Ticks)"
        sounds={tickSounds}
        group="ticks"
        selectedId={selectedNotificationSoundLocal}
        onSelect={setSelectedNotificationSoundLocal}
      />

      {/* Ambient sounds with volume and fade controls */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Âm nền (Ambient)</Label>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="fade-toggle"
              className="text-sm text-muted-foreground"
            >
              Fade In/Out
            </Label>
            <Switch
              id="fade-toggle"
              checked={fadeInOut}
              onCheckedChange={setFadeInOut}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ambient-volume">Âm lượng nền: {ambientVolume}%</Label>
          <Slider
            id="ambient-volume"
            min={0}
            max={100}
            step={5}
            value={[ambientVolume]}
            onValueChange={(v) => {
              setAmbientVolume(v[0]);
              audioManager.setVolume(v[0] / 100);
            }}
            className="w-full"
            disabled={localSettings.isMuted}
          />
        </div>

        <SoundGroup
          title=""
          sounds={ambientSounds}
          group="ambient"
          selectedId={selectedAmbientSound}
          onSelect={setSelectedAmbientSound}
        />
      </div>

      {/* Notification volume */}
      <div className="space-y-2 pt-4 border-t">
        <Label htmlFor="notif-vol-adv">
          Âm lượng thông báo: {notificationVolume}%
        </Label>
        <Slider
          id="notif-vol-adv"
          min={0}
          max={100}
          step={5}
          value={[notificationVolume]}
          onValueChange={(v) => setNotificationVolume(v[0])}
          className="w-full"
          disabled={localSettings.isMuted}
        />
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={resetToDefaults}>
          Đặt lại mặc định
        </Button>
        <Button onClick={saveSettings}>Lưu cài đặt</Button>
      </div>
    </div>
  );
}

// Background Settings Content Component (without Dialog wrapper)
function BackgroundSettingsContent() {
  const { background, setBackgroundImage } = useBackground();
  const [localSettings, setLocalSettings] = useState({
    backgroundStyle: 'lofi:auto',
    backgroundOpacity: 100,
  });

  // Initialize local settings from context
  useEffect(() => {
    setLocalSettings({
      backgroundStyle: background.value || 'lofi:auto',
      backgroundOpacity: Math.round(background.opacity * 100),
    });
  }, [background]);

  const saveSettings = () => {
    setBackgroundImage(
      localSettings.backgroundStyle,
      localSettings.backgroundOpacity / 100,
      0,
    );
    toast.success('Background settings saved successfully!');
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      backgroundStyle: 'lofi:auto',
      backgroundOpacity: 100,
    };
    setLocalSettings(defaultSettings);
    setBackgroundImage('lofi:auto', 1, 0);
    toast.success('Background settings reset to defaults!');
  };

  // Presets: keep only image/video options.
  // "Lofi Chill (Auto)" will switch between day/night videos based on light/dark mode.
  const imagePresets: { name: string; value: string; kind: 'image' | 'video' | 'auto' }[] = [
    { name: 'Lofi Chill (Auto)', value: 'lofi:auto', kind: 'auto' },
    { name: 'Day Video', value: '/backgrounds/day.mp4', kind: 'video' },
    { name: 'Night Video', value: '/backgrounds/night.mp4', kind: 'video' },
    { name: 'Unsplash 1', value: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop', kind: 'image' },
    { name: 'Unsplash 2', value: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop', kind: 'image' },
    { name: 'Unsplash 3', value: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1200&auto=format&fit=crop', kind: 'image' },
    { name: 'Unsplash 4', value: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop', kind: 'image' },
    { name: 'Unsplash 5', value: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop', kind: 'image' },
  ];

  return (
    <div className="space-y-6">
      {/* Image/Video Presets */}
      <div className="space-y-2">
        <Label>Background Presets (Image/Video)</Label>
        <div className="grid grid-cols-3 gap-2">
          {imagePresets.map((preset, idx) => {
            const isSelected = localSettings.backgroundStyle === preset.value;
            const isLofi = preset.value === 'lofi:auto';
            const isVideo = preset.kind === 'video';
            return (
              <button
                key={preset.value}
                type="button"
                className={`relative h-20 rounded overflow-hidden border-2 transition-all hover:scale-105 ${
                  isSelected ? 'border-primary' : 'border-border'
                } ${isLofi ? 'bg-muted' : ''}`}
                onClick={() =>
                  setLocalSettings({
                    ...localSettings,
                    backgroundStyle: preset.value,
                  })
                }
                aria-label={`Chọn ${preset.name}`}
                title={preset.name}
              >
                {isLofi ? (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    Lofi Chill (Auto)
                  </div>
                ) : isVideo ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <div className="text-xs font-medium mb-1">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">Video</div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={preset.value}
                    alt={preset.name}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center">
                  {preset.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Image/Video URL */}
      <div className="space-y-2">
        <Label>Custom Image/Video URL</Label>
        <Input
          type="text"
          value={
            localSettings.backgroundStyle !== 'lofi:auto'
              ? localSettings.backgroundStyle
              : ''
          }
          onChange={(e) =>
            setLocalSettings({
              ...localSettings,
              backgroundStyle: e.target.value,
            })
          }
          placeholder="Enter .jpg/.png/.webp/.mp4 URL"
        />
        <div className="text-xs text-muted-foreground">
          Supports static images and MP4 videos. For automatic day/night video, use the preset above.
        </div>
      </div>

      {/* Background Opacity */}
      <div className="space-y-2">
        <Label htmlFor="bg-opacity">
          Background Opacity: {localSettings.backgroundOpacity}%
        </Label>
        <Slider
          id="bg-opacity"
          min={10}
          max={100}
          step={5}
          value={[localSettings.backgroundOpacity]}
          onValueChange={(v) =>
            setLocalSettings({
              ...localSettings,
              backgroundOpacity: v[0],
            })
          }
        />
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}

/**
 * ThemeSettingsContent
 * Presets similar to shadcn/ui themes. Applies CSS variables for light/dark
 * by injecting a single style tag. Persists selection to localStorage.
 */
function ThemeSettingsContent() {
  type ThemeVars = {
    name: string;
    key: string;
    light: Record<string, string>;
    dark: Record<string, string>;
  };

  const themePresets: ThemeVars[] = [
    {
      name: 'Zinc',
      key: 'zinc',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 4%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 4%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 4%',
        primary: '240 5.9% 10%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '240 4.8% 95.9%',
        'accent-foreground': '240 5.9% 10%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '240 5.9% 10%',
        'timer-foreground': '240 5.9% 10%',
      },
      dark: {
        background: '240 10% 3.9%',
        foreground: '0 0% 98%',
        card: '240 10% 3.9%',
        'card-foreground': '0 0% 98%',
        popover: '240 10% 3.9%',
        'popover-foreground': '0 0% 98%',
        primary: '240 5.9% 10%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 3.7% 15.9%',
        'secondary-foreground': '0 0% 98%',
        muted: '240 3.7% 15.9%',
        'muted-foreground': '240 5% 64.9%',
        accent: '240 3.7% 15.9%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 62.8% 30.6%',
        'destructive-foreground': '0 0% 98%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '240 4.9% 83.9%',
        'timer-foreground': '0 0% 98%',
      },
    },
    {
      name: 'Slate',
      key: 'slate',
      light: {
        background: '210 20% 98%',
        foreground: '222 47% 11%',
        card: '0 0% 100%',
        'card-foreground': '222 47% 11%',
        popover: '0 0% 100%',
        'popover-foreground': '222 47% 11%',
        primary: '217 33% 17%',
        'primary-foreground': '210 40% 98%',
        secondary: '210 20% 96%',
        'secondary-foreground': '217 33% 17%',
        muted: '210 20% 96%',
        'muted-foreground': '215 20% 65%',
        accent: '210 20% 96%',
        'accent-foreground': '217 33% 17%',
        destructive: '0 84% 60%',
        'destructive-foreground': '210 40% 98%',
        border: '214 32% 91%',
        input: '214 32% 91%',
        ring: '217 33% 17%',
        'timer-foreground': '217 33% 17%',
      },
      dark: {
        background: '222 47% 11%',
        foreground: '210 40% 98%',
        card: '222 47% 11%',
        'card-foreground': '210 40% 98%',
        popover: '222 47% 11%',
        'popover-foreground': '210 40% 98%',
        primary: '210 40% 98%',
        'primary-foreground': '222 47% 11%',
        secondary: '217 33% 17%',
        'secondary-foreground': '210 40% 98%',
        muted: '217 33% 17%',
        'muted-foreground': '214 20% 70%',
        accent: '217 33% 17%',
        'accent-foreground': '210 40% 98%',
        destructive: '0 62% 30%',
        'destructive-foreground': '210 40% 98%',
        border: '217 33% 17%',
        input: '217 33% 17%',
        ring: '213 27% 84%',
        'timer-foreground': '210 40% 98%',
      },
    },
    {
      name: 'Rose',
      key: 'rose',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 4%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 4%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 4%',
        primary: '346 77% 49%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '346 77% 49%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 84% 60%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '346 77% 49%',
        'timer-foreground': '346 77% 49%',
      },
      dark: {
        background: '240 10% 4%',
        foreground: '0 0% 98%',
        card: '240 10% 4%',
        'card-foreground': '0 0% 98%',
        popover: '240 10% 4%',
        'popover-foreground': '0 0% 98%',
        primary: '346 77% 49%',
        'primary-foreground': '240 10% 4%',
        secondary: '240 3.7% 15.9%',
        'secondary-foreground': '0 0% 98%',
        muted: '240 3.7% 15.9%',
        'muted-foreground': '240 5% 64.9%',
        accent: '346 77% 49%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 62% 30%',
        'destructive-foreground': '0 0% 98%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '346 77% 49%',
        'timer-foreground': '346 84% 65%',
      },
    },
    {
      name: 'Violet',
      key: 'violet',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 4%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 4%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 4%',
        primary: '262 83% 57%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '262 83% 57%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 84% 60%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '262 83% 57%',
        'timer-foreground': '262 83% 57%',
      },
      dark: {
        background: '240 10% 4%',
        foreground: '0 0% 98%',
        card: '240 10% 4%',
        'card-foreground': '0 0% 98%',
        popover: '240 10% 4%',
        'popover-foreground': '0 0% 98%',
        primary: '262 83% 57%',
        'primary-foreground': '240 10% 4%',
        secondary: '240 3.7% 15.9%',
        'secondary-foreground': '0 0% 98%',
        muted: '240 3.7% 15.9%',
        'muted-foreground': '240 5% 64.9%',
        accent: '262 83% 57%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 62% 30%',
        'destructive-foreground': '0 0% 98%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '262 83% 57%',
        'timer-foreground': '262 84% 70%',
      },
    },
    {
      name: 'Emerald',
      key: 'emerald',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 4%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 4%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 4%',
        primary: '142 71% 45%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '142 71% 45%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 84% 60%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '142 71% 45%',
        'timer-foreground': '142 71% 45%',
      },
      dark: {
        background: '240 10% 4%',
        foreground: '0 0% 98%',
        card: '240 10% 4%',
        'card-foreground': '0 0% 98%',
        popover: '240 10% 4%',
        'popover-foreground': '0 0% 98%',
        primary: '142 71% 45%',
        'primary-foreground': '240 10% 4%',
        secondary: '240 3.7% 15.9%',
        'secondary-foreground': '0 0% 98%',
        muted: '240 3.7% 15.9%',
        'muted-foreground': '240 5% 64.9%',
        accent: '142 71% 45%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 62% 30%',
        'destructive-foreground': '0 0% 98%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '142 71% 45%',
        'timer-foreground': '142 76% 60%',
      },
    },
    {
      name: 'Orange',
      key: 'orange',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 4%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 4%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 4%',
        primary: '24 94% 50%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '24 94% 50%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 84% 60%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '24 94% 50%',
        'timer-foreground': '24 94% 50%',
      },
      dark: {
        background: '240 10% 4%',
        foreground: '0 0% 98%',
        card: '240 10% 4%',
        'card-foreground': '0 0% 98%',
        popover: '240 10% 4%',
        'popover-foreground': '0 0% 98%',
        primary: '24 94% 50%',
        'primary-foreground': '240 10% 4%',
        secondary: '240 3.7% 15.9%',
        'secondary-foreground': '0 0% 98%',
        muted: '240 3.7% 15.9%',
        'muted-foreground': '240 5% 64.9%',
        accent: '24 94% 50%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 62% 30%',
        'destructive-foreground': '0 0% 98%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '24 94% 50%',
        'timer-foreground': '24 95% 65%',
      },
    },
  ];

  const styleTagId = 'app-theme-vars';
  const [selectedKey, setSelectedKey] = useState<string>('');

  const injectTheme = (theme: ThemeVars) => {
    const cssBlock = `
:root {
  --background: ${theme.light.background};
  --foreground: ${theme.light.foreground};
  --card: ${theme.light.card};
  --card-foreground: ${theme.light['card-foreground']};
  --popover: ${theme.light.popover};
  --popover-foreground: ${theme.light['popover-foreground']};
  --primary: ${theme.light.primary};
  --primary-foreground: ${theme.light['primary-foreground']};
  --secondary: ${theme.light.secondary};
  --secondary-foreground: ${theme.light['secondary-foreground']};
  --muted: ${theme.light.muted};
  --muted-foreground: ${theme.light['muted-foreground']};
  --accent: ${theme.light.accent};
  --accent-foreground: ${theme.light['accent-foreground']};
  --destructive: ${theme.light.destructive};
  --destructive-foreground: ${theme.light['destructive-foreground']};
  --border: ${theme.light.border};
  --input: ${theme.light.input};
  --ring: ${theme.light.ring};
  --timer-foreground: ${theme.light['timer-foreground']};
}
.dark {
  --background: ${theme.dark.background};
  --foreground: ${theme.dark.foreground};
  --card: ${theme.dark.card};
  --card-foreground: ${theme.dark['card-foreground']};
  --popover: ${theme.dark.popover};
  --popover-foreground: ${theme.dark['popover-foreground']};
  --primary: ${theme.dark.primary};
  --primary-foreground: ${theme.dark['primary-foreground']};
  --secondary: ${theme.dark.secondary};
  --secondary-foreground: ${theme.dark['secondary-foreground']};
  --muted: ${theme.dark.muted};
  --muted-foreground: ${theme.dark['muted-foreground']};
  --accent: ${theme.dark.accent};
  --accent-foreground: ${theme.dark['accent-foreground']};
  --destructive: ${theme.dark.destructive};
  --destructive-foreground: ${theme.dark['destructive-foreground']};
  --border: ${theme.dark.border};
  --input: ${theme.dark.input};
  --ring: ${theme.dark.ring};
  --timer-foreground: ${theme.dark['timer-foreground']};
}
`.trim();

    let styleEl = document.getElementById(
      styleTagId,
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleTagId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = cssBlock;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedKey = localStorage.getItem('ui-theme-key');
    if (savedKey) {
      const theme = themePresets.find((t) => t.key === savedKey);
      if (theme) {
        injectTheme(theme);
        setSelectedKey(savedKey);
      }
    }
  }, []);

  const applyTheme = (key: string) => {
    const theme = themePresets.find((t) => t.key === key);
    if (!theme) return;
    injectTheme(theme);
    localStorage.setItem('ui-theme-key', key);
    setSelectedKey(key);
    toast.success('Theme "' + theme.name + '" applied');
  };

  const resetTheme = () => {
    const styleEl = document.getElementById(styleTagId);
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
    localStorage.removeItem('ui-theme-key');
    setSelectedKey('');
    toast.success('Theme reset to default');
  };

  const { theme: currentTheme } = useTheme();
  const isDark =
    currentTheme === 'dark' ||
    (currentTheme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Chọn theme</Label>
        <Button variant="outline" size="sm" onClick={resetTheme}>
          Đặt lại
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {themePresets.map((t) => {
          const selected = selectedKey === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => applyTheme(t.key)}
              className={`relative p-3 rounded-lg border text-left transition-all duration-150 hover:scale-105 ${
                selected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : 'border-border hover:bg-muted'
              }`}
              title={t.name}
              aria-label={`Chọn theme ${t.name}`}
            >
              {/* Preview với background gradient từ theme */}
              <div
                className="mb-3 h-16 w-full rounded relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, hsl(${t.light.background}) 0%, hsl(${t.dark.background}) 100%)`,
                }}
              >
                {/* Theme name and colors preview */}
                <div className="absolute inset-0 flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <div
                      className="w-6 h-6 rounded-full border-2 shadow-sm"
                      style={{
                        backgroundColor: `hsl(${t.light.primary})`,
                        borderColor: `hsl(${t.light.border})`
                      }}
                      title="Light Primary"
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 shadow-sm"
                      style={{
                        backgroundColor: `hsl(${t.dark.primary})`,
                        borderColor: `hsl(${t.dark.border})`
                      }}
                      title="Dark Primary"
                    />
                  </div>
                  {/* Light/Dark swatches */}
                  <div className="flex gap-1">
                    <div
                      className="flex-1 h-3 rounded border shadow-sm"
                      style={{
                        backgroundColor: `hsl(${t.light.background})`,
                        borderColor: `hsl(${t.light.border})`
                      }}
                      title="Light Background"
                    />
                    <div
                      className="flex-1 h-3 rounded border shadow-sm"
                      style={{
                        backgroundColor: `hsl(${t.dark.background})`,
                        borderColor: `hsl(${t.dark.border})`
                      }}
                      title="Dark Background"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{t.name}</div>
                {selected && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * AppearanceSettingsContent
 * Combines theme mode selection + theme variables + background settings in one tab
 * With preview for themes and backgrounds
 */
function AppearanceSettingsContent() {
  const { setTheme, theme, systemTheme } = useTheme();
  const { background } = useBackground();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Chế độ giao diện</Label>
        <Select
          value={theme || 'system'}
          onValueChange={(v: string) => {
            const newTheme = v as 'light' | 'dark' | 'system';
            setTheme(newTheme);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn chế độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 border-t">
        <ThemeSettingsContent />
      </div>

      <div className="pt-4 border-t">
        <BackgroundSettingsContent />
      </div>
    </div>
  );
}

export function UnifiedSettings({ isOpen, onClose }: UnifiedSettingsProps) {
  const [activeTab, setActiveTab] = useState('timer');

  // Stop any playing preview when settings closes
  useEffect(() => {
    if (!isOpen) {
      audioManager.stop({ fadeOutMs: 150 });
    }
  }, [isOpen]);

  // Get settings from stores
  const { settings: timerStoreSettings } = useTimerStore();
  const { soundSettings: systemStoreSoundSettings } = useSystemStore();

  // Timer settings state
  const [timerSettings, setTimerSettings] = useState<TimerSettingsData>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreak: true,
    autoStartWork: true,
    clockType: 'digital',
    showClock: false,
    lowTimeWarningEnabled: true,
  });

  // Sound settings state
  const [soundSettings, setSoundSettings] = useState<SoundSettingsData>({
    soundType: 'bell',
    volume: 50,
    isMuted: false,
  });

  // Sync timer settings with store
  useEffect(() => {
    setTimerSettings({
      workDuration: timerStoreSettings.workDuration,
      shortBreakDuration: timerStoreSettings.shortBreakDuration,
      longBreakDuration: timerStoreSettings.longBreakDuration,
      longBreakInterval: timerStoreSettings.longBreakInterval,
      autoStartBreak: timerStoreSettings.autoStartBreak,
      autoStartWork: timerStoreSettings.autoStartWork,
      clockType: timerStoreSettings.clockType,
      showClock: timerStoreSettings.showClock,
      lowTimeWarningEnabled: timerStoreSettings.lowTimeWarningEnabled,
    });
  }, [timerStoreSettings]);

  // Sync sound settings with store
  useEffect(() => {
    setSoundSettings({
      soundType: systemStoreSoundSettings.soundType,
      volume: systemStoreSoundSettings.volume,
      isMuted: systemStoreSoundSettings.isMuted,
    });
  }, [systemStoreSoundSettings]);

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load timer settings
      const savedTimerSettings = localStorage.getItem(
        'pomodoro-timer-settings',
      );
      if (savedTimerSettings) {
        try {
          setTimerSettings(JSON.parse(savedTimerSettings));
        } catch (e) {
          console.error('Failed to parse timer settings:', e);
        }
      }

      // Load sound settings
      const savedSoundSettings = localStorage.getItem(
        'pomodoro-sound-settings',
      );
      if (savedSoundSettings) {
        try {
          setSoundSettings(JSON.parse(savedSoundSettings));
        } catch (e) {
          console.error('Failed to parse sound settings:', e);
        }
      }
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt chung
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="appearance"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-muted data-[state=active]:text-primary"
            >
              <Palette className="h-4 w-4" />
              <span>Giao diện</span>
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-muted data-[state=active]:text-primary"
            >
              <Headphones className="h-4 w-4" />
              <span>Âm thanh</span>
            </TabsTrigger>
            <TabsTrigger
              value="timer"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-muted data-[state=active]:text-primary"
            >
              <Timer className="h-4 w-4" />
              <span>Thời gian</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="mt-6">
            <AppearanceSettingsContent />
          </TabsContent>

          <TabsContent value="audio" className="mt-6">
            <SoundSettingsContent
              settings={soundSettings}
              onSettingsChange={setSoundSettings}
            />
          </TabsContent>

          <TabsContent value="timer" className="mt-6">
            <TimerSettingsContent
              settings={timerSettings}
              onSettingsChange={setTimerSettings}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
