"use client"

import { useEffect, useState } from "react"
import { SettingsSection, SettingsRow } from "@/components/settings/settings-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n, LANGS } from "@/contexts/i18n-context"
import { toast } from "sonner"
import { allColorPresets, defaultTheme, type ColorPreset } from '@/config/themes'
import {
    UI_FONTS,
    applyUiFont,
    applyUiFontSize,
    getSavedColorPreset,
    getSavedUiFont,
    getSavedUiFontSize,
    saveColorPreset,
    type UiFontName,
    type UiFontSize,
} from '@/lib/ui-preferences'

function Swatch({ preset }: { preset: ColorPreset }) {
    return <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: preset.swatch }} />
}

export function GeneralSettings() {
    const { lang, setLang, t } = useI18n()
    const [preset, setPreset] = useState<ColorPreset>(defaultTheme)
    const [font, setFont] = useState<UiFontName>(UI_FONTS[0].name)
    const [fontSize, setFontSize] = useState<UiFontSize>('medium')

    useEffect(() => {
        setPreset(getSavedColorPreset())
        setFont(getSavedUiFont())
        setFontSize(getSavedUiFontSize())
    }, [])

    const presetName = (p: ColorPreset) => t(`settings.general.theme.themes.${p.key}`) || p.name

    const handlePresetChange = (key: string) => {
        const next = allColorPresets.find((p) => p.key === key)
        if (!next) return
        saveColorPreset(next)
        setPreset(next)
        toast.success(t('settings.general.theme.themeApplied', { name: presetName(next) }))
    }

    const handleFontChange = (name: string) => {
        const next = name as UiFontName
        applyUiFont(next, true)
        setFont(next)
        toast.success(t('settings.general.theme.fontChanged', { font: next }))
    }

    const handleFontSizeChange = (size: string) => {
        const next = size as UiFontSize
        applyUiFontSize(next, true)
        setFontSize(next)
    }

    return (
        <div className="space-y-8">
            <SettingsSection title={t('settings.general.appearance')}>
                <SettingsRow
                    label={t('settings.general.theme.colorTheme')}
                    description={t('settings.general.theme.colorThemeDescription')}
                >
                    <Select value={preset.key} onValueChange={handlePresetChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('settings.general.theme.selectColorPlaceholder')}>
                                <span className="flex items-center gap-2">
                                    <Swatch preset={preset} />
                                    {presetName(preset)}
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {allColorPresets.map((p) => (
                                <SelectItem key={p.key} value={p.key} className="py-2">
                                    <span className="flex items-center gap-2.5">
                                        <Swatch preset={p} />
                                        <span className="flex flex-col">
                                            <span>{presetName(p)}</span>
                                            <span className="text-xs text-ink-muted">
                                                {t(`settings.general.theme.themeDescriptions.${p.key}`) || p.description}
                                            </span>
                                        </span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </SettingsRow>

                <SettingsRow
                    label={t('settings.general.theme.fontFamily')}
                    description={t('settings.general.theme.fontDescription')}
                >
                    <Select value={font} onValueChange={handleFontChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('settings.general.theme.selectFontPlaceholder')}>{font}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {UI_FONTS.map((f, i) => (
                                <SelectItem key={f.name} value={f.name} style={f.css ? { fontFamily: f.css } : undefined}>
                                    <span className="flex w-full items-center justify-between gap-2">
                                        {f.name}
                                        {i === 0 && (
                                            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[0.6875rem] text-ink-secondary">
                                                {t('settings.general.theme.themes.recommended')}
                                            </span>
                                        )}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </SettingsRow>

                <SettingsRow
                    label={t('settings.general.theme.fontSize')}
                    description={t('settings.general.theme.fontSizeDescription')}
                >
                    <Select value={fontSize} onValueChange={handleFontSizeChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('settings.general.theme.selectFontSizePlaceholder')}>
                                {t(`settings.general.theme.sizes.${fontSize}`)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="small">{t('settings.general.theme.sizes.small')}</SelectItem>
                            <SelectItem value="medium">{t('settings.general.theme.sizes.medium')}</SelectItem>
                            <SelectItem value="large">{t('settings.general.theme.sizes.large')}</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingsRow>
            </SettingsSection>

            <SettingsSection title={t('settings.general.language.sectionTitle')}>
                <SettingsRow
                    label={t('settings.general.language.title')}
                    description={t('settings.general.language.description')}
                >
                    <Select value={lang} onValueChange={(value) => {
                        setLang(value as any)
                        toast.success(t('settings.general.language.updated'))
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('settings.general.language.selectPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGS.map((item) => (
                                <SelectItem key={item.code} value={item.code}>
                                    <span className="flex items-center gap-2">
                                        <span>{item.label}</span>
                                        <span className="text-xs text-ink-muted">({item.code.toUpperCase()})</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </SettingsRow>
            </SettingsSection>
        </div>
    )
}
