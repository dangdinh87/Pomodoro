'use client'

import { memo } from 'react'
import { Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAudioStore } from '@/stores/audio-store'
import { soundCategories } from '@/lib/audio/sound-catalog'
import { SoundListCategory } from './sound-list-category'
import { PresetChips } from './preset-chips'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/contexts/i18n-context'

export const AmbientMixer = memo(function AmbientMixer() {
  const { t } = useTranslation()
  const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds)
  const stopAllAmbient = useAudioStore((s) => s.stopAllAmbient)
  const activeSource = useAudioStore((s) => s.audioSettings.activeSource)
  const isYouTubeActive = activeSource === 'youtube'

  const activeCount = activeAmbientSounds.filter(s => s.volume > 0).length

  return (
    <div className="flex flex-col h-full min-h-0 pb-3">
      {/* Fixed header - no scroll */}
      <div className="shrink-0 space-y-3">
        {/* Preset chips */}
        <section>
          <PresetChips />
        </section>

        {/* YouTube active banner */}
        {isYouTubeActive && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs">
            <Youtube className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-foreground">{t('audio.ambient.pausedAlert.title')}</p>
              <p className="text-muted-foreground">
                {t('audio.ambient.pausedAlert.description')}
              </p>
            </div>
          </div>
        )}

        {/* All Sounds header + Stop All */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
            {t('audio.ambient.title')}
            {activeCount > 0 && (
              <span className="ml-1.5 text-xs font-normal text-primary">
                ({activeCount} {t('audio.ambient.playing')})
              </span>
            )}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => stopAllAmbient()}
            className={cn(
              'h-7 px-2 text-xs text-muted-foreground hover:text-destructive',
              activeCount === 0 && 'invisible'
            )}
          >
            {t('audio.ambient.stopAll')}
          </Button>
        </div>
      </div>

      {/* Scrollable: All sounds by category */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden -mx-1 px-1 custom-scrollbar mt-1">
        <div className={cn('space-y-0.5 pb-2', isYouTubeActive && 'opacity-50 pointer-events-none')}>
          {soundCategories.map((cat) => (
            <SoundListCategory
              key={cat.key}
              categoryKey={cat.key}
              sounds={cat.sounds}
              defaultOpen={true}
            />
          ))}
        </div>
      </div>
    </div>
  )
})
