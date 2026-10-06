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

  // One scrolling column: presets and saved mixes on top, then the sounds. The title row and the
  // category chips stay pinned while the list moves. The 6px side padding keeps the hard shadows
  // of the cards inside the scroll box.
  return (
    <div className="-mx-1.5 h-full min-h-0 overflow-x-hidden overflow-y-auto px-1.5 pb-3 custom-scrollbar">
      <div className="space-y-4 pb-1 pt-1">
        <PresetChips />

        {/* YouTube active banner */}
        {isYouTubeActive && (
          <div className="sticker-sm flex items-start gap-2 bg-info-bg px-3 py-2.5 text-xs text-info-ink">
            <YoutubeLogo size={18} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <p className="font-bold">{t('audio.ambient.pausedAlert.title')}</p>
              <p>{t('audio.ambient.pausedAlert.description')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="sticky top-0 z-10 -mx-1.5 space-y-3 bg-surface px-1.5 pb-3 pt-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <h3 className="font-heading text-[1.0625rem] font-bold text-ink">
            {t('audio.ambient.title')}
            {activeCount > 0 && (
              <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 align-middle text-xs font-bold text-brand-ink">
                {activeCount} {t('audio.ambient.playing')}
              </span>
            )}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => stopAllAmbient()}
            className={cn('text-ink-secondary', activeCount === 0 && 'invisible')}
          >
            {t('audio.ambient.stopAll')}
          </Button>
        </div>

        <FilterChipGroup label={t('audio.ambient.title')}>
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

      {/* All sounds by category */}
      <div className={cn('space-y-5 pb-2 pt-1', isYouTubeActive && 'opacity-50 pointer-events-none')}>
        {soundCategories
          .filter((cat) => category === 'all' || cat.key === category)
          .map((cat) => (
            <SoundListCategory key={cat.key} categoryKey={cat.key} sounds={cat.sounds} />
          ))}
      </div>
    </div>
  )
})
