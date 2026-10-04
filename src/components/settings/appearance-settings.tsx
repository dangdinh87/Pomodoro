"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Desktop, Moon, Sun } from "@phosphor-icons/react/dist/ssr"
import { SettingsSection, SettingsRow } from "@/components/settings/settings-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/contexts/i18n-context"
import { SavedIndicator } from "@/features/settings/saved-indicator"
import { useSavedFlash } from "@/features/settings/use-saved-flash"
import { allColorPresets, defaultTheme, type ColorPreset } from "@/config/themes"
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
} from "@/lib/ui-preferences"

const THEME_MODES = [
    { value: "light", Icon: Sun },
    { value: "dark", Icon: Moon },
    { value: "system", Icon: Desktop },
] as const

type ThemeMode = (typeof THEME_MODES)[number]["value"]

function Swatch({ preset }: { preset: ColorPreset }) {
    return (
        <span
            aria-hidden
            className="size-3.5 shrink-0 rounded-full border-2 border-outline"
            style={{ backgroundColor: preset.swatch }}
        />
    )
}

/**
 * Settings → Appearance. The panel already shows "Appearance" as its heading, so the cards are
 * named by what they hold (colour, text) instead of repeating it.
 */
export function AppearanceSettings() {
    const { t } = useI18n()
    const { theme, setTheme } = useTheme()
    const [colorSaved, flashColor] = useSavedFlash()
    const [textSaved, flashText] = useSavedFlash()
    const [preset, setPreset] = useState<ColorPreset>(defaultTheme)
    const [font, setFont] = useState<UiFontName>(UI_FONTS[0].name)
    const [fontSize, setFontSize] = useState<UiFontSize>("medium")

    useEffect(() => {
        setPreset(getSavedColorPreset())
        setFont(getSavedUiFont())
        setFontSize(getSavedUiFontSize())
    }, [])

    const mode: ThemeMode = THEME_MODES.some((m) => m.value === theme) ? (theme as ThemeMode) : "light"
    const presetName = (p: ColorPreset) => t(`settings.general.theme.themes.${p.key}`) || p.name

    const handleModeChange = (value: string) => {
        setTheme(value)
        flashColor()
    }

    const handlePresetChange = (key: string) => {
        const next = allColorPresets.find((p) => p.key === key)
        if (!next) return
        saveColorPreset(next)
        setPreset(next)
        flashColor()
    }

    const handleFontChange = (name: string) => {
        const next = name as UiFontName
        applyUiFont(next, true)
        setFont(next)
        flashText()
    }

    const handleFontSizeChange = (size: string) => {
        const next = size as UiFontSize
        applyUiFontSize(next, true)
        setFontSize(next)
        flashText()
    }

    const ModeIcon = THEME_MODES.find((m) => m.value === mode)!.Icon

    return (
        <div className="space-y-8">
            <SettingsSection title={t("settings.general.theme.colorSection")} action={<SavedIndicator show={colorSaved} />}>
                <SettingsRow
                    label={t("settings.general.theme.mode")}
                    description={t("settings.general.theme.modeDescription")}
                >
                    <Select value={mode} onValueChange={handleModeChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={t("settings.general.theme.selectModePlaceholder")}>
                                <span className="flex items-center gap-2">
                                    <ModeIcon size={16} weight="bold" aria-hidden />
                                    {t(`settings.general.theme.${mode}`)}
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {THEME_MODES.map(({ value, Icon }) => (
                                <SelectItem key={value} value={value}>
                                    <span className="flex items-center gap-2">
                                        <Icon size={16} weight="bold" aria-hidden />
                                        {t(`settings.general.theme.${value}`)}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </SettingsRow>

                <SettingsRow
                    label={t("settings.general.theme.colorTheme")}
                    description={t("settings.general.theme.colorThemeDescription")}
                >
                    <Select value={preset.key} onValueChange={handlePresetChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={t("settings.general.theme.selectColorPlaceholder")}>
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
            </SettingsSection>

            <SettingsSection title={t("settings.general.theme.textSection")} action={<SavedIndicator show={textSaved} />}>
                <SettingsRow
                    label={t("settings.general.theme.fontFamily")}
                    description={t("settings.general.theme.fontDescription")}
                >
                    <Select value={font} onValueChange={handleFontChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={t("settings.general.theme.selectFontPlaceholder")}>{font}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {UI_FONTS.map((f, i) => (
                                <SelectItem key={f.name} value={f.name} style={f.css ? { fontFamily: f.css } : undefined}>
                                    <span className="flex w-full items-center justify-between gap-2">
                                        {f.name}
                                        {i === 0 && (
                                            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[0.6875rem] text-ink-secondary">
                                                {t("settings.general.theme.themes.recommended")}
                                            </span>
                                        )}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </SettingsRow>

                <SettingsRow
                    label={t("settings.general.theme.fontSize")}
                    description={t("settings.general.theme.fontSizeDescription")}
                >
                    <Select value={fontSize} onValueChange={handleFontSizeChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={t("settings.general.theme.selectFontSizePlaceholder")}>
                                {t(`settings.general.theme.sizes.${fontSize}`)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="small">{t("settings.general.theme.sizes.small")}</SelectItem>
                            <SelectItem value="medium">{t("settings.general.theme.sizes.medium")}</SelectItem>
                            <SelectItem value="large">{t("settings.general.theme.sizes.large")}</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingsRow>
            </SettingsSection>
        </div>
    )
}
