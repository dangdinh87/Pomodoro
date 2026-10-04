'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { IconTile, type IconTileTone } from '@/components/ui/icon-tile'
import { useAudioStore } from '@/stores/audio-store'
import type { SoundItem } from '@/lib/audio/sound-catalog'
import { useTranslation } from '@/contexts/i18n-context'
import { getSoundIcon } from './sound-icons'
import type { SoundCategory } from '@/lib/audio/sound-catalog'

// Candy colour per category: pure identity, never state (an active row is also shown by the
// filled icon, the 40% readout and the slider range, so colour is not the only cue).
const CATEGORY_TONE: Record<SoundCategory, IconTileTone> = {
    nature: 'mint',
    rain: 'sky',
    noise: 'lilac',
    study: 'butter',
    cozy: 'peach',
    transport: 'tomato',
    city: 'sky',
    machine: 'lilac',
}

interface SoundListCategoryProps {
    categoryKey: SoundCategory
    sounds: readonly SoundItem[]
}

export const SoundListCategory = memo(function SoundListCategory({
    categoryKey,
    sounds,
}: SoundListCategoryProps) {
    const { t } = useTranslation()
    const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds)
    const toggleAmbient = useAudioStore((s) => s.toggleAmbient)
    const setSoundVolume = useAudioStore((s) => s.setSoundVolume)
    const playAmbient = useAudioStore((s) => s.playAmbient)

    const getActiveState = (id: string) =>
        activeAmbientSounds.find((s) => s.id === id)
    const activeCount = sounds.filter((s) => {
        const state = getActiveState(s.id)
        return state && state.volume > 0
    }).length
    const tone = CATEGORY_TONE[categoryKey]

    return (
        <section aria-label={t(`audio.categories.${categoryKey}`)}>
            <div className="flex items-center justify-between gap-2 pb-2">
                <h4 className="font-heading text-[0.9375rem] font-bold text-ink">
                    {t(`audio.categories.${categoryKey}`)}
                </h4>
                {activeCount > 0 && (
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-ink">
                        {activeCount} {t('audio.ambient.active')}
                    </span>
                )}
            </div>

            <ul className="sticker-sm divide-y-2 divide-border overflow-hidden">
                {sounds.map((sound) => {
                    const activeState = getActiveState(sound.id)
                    const isActive = !!activeState
                    const volume = activeState?.volume ?? 0
                    const label = t(`audio.sounds.${sound.id}`)
                    const SoundIcon = getSoundIcon(sound.id)

                    return (
                        <li
                            key={sound.id}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 transition-colors',
                                isActive && 'bg-surface-raised'
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => toggleAmbient(sound.id)}
                                aria-pressed={isActive}
                                aria-label={label}
                                className="focus-ring shrink-0 rounded-[12px] transition-transform duration-100 hover:-translate-y-px active:translate-y-px"
                            >
                                <IconTile
                                    icon={SoundIcon}
                                    tone={isActive ? tone : 'surface'}
                                    weight={isActive ? 'fill' : 'bold'}
                                    className={cn(isActive && 'shadow-sticker-sm')}
                                />
                            </button>

                            <span
                                className={cn(
                                    'line-clamp-2 w-24 shrink-0 break-words text-[0.875rem] leading-tight sm:w-28',
                                    isActive ? 'font-bold text-ink' : 'font-semibold text-ink-secondary'
                                )}
                                title={label}
                            >
                                {label}
                            </span>

                            <Slider
                                value={[volume]}
                                min={0}
                                max={100}
                                step={1}
                                aria-label={label}
                                aria-valuetext={
                                    isActive
                                        ? t('audio.ambient.valueText', { name: label, value: volume })
                                        : t('audio.ambient.valueTextOff', { name: label })
                                }
                                onValueChange={(v) => {
                                    if (!isActive && v[0] > 0) {
                                        playAmbient(sound.id, v[0])
                                    } else if (isActive) {
                                        setSoundVolume(sound.id, v[0])
                                    }
                                }}
                                className={cn('min-w-[60px] flex-1', !isActive && 'opacity-60')}
                            />

                            <span
                                aria-hidden="true"
                                className={cn('w-9 shrink-0 text-right text-xs tabular-nums', isActive ? 'font-bold text-ink' : 'font-semibold text-ink-muted')}
                            >
                                {isActive ? `${volume}%` : t('timerUi.soundOff')}
                            </span>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
})
