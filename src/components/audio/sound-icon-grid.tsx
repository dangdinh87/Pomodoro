'use client'

import { memo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
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
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform',
            !isOpen && '-rotate-90'
          )}
        />
        <span className="text-sm font-medium text-foreground uppercase tracking-wider">
          {categoryLabel}
        </span>
        <span className="text-xs text-foreground/80">({sounds.length})</span>
        {activeCount > 0 && (
          <span className="ml-auto text-xs font-medium text-primary">
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
                        ? 'border-primary bg-primary/15 shadow-sm scale-105'
                        : 'border-border/40 bg-background/50 hover:border-border hover:bg-muted/50'
                    )}
                  >
                    {sound.icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-sm">
                  {sound.label}
                  {sound.vn && <span className="text-foreground/90 ml-1">({sound.vn})</span>}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      )}
    </div>
  )
})
