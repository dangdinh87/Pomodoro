"use client"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/components/animate-ui/components/animate/tabs"
import { GeneralSettings } from "@/components/settings/general-settings"
import { TimerSettings } from "@/components/settings/timer-settings"
import { BackgroundSettings } from "@/components/settings/background-settings"
import { useI18n } from '@/contexts/i18n-context'

export default function SettingsPage() {
    const { t } = useI18n()

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
                <p className="text-muted-foreground">
                    {t('settings.subtitle')}
                </p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start h-auto p-1">
                    <TabsTrigger value="general" className="flex-1">{t('settings.tabs.general')}</TabsTrigger>
                    <TabsTrigger value="timer" className="flex-1">{t('settings.tabs.timer')}</TabsTrigger>
                    <TabsTrigger value="background" className="flex-1">{t('settings.tabs.background')}</TabsTrigger>
                </TabsList>
                <TabsContents className="mt-6">
                    <TabsContent value="general" className="px-1">
                        <GeneralSettings />
                    </TabsContent>
                    <TabsContent value="timer" className="px-1">
                        <TimerSettings />
                    </TabsContent>
                    <TabsContent value="background" className="px-1">
                        <BackgroundSettings />
                    </TabsContent>
                </TabsContents>
            </Tabs >
        </div >
    )
}
