'use client'

import { memo } from 'react'
import { Music } from 'lucide-react'
import { useAudioStore } from '@/stores/audio-store'
import { soundCategories, findSound } from '@/lib/audio/sound-catalog'
import { ActiveSoundCard } from './active-sound-card'
import { SoundIconGrid } from './sound-icon-grid'
import { PresetChips } from './preset-chips'
import { TooltipProvider } from '@/components/ui/tooltip'

export const AmbientMixer = memo(function AmbientMixer() {
  const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds)

  return (
    <div className="flex flex-col gap-4 py-3">
      {/* Preset chips */}
      <section>
        <PresetChips />
      </section>

      {/* Now Playing section */}
      {activeAmbientSounds.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Now Playing ({activeAmbientSounds.length})
          </h3>
          <div className="space-y-1.5">
            {activeAmbientSounds.map((soundState) => {
              const item = findSound(soundState.id)
              if (!item) return null
              return (
                <ActiveSoundCard
                  key={soundState.id}
                  soundState={soundState}
                  soundItem={item}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {activeAmbientSounds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Music className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No sounds playing</p>
          <p className="text-xs opacity-60">Tap an icon below to start</p>
        </div>
      )}

      {/* All Sounds section */}
      <section>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          All Sounds
        </h3>
        <TooltipProvider delayDuration={300}>
          <div className="space-y-1">
            {soundCategories.map((cat) => (
              <SoundIconGrid
                key={cat.key}
                categoryLabel={cat.label}
                sounds={cat.sounds}
                defaultOpen={true}
              />
            ))}
          </div>
        </TooltipProvider>
      </section>
    </div>
  )
})
