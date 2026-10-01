"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings, AppearanceSettings } from "@/components/settings/general-settings"
import { AccountSettings } from "@/components/settings/account-settings"
import { SETTINGS_SECTIONS, type SettingsSectionId } from "@/features/settings/settings-sections"
import { useI18n } from '@/contexts/i18n-context'
import { cn } from "@/lib/utils"

export default function SettingsPanel() {
    const { t } = useI18n()
    const [active, setActive] = useState<SettingsSectionId>('general')
    const current = SETTINGS_SECTIONS.find((s) => s.id === active)!

    return (
        <div className="flex h-[min(640px,90dvh)] flex-col md:flex-row">
            <aside className="shrink-0 border-b border-border px-5 pt-5 md:w-56 md:border-b-0 md:border-r md:px-3 md:py-6">
                <h1 className="font-heading text-[1.375rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink md:px-3">
                    {t('settings.title')}
                </h1>

                <Tabs value={active} onValueChange={(v) => setActive(v as SettingsSectionId)} className="mt-4 md:hidden">
                    <TabsList>
                        {SETTINGS_SECTIONS.map((s) => (
                            <TabsTrigger key={s.id} value={s.id}>{t(s.labelKey)}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <nav aria-label={t('settings.title')} className="mt-5 hidden flex-col gap-0.5 md:flex">
                    {SETTINGS_SECTIONS.map(({ id, labelKey, Icon }) => (
                        <button
                            key={id}
                            type="button"
                            aria-current={active === id ? 'page' : undefined}
                            onClick={() => setActive(id)}
                            className={cn(
                                'flex h-9 items-center gap-2.5 rounded px-3 text-left text-[0.875rem] transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/40',
                                active === id
                                    ? 'bg-surface-raised font-semibold text-ink'
                                    : 'font-medium text-ink-secondary hover:bg-surface-hover hover:text-ink',
                            )}
                        >
                            <Icon size={16} aria-hidden />
                            {t(labelKey)}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-6 md:px-8 md:pt-8">
                <h2 className="mb-5 font-heading text-lg font-bold tracking-[-0.02em] text-ink max-md:sr-only">
                    {t(current.labelKey)}
                </h2>
                {active === 'general' && <GeneralSettings />}
                {active === 'appearance' && <AppearanceSettings />}
                {active === 'account' && <AccountSettings />}
            </main>
        </div>
    )
}
