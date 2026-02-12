'use client'

import { memo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { useAudioStore } from '@/stores/audio-store'
import type { SoundItem } from '@/lib/audio/sound-catalog'
import { useTranslation } from '@/contexts/i18n-context'
import type { SoundCategory } from '@/lib/audio/sound-catalog'

interface SoundListCategoryProps {
    categoryKey: SoundCategory
    sounds: readonly SoundItem[]
    defaultOpen?: boolean
}

export const SoundListCategory = memo(function SoundListCategory({
    categoryKey,
    sounds,
    defaultOpen = true,
}: SoundListCategoryProps) {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(defaultOpen)
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
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    {t(`audio.categories.${categoryKey}`)}
                </span>
                <span className="text-xs text-foreground/60">({sounds.length})</span>
                {activeCount > 0 && (
                    <span className="ml-auto text-xs font-medium text-primary">
                        {activeCount} {t('audio.ambient.active')}
                    </span>
                )}
            </button>

            {/* Sound rows */}
            {isOpen && (
                <div className="space-y-0.5 pb-2">
                    {sounds.map((sound) => {
                        const activeState = getActiveState(sound.id)
                        const isActive = !!activeState
                        const volume = activeState?.volume ?? 0

                        return (
                            <div
                                key={sound.id}
                                className={cn(
                                    'flex items-center gap-2 rounded-lg px-2 py-1 transition-colors',
                                    isActive
                                        ? 'bg-primary/8'
                                        : 'hover:bg-muted/50'
                                )}
                            >
                                {/* Toggle button (icon) */}
                                <button
                                    onClick={() => toggleAmbient(sound.id)}
                                    className={cn(
                                        'text-base shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all',
                                        isActive
                                            ? 'bg-primary/15 scale-105'
                                            : 'opacity-60 hover:opacity-100'
                                    )}
                                >
                                    {sound.icon}
                                </button>

                                {/* Label */}
                                <span
                                    className={cn(
                                        'text-[13px] truncate w-[100px] shrink-0',
                                        isActive ? 'font-medium text-foreground' : 'text-foreground/70'
                                    )}
                                    title={t(`audio.sounds.${sound.id}`)}
                                >
                                    {t(`audio.sounds.${sound.id}`)}
                                </span>

                                {/* Volume slider */}
                                <Slider
                                    value={[volume]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(v) => {
                                        if (!isActive && v[0] > 0) {
                                            // Activate with the dragged volume
                                            playAmbient(sound.id, v[0])
                                        } else if (isActive) {
                                            setSoundVolume(sound.id, v[0])
                                        }
                                    }}
                                    className={cn(
                                        'flex-1 min-w-[60px]',
                                        !isActive && 'opacity-30'
                                    )}
                                />

                                {/* Volume % */}
                                <span
                                    className={cn(
                                        'text-xs w-8 text-right tabular-nums shrink-0',
                                        isActive ? 'text-foreground/90' : 'text-foreground/40'
                                    )}
                                >
                                    {volume}%
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
})
