"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Check, Moon, Sun, Laptop, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useI18n, LANGS } from "@/contexts/i18n-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { defaultTheme, themePresets, type ThemeVars } from '@/config/themes'

const FONTS = [
    { name: 'Inter', value: 'var(--font-inter)', class: 'font-sans' },
    { name: 'Be Vietnam Pro', value: 'var(--font-be-vietnam-pro)', class: 'font-be-vietnam' },
    { name: 'Space Grotesk', value: 'var(--font-space-grotesk)', class: 'font-space-grotesk' },
]

export function GeneralSettings() {
    const { theme, setTheme } = useTheme()
    const { lang, setLang, t } = useI18n()
    const [selectedThemeKey, setSelectedThemeKey] = useState<string>('default')
    const [selectedFont, setSelectedFont] = useState<string>('Nunito')
    const [fontSize, setFontSize] = useState<string>('medium')

    // Theme Injection Logic
    const styleTagId = 'app-theme-vars'
    const injectTheme = (themeData: ThemeVars) => {
        const optionalLight = [
            themeData.light.radius ? `  --radius: ${themeData.light.radius};` : '',
            themeData.light['chart-1'] ? `  --chart-1: ${themeData.light['chart-1']};` : '',
            themeData.light['chart-2'] ? `  --chart-2: ${themeData.light['chart-2']};` : '',
            themeData.light['chart-3'] ? `  --chart-3: ${themeData.light['chart-3']};` : '',
            themeData.light['chart-4'] ? `  --chart-4: ${themeData.light['chart-4']};` : '',
            themeData.light['chart-5'] ? `  --chart-5: ${themeData.light['chart-5']};` : '',
        ].filter(Boolean).join('\n')

        const optionalDark = [
            themeData.dark.radius ? `  --radius: ${themeData.dark.radius};` : '',
            themeData.dark['chart-1'] ? `  --chart-1: ${themeData.dark['chart-1']};` : '',
            themeData.dark['chart-2'] ? `  --chart-2: ${themeData.dark['chart-2']};` : '',
            themeData.dark['chart-3'] ? `  --chart-3: ${themeData.dark['chart-3']};` : '',
            themeData.dark['chart-4'] ? `  --chart-4: ${themeData.dark['chart-4']};` : '',
            themeData.dark['chart-5'] ? `  --chart-5: ${themeData.dark['chart-5']};` : '',
        ].filter(Boolean).join('\n')

        const cssBlock = `
:root {
  --background: ${themeData.light.background};
  --foreground: ${themeData.light.foreground};
  --card: ${themeData.light.card};
  --card-foreground: ${themeData.light['card-foreground']};
  --popover: ${themeData.light.popover};
  --popover-foreground: ${themeData.light['popover-foreground']};
  --primary: ${themeData.light.primary};
  --primary-foreground: ${themeData.light['primary-foreground']};
  --secondary: ${themeData.light.secondary};
  --secondary-foreground: ${themeData.light['secondary-foreground']};
  --muted: ${themeData.light.muted};
  --muted-foreground: ${themeData.light['muted-foreground']};
  --accent: ${themeData.light.accent};
  --accent-foreground: ${themeData.light['accent-foreground']};
  --destructive: ${themeData.light.destructive};
  --destructive-foreground: ${themeData.light['destructive-foreground']};
  --border: ${themeData.light.border};
  --input: ${themeData.light.input};
  --ring: ${themeData.light.ring};
  --timer-foreground: ${themeData.light['timer-foreground']};
  --sidebar-background: ${themeData.light['sidebar-background'] || themeData.light.background};
  --sidebar-foreground: ${themeData.light['sidebar-foreground'] || themeData.light.foreground};
  --sidebar-primary: ${themeData.light['sidebar-primary'] || themeData.light.primary};
  --sidebar-primary-foreground: ${themeData.light['sidebar-primary-foreground'] || themeData.light['primary-foreground']};
  --sidebar-accent: ${themeData.light['sidebar-accent'] || themeData.light.accent};
  --sidebar-accent-foreground: ${themeData.light['sidebar-accent-foreground'] || themeData.light['accent-foreground']};
  --sidebar-border: ${themeData.light['sidebar-border'] || themeData.light.border};
  --sidebar-ring: ${themeData.light['sidebar-ring'] || themeData.light.ring};
${optionalLight}
}
.dark {
  --background: ${themeData.dark.background};
  --foreground: ${themeData.dark.foreground};
  --card: ${themeData.dark.card};
  --card-foreground: ${themeData.dark['card-foreground']};
  --popover: ${themeData.dark.popover};
  --popover-foreground: ${themeData.dark['popover-foreground']};
  --primary: ${themeData.dark.primary};
  --primary-foreground: ${themeData.dark['primary-foreground']};
  --secondary: ${themeData.dark.secondary};
  --secondary-foreground: ${themeData.dark['secondary-foreground']};
  --muted: ${themeData.dark.muted};
  --muted-foreground: ${themeData.dark['muted-foreground']};
  --accent: ${themeData.dark.accent};
  --accent-foreground: ${themeData.dark['accent-foreground']};
  --destructive: ${themeData.dark.destructive};
  --destructive-foreground: ${themeData.dark['destructive-foreground']};
  --border: ${themeData.dark.border};
  --input: ${themeData.dark.input};
  --ring: ${themeData.dark.ring};
  --timer-foreground: ${themeData.dark['timer-foreground']};
  --sidebar-background: ${themeData.dark['sidebar-background'] || themeData.dark.background};
  --sidebar-foreground: ${themeData.dark['sidebar-foreground'] || themeData.dark.foreground};
  --sidebar-primary: ${themeData.dark['sidebar-primary'] || themeData.dark.primary};
  --sidebar-primary-foreground: ${themeData.dark['sidebar-primary-foreground'] || themeData.dark['primary-foreground']};
  --sidebar-accent: ${themeData.dark['sidebar-accent'] || themeData.dark.accent};
  --sidebar-accent-foreground: ${themeData.dark['sidebar-accent-foreground'] || themeData.dark['accent-foreground']};
  --sidebar-border: ${themeData.dark['sidebar-border'] || themeData.dark.border};
  --sidebar-ring: ${themeData.dark['sidebar-ring'] || themeData.dark.ring};
${optionalDark}
}
`.trim()

        let styleEl = document.getElementById(styleTagId) as HTMLStyleElement | null
        if (!styleEl) {
            styleEl = document.createElement('style')
            styleEl.id = styleTagId
            document.head.appendChild(styleEl)
        }
        styleEl.textContent = cssBlock
    }

    useEffect(() => {
        if (typeof window === 'undefined') return
        const savedKey = localStorage.getItem('ui-theme-key')
        if (savedKey && savedKey !== 'default') {
            const t = themePresets.find((t) => t.key === savedKey)
            if (t) {
                injectTheme(t)
                setSelectedThemeKey(savedKey)
            }
        } else {
            setSelectedThemeKey('default')
        }

        const savedFont = localStorage.getItem('ui-font')
        if (savedFont) {
            setSelectedFont(savedFont)
            if (savedFont === 'Inter') {
                document.body.style.fontFamily = ''
            } else if (savedFont === 'Space Grotesk') {
                document.body.style.fontFamily = 'var(--font-space-grotesk)'
            } else if (savedFont === 'System UI') {
                document.body.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            } else if (savedFont === 'Nunito') {
                document.body.style.fontFamily = 'var(--font-nunito)'
            } else {
                document.body.style.fontFamily = ''
            }
        } else {
            // Default to Nunito if no saved font preference
            setSelectedFont('Nunito')
            document.body.style.fontFamily = 'var(--font-nunito)'
        }

        const savedFontSize = localStorage.getItem('ui-font-size')
        if (savedFontSize) {
            setFontSize(savedFontSize)
            if (savedFontSize === 'small') {
                document.documentElement.style.fontSize = '14px'
            } else if (savedFontSize === 'large') {
                document.documentElement.style.fontSize = '18px'
            } else {
                document.documentElement.style.fontSize = '16px'
            }
        }
    }, [])

    const applyTheme = (key: string) => {
        if (key === 'default') {
            const styleEl = document.getElementById(styleTagId)
            if (styleEl && styleEl.parentNode) {
                styleEl.parentNode.removeChild(styleEl)
            }
            localStorage.removeItem('ui-theme-key')
            setSelectedThemeKey('default')
            toast.success(t('settings.general.theme.themeApplied', { name: t('settings.general.theme.themes.default') }))
            return
        }
        const themeData = themePresets.find((theme) => theme.key === key)
        if (!themeData) return
        injectTheme(themeData)
        localStorage.setItem('ui-theme-key', key)
        setSelectedThemeKey(key)
        toast.success(t('settings.general.theme.themeApplied', { name: t(`settings.general.theme.themes.${key}`) || themeData.name }))
    }

    const handleFontChange = (fontName: string) => {
        setSelectedFont(fontName)
        localStorage.setItem('ui-font', fontName)

        // Apply font to body
        if (fontName === 'Inter') {
            document.body.style.fontFamily = ''
        } else if (fontName === 'Space Grotesk') {
            document.body.style.fontFamily = 'var(--font-space-grotesk)'
        } else if (fontName === 'System UI') {
            document.body.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        } else if (fontName === 'Nunito') {
            document.body.style.fontFamily = 'var(--font-nunito)'
        }
        toast.success(t('settings.general.theme.fontChanged', { font: fontName }))
    }

    const handleFontSizeChange = (size: string) => {
        setFontSize(size)
        localStorage.setItem('ui-font-size', size)

        if (size === 'small') {
            document.documentElement.style.fontSize = '14px'
        } else if (size === 'large') {
            document.documentElement.style.fontSize = '18px'
        } else {
            document.documentElement.style.fontSize = '16px'
        }
    }

    return (
        <div className="space-y-8">
            {/* Appearance Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('settings.general.appearance')}</h2>
                <Separator />

                <div className="grid gap-6">
                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>{t('settings.general.theme.mode')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.general.theme.modeDescription')}
                            </p>
                        </div>
                        <Select value={theme} onValueChange={(value) => setTheme(value)}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('settings.general.theme.selectModePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <div className="flex items-center gap-2">
                                        <Sun className="h-4 w-4" />
                                        <span>{t('settings.general.theme.light')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="dark">
                                    <div className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" />
                                        <span>{t('settings.general.theme.dark')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="system">
                                    <div className="flex items-center gap-2">
                                        <Laptop className="h-4 w-4" />
                                        <span>{t('settings.general.theme.system')}</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Color Theme */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>{t('settings.general.theme.colorTheme')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.general.theme.colorThemeDescription')}
                            </p>
                        </div>
                        <Select value={selectedThemeKey} onValueChange={applyTheme}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('settings.general.theme.selectColorPlaceholder')}>
                                    {(() => {
                                        const allThemes = [defaultTheme, ...themePresets]
                                        const selected = allThemes.find(p => p.key === selectedThemeKey)
                                        if (!selected) return null
                                        return (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{selected.emoji}</span>
                                                <div
                                                    className="w-3 h-3 rounded-full border shadow-sm ring-1 ring-black/5"
                                                    style={{ backgroundColor: `hsl(${selected.light.primary})` }}
                                                />
                                                <span>{t(`settings.general.theme.themes.${selected.key}`) || selected.name}</span>
                                            </div>
                                        )
                                    })()}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {(() => {
                                    const allThemes = [defaultTheme, ...themePresets]
                                    const mono = allThemes.find(t => t.key === 'mono')
                                    const others = allThemes.filter(t => t.key !== 'mono' && t.key !== 'default')
                                    const orderedThemes = mono
                                        ? [defaultTheme, mono, ...others]
                                        : allThemes
                                    return orderedThemes.map((preset) => {
                                        const isSelected = selectedThemeKey === preset.key
                                        return (
                                            <SelectItem
                                                key={preset.key}
                                                value={preset.key}
                                                className={cn(
                                                    'py-2.5',
                                                    isSelected && 'font-medium'
                                                )}
                                                style={isSelected ? { backgroundColor: `hsl(${preset.light.primary} / 0.1)` } : undefined}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">{preset.emoji}</span>
                                                    <div
                                                        className="w-3 h-3 rounded-full border shadow-sm ring-1 ring-black/5"
                                                        style={{ backgroundColor: `hsl(${preset.light.primary})` }}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{t(`settings.general.theme.themes.${preset.key}`) || preset.name}</span>
                                                        <span className="text-xs text-muted-foreground">{t(`settings.general.theme.themeDescriptions.${preset.key}`) || preset.description}</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        )
                                    })
                                })()}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Font */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>{t('settings.general.theme.fontFamily')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.general.theme.fontDescription')}
                            </p>
                        </div>
                        <Select value={selectedFont} onValueChange={handleFontChange}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('settings.general.theme.selectFontPlaceholder')}>
                                    {selectedFont}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Space Grotesk" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    <div className="flex items-center gap-2">
                                        <Type className="h-4 w-4" />
                                        <span>Space Grotesk</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Nunito" style={{ fontFamily: 'var(--font-nunito)' }}>
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <div className="flex items-center gap-2">
                                            <Type className="h-4 w-4" />
                                            <span>Nunito</span>
                                        </div>
                                        <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                            {t('settings.general.theme.themes.recommended')}
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Inter">
                                    <div className="flex items-center gap-2">
                                        <Type className="h-4 w-4" />
                                        <span>Inter</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="System UI" style={{ fontFamily: 'system-ui' }}>
                                    <div className="flex items-center gap-2">
                                        <Type className="h-4 w-4" />
                                        <span>System UI</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Font Size */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>{t('settings.general.theme.fontSize')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.general.theme.fontSizeDescription')}
                            </p>
                        </div>
                        <Select value={fontSize} onValueChange={handleFontSizeChange}>
                            <SelectTrigger className="w-[200px]">
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
                    </div>
                </div>
            </div>

            {/* Language Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('settings.general.language.sectionTitle')}</h2>
                <Separator />

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label>{t('settings.general.language.title')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('settings.general.language.description')}
                        </p>
                    </div>
                    <Select value={lang} onValueChange={(value) => {
                        setLang(value as any)
                        toast.success(t('settings.general.language.updated'))
                    }}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t('settings.general.language.selectPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGS.map((item) => (
                                <SelectItem key={item.code} value={item.code}>
                                    <div className="flex items-center gap-2">
                                        <span>{item.label}</span>
                                        <span className="text-xs text-muted-foreground">({item.code.toUpperCase()})</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
