'use client'

import { memo, useState } from 'react'
import { CaretDown } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils'
import { useAudioStore } from '@/stores/audio-store'
import type { SoundItem } from '@/lib/audio/sound-catalog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SoundIconGridProps {
  categoryLabel: string
  sounds: readonly SoundItem[]
  defaultOpen?: boolean
}

export const SoundIconGrid = memo(function SoundIconGrid({
  categoryLabel,
  sounds,
  defaultOpen = true,
}: SoundIconGridProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds)
  const toggleAmbient = useAudioStore((s) => s.toggleAmbient)

  const isActive = (id: string) => activeAmbientSounds.some((s) => s.id === id)
  const activeCount = sounds.filter((s) => isActive(s.id)).length

  return (
    <div>
      {/* Category header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 w-full py-1.5 text-left group"
      >
        <CaretDown
          className={cn(
            'h-3.5 w-3.5 text-ink-muted transition-transform',
            !isOpen && '-rotate-90'
          )}
        />
        <span className="text-sm font-medium text-ink uppercase tracking-wider">
          {categoryLabel}
        </span>
        <span className="text-xs text-ink-secondary">({sounds.length})</span>
        {activeCount > 0 && (
          <span className="ml-auto text-xs font-medium text-brand">
            {activeCount} active
          </span>
        )}
      </button>

      {/* Icon grid */}
      {isOpen && (
        <div className="grid grid-cols-5 gap-2 pb-3">
          {sounds.map((sound) => {
            const active = isActive(sound.id)
            return (
              <Tooltip key={sound.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toggleAmbient(sound.id)}
                    className={cn(
                      'h-10 w-full rounded-lg border text-lg transition-all flex items-center justify-center',
                      active
                        ? 'border-brand bg-brand-soft'
                        : 'border-border bg-surface hover:bg-surface-hover'
                    )}
                  >
                    {sound.icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-sm">
                  {sound.label}
                  {sound.vn && <span className="text-ink-secondary ml-1">({sound.vn})</span>}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      )}
    </div>
  )
})
