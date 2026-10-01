'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { useAudioStore } from '@/stores/audio-store'
import type { SoundItem } from '@/lib/audio/sound-catalog'
import { useTranslation } from '@/contexts/i18n-context'
import { getSoundIcon } from './sound-icons'
import type { SoundCategory } from '@/lib/audio/sound-catalog'

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

    return (
        <section aria-label={t(`audio.categories.${categoryKey}`)}>
            <div className="flex items-baseline justify-between pb-2">
                <h4 className="text-[0.8125rem] font-semibold text-ink">
                    {t(`audio.categories.${categoryKey}`)}
                </h4>
                {activeCount > 0 && (
                    <span className="text-xs font-medium text-brand">
                        {activeCount} {t('audio.ambient.active')}
                    </span>
                )}
            </div>

            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
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
                                'flex items-center gap-3 px-3 py-2 transition-colors',
                                isActive && 'bg-surface-raised'
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => toggleAmbient(sound.id)}
                                aria-pressed={isActive}
                                aria-label={label}
                                className={cn(
                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-raised transition-colors hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand',
                                    isActive ? 'text-brand' : 'text-ink-secondary'
                                )}
                            >
                                <SoundIcon size={18} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                            </button>

                            <span
                                className={cn(
                                    'w-[96px] shrink-0 truncate text-[0.8125rem]',
                                    isActive ? 'font-medium text-ink' : 'text-ink-secondary'
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
                                onValueChange={(v) => {
                                    if (!isActive && v[0] > 0) {
                                        playAmbient(sound.id, v[0])
                                    } else if (isActive) {
                                        setSoundVolume(sound.id, v[0])
                                    }
                                }}
                                className={cn(
                                    'min-w-[60px] flex-1',
                                    !isActive && 'opacity-50 **:[[role=slider]]:border-border-strong **:[[role=slider]]:bg-surface-raised'
                                )}
                            />

                            <span className={cn('w-8 shrink-0 text-right text-xs tabular-nums', isActive ? 'text-ink-secondary' : 'text-ink-faint')}>
                                {isActive ? `${volume}%` : t('timerUi.soundOff')}
                            </span>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
})
