'use client'

import { memo } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAudioStore } from '@/stores/audio-store'
import type { AmbientSoundState } from '@/stores/audio-store'
import type { SoundItem } from '@/lib/audio/sound-catalog'

interface ActiveSoundCardProps {
  soundState: AmbientSoundState
  soundItem: SoundItem
}

export const ActiveSoundCard = memo(function ActiveSoundCard({
  soundState,
  soundItem,
}: ActiveSoundCardProps) {
  const setSoundVolume = useAudioStore((s) => s.setSoundVolume)
  const stopAmbient = useAudioStore((s) => s.stopAmbient)

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
      {/* Icon */}
      <span className="text-base shrink-0 w-6 text-center" title={soundItem.label}>
        {soundItem.icon}
      </span>

      {/* Label */}
      <span className="text-xs font-medium truncate min-w-[60px] max-w-[80px]">
        {soundItem.label}
      </span>

      {/* Volume slider */}
      <Slider
        value={[soundState.volume]}
        min={0}
        max={100}
        step={1}
        onValueChange={(v) => setSoundVolume(soundState.id, v[0])}
        className="flex-1 min-w-[60px]"
      />

      {/* Volume % */}
      <span className="text-[10px] text-muted-foreground w-7 text-right tabular-nums">
        {soundState.volume}%
      </span>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => stopAmbient(soundState.id)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
})
