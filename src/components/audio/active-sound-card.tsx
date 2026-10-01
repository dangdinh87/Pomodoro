'use client'

import { memo } from 'react'
import { X } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAudioStore } from '@/stores/audio-store'
import type { AmbientSoundState } from '@/stores/audio-store'
import type { SoundItem } from '@/lib/audio/sound-catalog'
import { useTranslation } from '@/contexts/i18n-context'

interface ActiveSoundCardProps {
  soundState: AmbientSoundState
  soundItem: SoundItem
}

export const ActiveSoundCard = memo(function ActiveSoundCard({
  soundState,
  soundItem,
}: ActiveSoundCardProps) {
  const { t } = useTranslation()
  const setSoundVolume = useAudioStore((s) => s.setSoundVolume)
  const stopAmbient = useAudioStore((s) => s.stopAmbient)

  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-raised px-3 py-2">
      {/* Icon */}
      <span className="text-base shrink-0 w-6 text-center" title={t(`audio.sounds.${soundItem.id}`)}>
        {soundItem.icon}
      </span>

      {/* Label */}
      <span className="text-sm font-medium truncate min-w-[60px] max-w-[80px]">
        {t(`audio.sounds.${soundItem.id}`)}
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
      <span className="text-xs text-ink-secondary w-7 text-right tabular-nums">
        {soundState.volume}%
      </span>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-ink-muted hover:text-danger"
        onClick={() => stopAmbient(soundState.id)}
      >
        <X size={14} />
      </Button>
    </div>
  )
})
