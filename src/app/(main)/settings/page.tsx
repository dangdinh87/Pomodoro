"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageContainer, PageHeader } from "@/components/ui/page-header"
import { GeneralSettings } from "@/components/settings/general-settings"
import { TimerSettings } from "@/components/settings/timer-settings"
import { BackgroundSettings } from "@/components/settings/background-settings"
import { useI18n } from '@/contexts/i18n-context'

export default function SettingsPage() {
    const { t } = useI18n()

    return (
        <PageContainer size="narrow">
            <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />

            <Tabs defaultValue="general" className="w-full">
                <TabsList>
                    <TabsTrigger value="general">{t('settings.tabs.general')}</TabsTrigger>
                    <TabsTrigger value="timer">{t('settings.tabs.timer')}</TabsTrigger>
                    <TabsTrigger value="background">{t('settings.tabs.background')}</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-6">
                    <GeneralSettings />
                </TabsContent>
                <TabsContent value="timer" className="mt-6">
                    <TimerSettings />
                </TabsContent>
                <TabsContent value="background" className="mt-6">
                    <BackgroundSettings />
                </TabsContent>
            </Tabs>
        </PageContainer>
    )
}
