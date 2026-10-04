"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Check } from "@phosphor-icons/react/dist/ssr"
import type { ColorPreset } from "@/config/themes"

interface ColorPresetPickerProps {
    presets: ColorPreset[]
    /** Key of the active preset. */
    value: string
    onChange: (key: string) => void
    /** Accessible name of the group. */
    label: string
    /** Localised preset name (also the swatch's accessible name). */
    nameOf: (preset: ColorPreset) => string
    /** Localised one-line description of the active preset, shown under the swatches. */
    descriptionOf?: (preset: ColorPreset) => string
}

/**
 * Colour sets as outlined swatches; the active one wears a check and an ink ring.
 * A radio group underneath, so it is one tab stop and arrow keys move the choice.
 */
export function ColorPresetPicker({ presets, value, onChange, label, nameOf, descriptionOf }: ColorPresetPickerProps) {
    const active = presets.find((p) => p.key === value)
    return (
        <div>
            <RadioGroupPrimitive.Root
                value={value}
                onValueChange={onChange}
                aria-label={label}
                className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-6"
            >
                {presets.map((preset) => (
                    <RadioGroupPrimitive.Item
                        key={preset.key}
                        value={preset.key}
                        aria-label={nameOf(preset)}
                        className="group focus-ring flex flex-col items-center gap-1.5 rounded-xl p-1 focus-visible:outline-offset-0"
                    >
                        <span
                            aria-hidden
                            data-swatch={preset.key}
                            style={{ backgroundColor: preset.swatch }}
                            className="flex size-12 items-center justify-center rounded-full border-sticker shadow-sticker-sm outline-offset-2 transition-transform duration-100 group-hover:-translate-x-px group-hover:-translate-y-px group-data-[state=checked]:outline-[3px] group-data-[state=checked]:outline-ink"
                        >
                            <RadioGroupPrimitive.Indicator asChild>
                                <Check size={22} weight="bold" className="text-on-accent" />
                            </RadioGroupPrimitive.Indicator>
                        </span>
                        <span aria-hidden className="text-xs font-bold text-ink-secondary group-data-[state=checked]:text-ink">
                            {nameOf(preset)}
                        </span>
                    </RadioGroupPrimitive.Item>
                ))}
            </RadioGroupPrimitive.Root>
            {active && descriptionOf && (
                <p aria-live="polite" className="mt-3 text-[0.8125rem] text-ink-muted">
                    {descriptionOf(active)}
                </p>
            )}
        </div>
    )
}
