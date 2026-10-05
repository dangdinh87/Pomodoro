"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconTile } from "@/components/ui/icon-tile"
import { GeneralSettings } from "@/components/settings/general-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { AccountSettings } from "@/components/settings/account-settings"
import { SETTINGS_SECTIONS, type SettingsSectionId } from "@/features/settings/settings-sections"
import { useI18n } from '@/contexts/i18n-context'
import { cn } from "@/lib/utils"

export default function SettingsPanel() {
    const { t } = useI18n()
    const [active, setActive] = useState<SettingsSectionId>('general')
    const current = SETTINGS_SECTIONS.find((s) => s.id === active)!
    const content = useRef<HTMLElement>(null)

    // The content scrolls, the sections do not: opening a section from the middle of another one would land
    // halfway down it, with its first rows (and the theme switch) out of sight.
    useLayoutEffect(() => {
        if (content.current) content.current.scrollTop = 0
    }, [active])

    return (
        <div className="flex h-[min(640px,90dvh)] flex-col md:flex-row">
            <aside className="shrink-0 border-b-2 border-border bg-surface-raised px-5 pb-4 pt-5 md:w-60 md:border-b-0 md:border-r-2 md:px-4 md:py-6">
                <h1 className="font-heading text-2xl font-extrabold leading-[1.1] tracking-[-0.02em] text-ink md:px-2">
                    {t('settings.title')}
                </h1>

                <Tabs value={active} onValueChange={(v) => setActive(v as SettingsSectionId)} className="mt-4 md:hidden">
                    <TabsList>
                        {SETTINGS_SECTIONS.map((s) => (
                            <TabsTrigger key={s.id} value={s.id}>{t(s.labelKey)}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <nav aria-label={t('settings.title')} className="mt-5 hidden flex-col gap-2 md:flex">
                    {SETTINGS_SECTIONS.map(({ id, labelKey, Icon, tone }) => (
                        <button
                            key={id}
                            type="button"
                            aria-current={active === id ? 'page' : undefined}
                            onClick={() => setActive(id)}
                            className={cn(
                                // the current section is a small sticker lifted off the tray; the others stay flat
                                'focus-ring flex h-11 items-center gap-2.5 rounded-xl border-2 px-2 text-left font-heading text-[0.9375rem] font-bold transition-[background-color,box-shadow] duration-100 focus-visible:outline-offset-2',
                                active === id
                                    ? 'border-outline bg-surface text-ink shadow-sticker-sm'
                                    : 'border-transparent text-ink-secondary hover:bg-surface-hover hover:text-ink',
                            )}
                        >
                            <IconTile icon={Icon} tone={tone} size="sm" />
                            {t(labelKey)}
                        </button>
                    ))}
                </nav>
            </aside>

            <main ref={content} className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-6 md:px-8 md:pt-8">
                <h2 className="mb-5 font-heading text-xl font-extrabold tracking-[-0.02em] text-ink max-md:sr-only">
                    {t(current.labelKey)}
                </h2>
                {active === 'general' && <GeneralSettings />}
                {active === 'appearance' && <AppearanceSettings />}
                {active === 'account' && <AccountSettings />}
            </main>
        </div>
    )
}
