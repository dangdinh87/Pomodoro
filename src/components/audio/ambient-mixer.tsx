'use client'

import { memo, useState } from 'react'
import { YoutubeLogo } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button'
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip'
import { useAudioStore } from '@/stores/audio-store'
import { soundCategories, type SoundCategory } from '@/lib/audio/sound-catalog'
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
  const [category, setCategory] = useState<'all' | SoundCategory>('all')

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
          <div className="flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs">
            <YoutubeLogo size={16} className="text-danger shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-ink">{t('audio.ambient.pausedAlert.title')}</p>
              <p className="text-ink-muted">
                {t('audio.ambient.pausedAlert.description')}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 px-1">
          <h3 className="text-[0.9375rem] font-bold text-ink font-heading">
            {t('audio.ambient.title')}
            {activeCount > 0 && (
              <span className="ml-2 text-xs font-normal text-brand">
                {activeCount} {t('audio.ambient.playing')}
              </span>
            )}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => stopAllAmbient()}
            className={cn(
              'h-7 px-2 text-xs text-ink-muted hover:text-danger',
              activeCount === 0 && 'invisible'
            )}
          >
            {t('audio.ambient.stopAll')}
          </Button>
        </div>

        <FilterChipGroup label={t('audio.ambient.title')} className="-mx-1 px-1">
          <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
            {t('timerUi.filterAll')}
          </FilterChip>
          {soundCategories.map((cat) => (
            <FilterChip key={cat.key} active={category === cat.key} onClick={() => setCategory(cat.key)}>
              {t(`audio.categories.${cat.key}`)}
            </FilterChip>
          ))}
        </FilterChipGroup>
      </div>

      {/* Scrollable: All sounds by category */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden -mx-1 px-1 custom-scrollbar mt-4">
        <div className={cn('space-y-5 pb-2', isYouTubeActive && 'opacity-50 pointer-events-none')}>
          {soundCategories
            .filter((cat) => category === 'all' || cat.key === category)
            .map((cat) => (
              <SoundListCategory key={cat.key} categoryKey={cat.key} sounds={cat.sounds} />
            ))}
        </div>
      </div>
    </div>
  )
})
