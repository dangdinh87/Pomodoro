'use client'

import { memo } from 'react'
import { Bell, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAudioStore } from '@/stores/audio-store'
import { alarmSounds } from '@/lib/audio/sound-catalog'

export const AlarmSettings = memo(function AlarmSettings() {
  const alarmType = useAudioStore((s) => s.audioSettings.alarmType)
  const alarmVolume = useAudioStore((s) => s.audioSettings.alarmVolume)
  const updateSettings = useAudioStore((s) => s.updateAudioSettings)

  const previewAlarm = () => {
    const alarm = alarmSounds.find((a) => a.id === alarmType)
    if (alarm) {
      const audio = new Audio(alarm.url)
      audio.volume = alarmVolume / 100
      audio.play().catch(() => {})
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select
        value={alarmType}
        onValueChange={(v) => updateSettings({ alarmType: v })}
      >
        <SelectTrigger className="h-8 w-24 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {alarmSounds.map((alarm) => (
            <SelectItem key={alarm.id} value={alarm.id}>
              {alarm.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Slider
        value={[alarmVolume]}
        min={0}
        max={100}
        step={1}
        onValueChange={([v]) => updateSettings({ alarmVolume: v })}
        className="flex-1"
      />
      <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
        {alarmVolume}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={previewAlarm}
        title="Preview alarm"
      >
        <Play className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
})
