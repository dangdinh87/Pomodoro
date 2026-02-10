'use client'

import { memo } from 'react'
import { Music, Youtube } from 'lucide-react'
import { useAudioStore } from '@/stores/audio-store'
import { soundCategories, findSound } from '@/lib/audio/sound-catalog'
import { ActiveSoundCard } from './active-sound-card'
import { SoundIconGrid } from './sound-icon-grid'
import { PresetChips } from './preset-chips'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export const AmbientMixer = memo(function AmbientMixer() {
  const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds)
  const activeSource = useAudioStore((s) => s.audioSettings.activeSource)
  const isYouTubeActive = activeSource === 'youtube'

  return (
    <div className="flex flex-col gap-4 py-3">
      {/* Preset chips */}
      <section>
        <PresetChips />
      </section>

      {/* YouTube active banner */}
      {isYouTubeActive && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs">
          <Youtube className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-foreground">Ambient sounds paused</p>
            <p className="text-muted-foreground">
              Your ambient mix is paused while YouTube is playing. Switch back to the Ambient tab to resume.
            </p>
          </div>
        </div>
      )}

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
      <section className={cn(isYouTubeActive && 'opacity-50 pointer-events-none')}>
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
